import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// GET comments for a game
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: gameId } = await params;
  const supabase = await createClient();

  const { data: comments, error } = await supabase
    .from("comments")
    .select(`
      id,
      content,
      created_at,
      parent_id,
      user_id,
      profiles!comments_user_id_fkey (
        handle,
        display_name,
        avatar_url
      )
    `)
    .eq("game_id", gameId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform to include profile info directly
  const transformedComments = comments?.map(comment => ({
    id: comment.id,
    content: comment.content,
    created_at: comment.created_at,
    parent_id: comment.parent_id,
    user_id: comment.user_id,
    user: Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles,
  })) || [];

  return NextResponse.json({ comments: transformedComments });
}

// POST a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: gameId } = await params;
  const { content, parentId } = await request.json();
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit by user ID
  const rateLimit = checkRateLimit(`comments:${user.id}`, RATE_LIMITS.comments);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many comments. Please wait before posting again." },
      { status: 429 }
    );
  }

  // Validate content
  if (!content || content.trim().length < 1) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }
  if (content.length > 1000) {
    return NextResponse.json({ error: "Comment too long (max 1000 chars)" }, { status: 400 });
  }

  // Insert comment
  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      game_id: gameId,
      user_id: user.id,
      content: content.trim(),
      parent_id: parentId || null,
    })
    .select(`
      id,
      content,
      created_at,
      parent_id,
      user_id,
      profiles!comments_user_id_fkey (
        handle,
        display_name,
        avatar_url
      )
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    comment: {
      ...comment,
      user: Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles,
    }
  });
}

// DELETE a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get("commentId");
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership or admin status
  const { data: comment } = await supabase
    .from("comments")
    .select("user_id")
    .eq("id", commentId)
    .single();

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin === true;
  const isOwner = comment.user_id === user.id;

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Delete comment
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
