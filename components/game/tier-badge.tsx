import { cn, getTierBgColor, getTierColor } from "@/lib/utils";

interface TierBadgeProps {
  tier: string;
  score?: number;
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
  className?: string;
}

export function TierBadge({
  tier,
  score,
  size = "md",
  showScore = true,
  className,
}: TierBadgeProps) {
  const isNew = tier === "NEW";

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-lg px-4 py-2 font-bold",
  };

  if (isNew) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded border font-semibold",
          "bg-neon-cyan/20 border-neon-cyan text-neon-cyan",
          sizeClasses[size],
          className
        )}
      >
        NEW GAME
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border font-semibold",
        getTierBgColor(tier),
        sizeClasses[size],
        className
      )}
    >
      <span className={cn("font-bold", getTierColor(tier))}>{tier}</span>
      {showScore && score !== undefined && (
        <>
          <span className="text-muted-foreground">·</span>
          <span className={getTierColor(tier)}>{score}/100</span>
        </>
      )}
    </span>
  );
}
