"use client";

import { useState, useEffect } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  gameId: string;
  initialBookmarked?: boolean;
  variant?: "icon" | "full";
}

export function BookmarkButton({ 
  gameId, 
  initialBookmarked = false,
  variant = "full" 
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const handleToggle = async () => {
    if (loading) return;

    setLoading(true);
    const wasBookmarked = bookmarked;
    setBookmarked(!bookmarked); // Optimistic update

    try {
      const res = await fetch(`/api/games/${gameId}/bookmark`, {
        method: "POST",
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast({
            title: "Sign in required",
            description: "Please sign in to save games.",
            variant: "destructive",
          });
          setBookmarked(wasBookmarked);
        } else {
          throw new Error("Failed to save");
        }
        return;
      }

      const data = await res.json();
      setBookmarked(data.bookmarked);
      toast({
        title: data.bookmarked ? "Game saved!" : "Removed from saved",
        description: data.bookmarked 
          ? "Find it in your library." 
          : "Game removed from your library.",
      });
    } catch (error) {
      setBookmarked(wasBookmarked);
      toast({
        title: "Error",
        description: "Failed to save game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={loading}
        className={cn(bookmarked && "text-yellow-400")}
        title={bookmarked ? "Remove from saved" : "Save game"}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Bookmark className={cn("h-5 w-5", bookmarked && "fill-current")} />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "flex items-center gap-2",
        bookmarked && "bg-yellow-400/20 border-yellow-400 text-yellow-400"
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
      )}
      {bookmarked ? "Saved" : "Save"}
    </Button>
  );
}
