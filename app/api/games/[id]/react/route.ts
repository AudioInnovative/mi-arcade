import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const VALID_REACTIONS = ["none", "like", "love", "favorite"] as const;
type ReactionType = typeof VALID_REACTIONS[number];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: gameId } = await params;
  const { reaction } = await request.json();
  const supabase = await createClient();

  // Validate reaction type
  if (!VALID_REACTIONS.includes(reaction as ReactionType)) {
    return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit by user ID
  const rateLimit = checkRateLimit(`reactions:${user.id}`, RATE_LIMITS.api);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  // Check if user already has a reaction for this game
  const { data: existing } = await supabase
    .from("reactions")
    .select("id, reaction")
    .eq("user_id", user.id)
    .eq("game_id", gameId)
    .single();

  const oldReaction = existing?.reaction || "none";

  if (reaction === "none") {
    // Remove reaction
    if (existing) {
      await supabase.from("reactions").delete().eq("id", existing.id);
    }
  } else if (existing) {
    // Update existing reaction
    await supabase
      .from("reactions")
      .update({ reaction, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    // Create new reaction
    await supabase.from("reactions").insert({
      user_id: user.id,
      game_id: gameId,
      reaction,
    });
  }

  // Update game_scores counts
  await updateGameScores(supabase, gameId, oldReaction, reaction);

  return NextResponse.json({ success: true, reaction });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: gameId } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ reaction: "none" });
  }

  // Get user's reaction for this game
  const { data } = await supabase
    .from("reactions")
    .select("reaction")
    .eq("user_id", user.id)
    .eq("game_id", gameId)
    .single();

  return NextResponse.json({ reaction: data?.reaction || "none" });
}

async function updateGameScores(
  supabase: any,
  gameId: string,
  oldReaction: string,
  newReaction: string
) {
  // Get current scores
  const { data: scores } = await supabase
    .from("game_scores")
    .select("*")
    .eq("game_id", gameId)
    .single();

  let likeCount = scores?.like_count || 0;
  let loveCount = scores?.love_count || 0;
  let favoriteCount = scores?.favorite_count || 0;

  // Decrement old reaction count
  if (oldReaction === "like") likeCount--;
  if (oldReaction === "love") loveCount--;
  if (oldReaction === "favorite") favoriteCount--;

  // Increment new reaction count
  if (newReaction === "like") likeCount++;
  if (newReaction === "love") loveCount++;
  if (newReaction === "favorite") favoriteCount++;

  const totalReactions = likeCount + loveCount + favoriteCount;
  
  // Calculate weighted score (favorites worth more)
  const weightedScore = likeCount * 1 + loveCount * 2 + favoriteCount * 3;
  
  // Calculate tier based on weighted score
  let tier = "NEW";
  if (weightedScore >= 100) tier = "S";
  else if (weightedScore >= 50) tier = "A";
  else if (weightedScore >= 20) tier = "B";
  else if (weightedScore >= 5) tier = "C";

  if (scores) {
    await supabase
      .from("game_scores")
      .update({
        like_count: likeCount,
        love_count: loveCount,
        favorite_count: favoriteCount,
        total_reactions: totalReactions,
        weighted_score: weightedScore,
        tier,
        updated_at: new Date().toISOString(),
      })
      .eq("game_id", gameId);
  } else {
    await supabase.from("game_scores").insert({
      game_id: gameId,
      like_count: likeCount,
      love_count: loveCount,
      favorite_count: favoriteCount,
      total_reactions: totalReactions,
      weighted_score: weightedScore,
      tier,
    });
  }
}
