"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  initialCount?: number;
  showCount?: boolean;
}

export function FollowButton({ 
  userId, 
  initialFollowing = false,
  initialCount = 0,
  showCount = false,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFollowing(initialFollowing);
    setCount(initialCount);
  }, [initialFollowing, initialCount]);

  const handleToggle = async () => {
    if (loading) return;

    setLoading(true);
    const wasFollowing = following;

    // Optimistic update
    setFollowing(!following);
    setCount(prev => following ? prev - 1 : prev + 1);

    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast({
            title: "Sign in required",
            description: "Please sign in to follow creators.",
            variant: "destructive",
          });
        } else {
          const data = await res.json();
          throw new Error(data.error);
        }
        // Revert
        setFollowing(wasFollowing);
        setCount(prev => wasFollowing ? prev + 1 : prev - 1);
        return;
      }

      const data = await res.json();
      setFollowing(data.following);
      toast({
        title: data.following ? "Following!" : "Unfollowed",
        description: data.following 
          ? "You'll see their new games in your feed." 
          : "You won't see their updates anymore.",
      });
    } catch (error) {
      setFollowing(wasFollowing);
      setCount(prev => wasFollowing ? prev + 1 : prev - 1);
      toast({
        title: "Error",
        description: "Failed to update follow status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={following ? "outline" : "default"}
      onClick={handleToggle}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : following ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {following ? "Following" : "Follow"}
      {showCount && count > 0 && (
        <span className="text-xs opacity-70">({count})</span>
      )}
    </Button>
  );
}
