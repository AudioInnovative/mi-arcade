import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Require authentication to prevent play count manipulation
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit by user ID - max 1 play per game per minute
  const rateLimit = checkRateLimit(`play:${user.id}:${id}`, { maxRequests: 1, windowMs: 60 * 1000 });
  if (!rateLimit.success) {
    // Silently succeed to not break UX, but don't increment
    return NextResponse.json({ success: true, rateLimited: true });
  }

  // Validate game ID format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  // Check if game_scores exists for this game
  const { data: existing } = await supabase
    .from("game_scores")
    .select("id, play_count")
    .eq("game_id", id)
    .single();

  if (existing) {
    // Increment play count
    await supabase
      .from("game_scores")
      .update({ play_count: (existing.play_count || 0) + 1 })
      .eq("game_id", id);
  } else {
    // Create new game_scores entry
    await supabase
      .from("game_scores")
      .insert({ game_id: id, play_count: 1 });
  }

  return NextResponse.json({ success: true });
}
