import { Gamepad2, TrendingUp } from "lucide-react";
import { GameCard } from "@/components/game/game-card";
import { createClient } from "@/lib/supabase/server";

export default async function TrendingPage() {
  const supabase = await createClient();

  // Fetch games with their scores, ordered by play count
  const { data: scoresData } = await supabase
    .from("game_scores")
    .select("game_id, play_count, total_reactions, tier, weighted_score")
    .order("play_count", { ascending: false })
    .limit(20);

  // Get the game IDs that have scores
  const gameIds = scoresData?.map(s => s.game_id) || [];

  // Fetch the games
  const { data: gamesData } = await supabase
    .from("games")
    .select("*")
    .eq("status", "published")
    .in("id", gameIds.length > 0 ? gameIds : ["none"]);

  // Also fetch games without scores (newest first) to fill the list
  const { data: newGamesData } = await supabase
    .from("games")
    .select("*")
    .eq("status", "published")
    .not("id", "in", `(${gameIds.length > 0 ? gameIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
    .order("created_at", { ascending: false })
    .limit(20);

  // Combine and create scores map
  const scoresMap = new Map(scoresData?.map(s => [s.game_id, s]) || []);

  // Fetch creators for all games
  const allGames = [...(gamesData || []), ...(newGamesData || [])];
  const creatorIds = [...new Set(allGames.map((g) => g.creator_id))];
  const { data: creatorsData } = await supabase
    .from("profiles")
    .select("id, handle, display_name")
    .in("id", creatorIds.length > 0 ? creatorIds : ["none"]);

  const creatorsMap = new Map(creatorsData?.map((c) => [c.id, c]) || []);

  // Sort games by play count (games with scores first, then new games)
  const sortedGames = [
    ...(gamesData || []).sort((a, b) => {
      const aPlays = scoresMap.get(a.id)?.play_count || 0;
      const bPlays = scoresMap.get(b.id)?.play_count || 0;
      return bPlays - aPlays;
    }),
    ...(newGamesData || []),
  ];

  // Transform games with creator and score info
  const games = sortedGames.map((game) => {
    const scores = scoresMap.get(game.id);
    return {
      ...game,
      creator: creatorsMap.get(game.creator_id) || {
        handle: "unknown",
        display_name: "Unknown",
      },
      tier: scores?.tier || "NEW",
      score: scores?.weighted_score || 0,
      play_count: scores?.play_count || 0,
      reaction_count: scores?.total_reactions || 0,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-8 w-8 text-neon-cyan" />
          <h1 className="font-heading text-3xl md:text-4xl font-bold">
            Trending
          </h1>
        </div>
        <p className="text-muted-foreground">
          The most popular games on Mi Arcade right now
        </p>
      </div>

      {games.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <div key={game.id} className="relative">
              {index < 3 && (
                <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              )}
              <GameCard game={game} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No trending games yet</h3>
          <p className="text-muted-foreground">
            Be the first to publish a game and start the trend!
          </p>
        </div>
      )}
    </div>
  );
}
