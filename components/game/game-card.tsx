import Link from "next/link";
import Image from "next/image";
import { Play, Heart } from "lucide-react";
import { cn, formatNumber, getTierBgColor, getTierColor } from "@/lib/utils";
import type { Game } from "@/types/database";

interface GameCardProps {
  game: Game & {
    creator?: {
      handle: string;
      display_name: string;
    };
    score?: number;
    tier?: string;
    play_count?: number;
    reaction_count?: number;
  };
  className?: string;
}

export function GameCard({ game, className }: GameCardProps) {
  const isNew = !game.score || game.tier === "NEW";

  return (
    <Link
      href={`/g/${game.slug}`}
      className={cn(
        "group relative flex flex-col rounded-xl bg-card border border-border overflow-hidden card-hover",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {game.thumbnail_url ? (
          <Image
            src={game.thumbnail_url}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Tier Badge */}
        <div className="absolute top-2 left-2">
          {isNew ? (
            <span className="px-2 py-1 text-xs font-bold rounded bg-neon-cyan/20 border border-neon-cyan text-neon-cyan">
              NEW
            </span>
          ) : (
            <span
              className={cn(
                "px-2 py-1 text-xs font-bold rounded border",
                getTierBgColor(game.tier || "F")
              )}
            >
              <span className={getTierColor(game.tier || "F")}>
                {game.tier} · {game.score}
              </span>
            </span>
          )}
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold">
            <Play className="h-5 w-5" />
            Play
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-heading font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {game.title}
        </h3>

        {game.creator && (
          <p className="text-sm text-muted-foreground">
            @{game.creator.handle}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto pt-2">
          <span className="flex items-center gap-1">
            <Play className="h-4 w-4" />
            {formatNumber(game.play_count || 0)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {formatNumber(game.reaction_count || 0)}
          </span>
        </div>
      </div>
    </Link>
  );
}
