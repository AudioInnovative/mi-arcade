"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, Heart, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type ReactionType = "none" | "like" | "love" | "favorite";

interface ReactionBarProps {
  gameId: string;
  initialReaction?: ReactionType;
  disabled?: boolean;
  counts?: {
    like: number;
    love: number;
    favorite: number;
  };
}

const reactions = [
  {
    type: "like" as const,
    icon: ThumbsUp,
    label: "Like",
    activeColor: "text-blue-400",
    activeBg: "bg-blue-400/20 border-blue-400",
  },
  {
    type: "love" as const,
    icon: Heart,
    label: "Love",
    activeColor: "text-pink-400",
    activeBg: "bg-pink-400/20 border-pink-400",
  },
  {
    type: "favorite" as const,
    icon: Star,
    label: "Favorite",
    activeColor: "text-yellow-400",
    activeBg: "bg-yellow-400/20 border-yellow-400",
  },
];

export function ReactionBar({
  gameId,
  initialReaction = "none",
  disabled = false,
  counts = { like: 0, love: 0, favorite: 0 },
}: ReactionBarProps) {
  const [selected, setSelected] = useState<ReactionType>(initialReaction);
  const [loading, setLoading] = useState(false);
  const [localCounts, setLocalCounts] = useState(counts);
  const { toast } = useToast();

  useEffect(() => {
    setSelected(initialReaction);
  }, [initialReaction]);

  const handleReaction = async (type: ReactionType) => {
    if (loading) return;

    const newReaction = selected === type ? "none" : type;
    const oldReaction = selected;

    // Optimistic update
    setSelected(newReaction);
    setLocalCounts(prev => {
      const updated = { ...prev };
      if (oldReaction !== "none") {
        updated[oldReaction] = Math.max(0, updated[oldReaction] - 1);
      }
      if (newReaction !== "none") {
        updated[newReaction] = updated[newReaction] + 1;
      }
      return updated;
    });

    setLoading(true);
    try {
      const res = await fetch(`/api/games/${gameId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction: newReaction }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          toast({
            title: "Sign in required",
            description: "Please sign in to react to games.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error || "Failed to save reaction");
        }
        // Revert on error
        setSelected(oldReaction);
        setLocalCounts(counts);
      }
    } catch (error) {
      // Revert on error
      setSelected(oldReaction);
      setLocalCounts(counts);
      toast({
        title: "Error",
        description: "Failed to save reaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {reactions.map(({ type, icon: Icon, label, activeColor, activeBg }) => {
        const isActive = selected === type;
        const count = localCounts[type];
        return (
          <Button
            key={type}
            variant="outline"
            size="lg"
            disabled={disabled || loading}
            onClick={() => handleReaction(type)}
            className={cn(
              "flex items-center gap-2 transition-all",
              isActive && activeBg,
              isActive && "shadow-[0_0_15px_rgba(0,0,0,0.3)]"
            )}
            aria-label={`${label} this game`}
            aria-pressed={isActive}
          >
            {loading && isActive ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? activeColor : "text-muted-foreground",
                  isActive && "fill-current"
                )}
              />
            )}
            <span className={cn(isActive && activeColor)}>{label}</span>
            {count > 0 && (
              <span className="text-xs text-muted-foreground">({count})</span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
