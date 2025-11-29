import { redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Rss, Gamepad2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game/game-card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your Feed",
  description: "See the latest games from creators you follow.",
};

export default async function FeedPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Get creators the user follows
  const { data: following } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  const followingIds = following?.map(f => f.following_id) || [];

  if (followingIds.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Rss className="h-8 w-8 text-neon-cyan" />
          <h1 className="font-heading text-3xl font-bold">Your Feed</h1>
        </div>

        <div className="text-center py-16 bg-card rounded-lg border border-border">
          <UserPlus className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Follow some creators</h3>
          <p className="text-muted-foreground mb-6">
            Your feed will show new games from creators you follow.
          </p>
          <Button asChild>
            <Link href="/creators">
              <UserPlus className="h-4 w-4 mr-2" />
              Browse Creators
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Get recent games from followed creators
  const { data: gamesData } = await supabase
    .from("games")
    .select("*")
    .in("creator_id", followingIds)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  // Get creator profiles
  const { data: creators } = await supabase
    .from("profiles")
    .select("id, handle, display_name")
    .in("id", followingIds);

  const creatorsMap = new Map(creators?.map(c => [c.id, c]) || []);

  // Get game scores
  const gameIds = gamesData?.map(g => g.id) || [];
  const { data: scoresData } = await supabase
    .from("game_scores")
    .select("game_id, play_count, total_reactions, tier, weighted_score")
    .in("game_id", gameIds.length > 0 ? gameIds : ["none"]);

  const scoresMap = new Map(scoresData?.map(s => [s.game_id, s]) || []);

  // Transform games
  const games = (gamesData || []).map(game => {
    const creator = creatorsMap.get(game.creator_id);
    const scores = scoresMap.get(game.id);
    return {
      ...game,
      creator: creator || { handle: "unknown", display_name: "Unknown" },
      tier: scores?.tier || "NEW",
      score: scores?.weighted_score || 0,
      play_count: scores?.play_count || 0,
      reaction_count: scores?.total_reactions || 0,
    };
  });

  // Group by date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groupedGames = {
    today: games.filter(g => new Date(g.published_at) >= new Date(today.setHours(0, 0, 0, 0))),
    yesterday: games.filter(g => {
      const date = new Date(g.published_at);
      return date >= new Date(yesterday.setHours(0, 0, 0, 0)) && date < new Date(today.setHours(0, 0, 0, 0));
    }),
    thisWeek: games.filter(g => {
      const date = new Date(g.published_at);
      return date >= lastWeek && date < new Date(yesterday.setHours(0, 0, 0, 0));
    }),
    older: games.filter(g => new Date(g.published_at) < lastWeek),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Rss className="h-8 w-8 text-neon-cyan" />
          <div>
            <h1 className="font-heading text-3xl font-bold">Your Feed</h1>
            <p className="text-muted-foreground">
              Following {followingIds.length} creator{followingIds.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/creators">Find More</Link>
        </Button>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg border border-border">
          <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No new games yet</h3>
          <p className="text-muted-foreground">
            The creators you follow haven't published any games yet. Check back later!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedGames.today.length > 0 && (
            <section>
              <h2 className="font-heading text-xl font-semibold mb-4 text-neon-cyan">Today</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupedGames.today.map(game => (
                  <GameCard key={game.id} game={game as any} />
                ))}
              </div>
            </section>
          )}

          {groupedGames.yesterday.length > 0 && (
            <section>
              <h2 className="font-heading text-xl font-semibold mb-4">Yesterday</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupedGames.yesterday.map(game => (
                  <GameCard key={game.id} game={game as any} />
                ))}
              </div>
            </section>
          )}

          {groupedGames.thisWeek.length > 0 && (
            <section>
              <h2 className="font-heading text-xl font-semibold mb-4">This Week</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupedGames.thisWeek.map(game => (
                  <GameCard key={game.id} game={game as any} />
                ))}
              </div>
            </section>
          )}

          {groupedGames.older.length > 0 && (
            <section>
              <h2 className="font-heading text-xl font-semibold mb-4">Older</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupedGames.older.map(game => (
                  <GameCard key={game.id} game={game as any} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
