import { redirect } from "next/navigation";
import { Bookmark, Gamepad2 } from "lucide-react";
import { GameCard } from "@/components/game/game-card";
import { createClient } from "@/lib/supabase/server";

export default async function LibraryPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch user's bookmarked games
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("game_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const gameIds = bookmarks?.map(b => b.game_id) || [];

  // Fetch the games
  const { data: gamesData } = await supabase
    .from("games")
    .select("*")
    .in("id", gameIds.length > 0 ? gameIds : ["none"])
    .eq("status", "published");

  // Fetch creators
  const creatorIds = [...new Set(gamesData?.map((g) => g.creator_id) || [])];
  const { data: creatorsData } = await supabase
    .from("profiles")
    .select("id, handle, display_name")
    .in("id", creatorIds.length > 0 ? creatorIds : ["none"]);

  const creatorsMap = new Map(creatorsData?.map((c) => [c.id, c]) || []);

  // Transform games with creator info, maintain bookmark order
  const games = gameIds.map(id => {
    const game = gamesData?.find(g => g.id === id);
    if (!game) return null;
    return {
      ...game,
      creator: creatorsMap.get(game.creator_id) || {
        handle: "unknown",
        display_name: "Unknown",
      },
      tier: "NEW",
      score: 0,
      play_count: 0,
      reaction_count: 0,
    };
  }).filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="h-8 w-8 text-yellow-400" />
          <h1 className="font-heading text-3xl md:text-4xl font-bold">
            My Library
          </h1>
        </div>
        <p className="text-muted-foreground">
          Games you've saved to play later
        </p>
      </div>

      {games.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard key={game!.id} game={game as any} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No saved games yet</h3>
          <p className="text-muted-foreground">
            Browse games and click the bookmark icon to save them here!
          </p>
        </div>
      )}
    </div>
  );
}
