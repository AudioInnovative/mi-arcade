import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET bookmark status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: gameId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ bookmarked: false });
  }

  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("game_id", gameId)
    .single();

  return NextResponse.json({ bookmarked: !!data });
}

// POST to toggle bookmark
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: gameId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if already bookmarked
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("game_id", gameId)
    .single();

  if (existing) {
    // Remove bookmark
    await supabase.from("bookmarks").delete().eq("id", existing.id);
    return NextResponse.json({ bookmarked: false });
  } else {
    // Add bookmark
    await supabase.from("bookmarks").insert({
      user_id: user.id,
      game_id: gameId,
    });
    return NextResponse.json({ bookmarked: true });
  }
}
