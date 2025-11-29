"use client";

import { useEffect } from "react";

export function PlayTracker({ gameId }: { gameId: string }) {
  useEffect(() => {
    // Track play on mount (debounced to prevent double-counting)
    const trackPlay = async () => {
      try {
        await fetch(`/api/games/${gameId}/play`, { method: "POST" });
      } catch (error) {
        console.error("Failed to track play:", error);
      }
    };

    // Small delay to ensure it's a real page view
    const timer = setTimeout(trackPlay, 2000);
    return () => clearTimeout(timer);
  }, [gameId]);

  return null;
}
