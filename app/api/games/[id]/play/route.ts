import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

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
