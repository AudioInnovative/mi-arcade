import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { GameCard } from "@/components/game/game-card";
import { createClient } from "@/lib/supabase/server";

const GENRES = [
  "Action",
  "Adventure",
  "Arcade",
  "Board",
  "Card",
  "Casual",
  "Educational",
  "Fighting",
  "Horror",
  "Multiplayer",
  "Music",
  "Platformer",
  "Puzzle",
  "Racing",
  "RPG",
  "Shooter",
  "Simulation",
  "Sports",
  "Strategy",
];

interface GamesPageProps {
  searchParams: Promise<{ genre?: string }>;
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const { genre } = await searchParams;
  const supabase = await createClient();

  // Build query
  let query = supabase
    .from("games")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  // Filter by genre if provided
  if (genre) {
    query = query.contains("genres", [genre]);
  }

  const { data: gamesData } = await query;

  // Fetch creators for these games
  const creatorIds = [...new Set(gamesData?.map((g) => g.creator_id) || [])];
  const { data: creatorsData } = await supabase
    .from("profiles")
    .select("id, handle, display_name")
    .in("id", creatorIds.length > 0 ? creatorIds : ["none"]);

  // Create a map of creator_id to creator
  const creatorsMap = new Map(creatorsData?.map((c) => [c.id, c]) || []);

  // Transform games with creator info
  const games = (gamesData || []).map((game) => ({
    ...game,
    creator: creatorsMap.get(game.creator_id) || {
      handle: "unknown",
      display_name: "Unknown",
    },
    tier: "NEW",
    score: 0,
    play_count: 0,
    reaction_count: 0,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
          Browse Games
        </h1>
        <p className="text-muted-foreground">
          Discover amazing games from creators around the world
        </p>
      </div>

      {/* Genre Filter */}
      <div className="mb-8">
        <h2 className="font-semibold mb-3">Filter by Genre</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/games"
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              !genre
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border hover:border-primary/50"
            }`}
          >
            All
          </Link>
          {GENRES.map((g) => (
            <Link
              key={g}
              href={`/games?genre=${g}`}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                genre === g
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {g}
            </Link>
          ))}
        </div>
      </div>

      {/* Games Grid */}
      {games.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No games found</h3>
          <p className="text-muted-foreground">
            {genre
              ? `No games in the "${genre}" genre yet.`
              : "Be the first to publish a game!"}
          </p>
        </div>
      )}
    </div>
  );
}
