"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Send, Trash2, Loader2, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  user_id: string;
  user: {
    handle: string;
    display_name: string;
    avatar_url: string | null;
  };
}

interface CommentsProps {
  gameId: string;
  currentUserId?: string;
}

export function Comments({ gameId, currentUserId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const { toast } = useToast();

  // Fetch comments
  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/games/${gameId}/comments`);
        const data = await res.json();
        setComments(data.comments || []);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchComments();
  }, [gameId]);

  // Submit comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/games/${gameId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          parentId: replyTo?.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          toast({
            title: "Sign in required",
            description: "Please sign in to comment.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      const data = await res.json();
      setComments([...comments, data.comment]);
      setNewComment("");
      setReplyTo(null);
      toast({ title: "Comment posted!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;

    try {
      const res = await fetch(`/api/games/${gameId}/comments?commentId=${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setComments(comments.filter(c => c.id !== commentId));
        toast({ title: "Comment deleted" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive",
      });
    }
  };

  // Organize comments into threads
  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`flex gap-3 ${isReply ? "ml-12 mt-3" : ""}`}>
      <Link href={`/u/${comment.user.handle}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.avatar_url || undefined} />
          <AvatarFallback className="text-xs">
            {comment.user.display_name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link 
            href={`/u/${comment.user.handle}`}
            className="font-medium text-sm hover:text-primary transition-colors"
          >
            {comment.user.display_name}
          </Link>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
          {comment.content}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {!isReply && (
            <button
              onClick={() => setReplyTo(comment)}
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
          )}
          {currentUserId === comment.user_id && (
            <button
              onClick={() => handleDelete(comment.id)}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h2 className="font-heading text-xl font-semibold">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {replyTo && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded">
            <span>Replying to <strong>{replyTo.user.display_name}</strong></span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="ml-auto hover:text-primary"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex gap-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={1000}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {newComment.length}/1000
          </span>
          <Button type="submit" disabled={!newComment.trim() || submitting}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Post
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topLevelComments.map((comment) => (
            <div key={comment.id}>
              <CommentItem comment={comment} />
              {/* Replies */}
              {getReplies(comment.id).map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
