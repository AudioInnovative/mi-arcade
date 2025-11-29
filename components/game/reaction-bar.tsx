"use client";

import { useState } from "react";
import { ThumbsUp, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactionType } from "@/types/database";

interface ReactionBarProps {
  currentReaction?: ReactionType;
  onReactionChange?: (reaction: ReactionType) => void;
  disabled?: boolean;
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
  currentReaction = "none",
  onReactionChange,
  disabled = false,
}: ReactionBarProps) {
  const [selected, setSelected] = useState<ReactionType>(currentReaction);

  const handleReaction = (type: ReactionType) => {
    const newReaction = selected === type ? "none" : type;
    setSelected(newReaction);
    onReactionChange?.(newReaction);
  };

  return (
    <div className="flex items-center gap-2">
      {reactions.map(({ type, icon: Icon, label, activeColor, activeBg }) => {
        const isActive = selected === type;
        return (
          <Button
            key={type}
            variant="outline"
            size="lg"
            disabled={disabled}
            onClick={() => handleReaction(type)}
            className={cn(
              "flex items-center gap-2 transition-all",
              isActive && activeBg,
              isActive && "shadow-[0_0_15px_rgba(0,0,0,0.3)]"
            )}
            aria-label={`${label} this game`}
            aria-pressed={isActive}
          >
            <Icon
              className={cn(
                "h-5 w-5 transition-colors",
                isActive ? activeColor : "text-muted-foreground",
                isActive && "fill-current"
              )}
            />
            <span className={cn(isActive && activeColor)}>{label}</span>
          </Button>
        );
      })}
    </div>
  );
}
