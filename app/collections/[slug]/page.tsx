import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FolderOpen, Gamepad2 } from "lucide-react";
import { GameCard } from "@/components/game/game-card";
import { createClient } from "@/lib/supabase/server";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch collection
  const { data: collection, error } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (error || !collection) {
    notFound();
  }

  // Fetch creator
  const { data: creator } = await supabase
    .from("profiles")
    .select("handle, display_name, avatar_url")
    .eq("id", collection.creator_id)
    .single();

  // Fetch games in collection
  const { data: collectionGames } = await supabase
    .from("collection_games")
    .select("game_id, position")
    .eq("collection_id", collection.id)
    .order("position", { ascending: true });

  const gameIds = collectionGames?.map(cg => cg.game_id) || [];

  const { data: gamesData } = await supabase
    .from("games")
    .select("*")
    .in("id", gameIds.length > 0 ? gameIds : ["none"])
    .eq("status", "published");

  // Fetch game creators
  const gameCreatorIds = [...new Set(gamesData?.map(g => g.creator_id) || [])];
  const { data: gameCreators } = await supabase
    .from("profiles")
    .select("id, handle, display_name")
    .in("id", gameCreatorIds.length > 0 ? gameCreatorIds : ["none"]);

  const creatorsMap = new Map(gameCreators?.map(c => [c.id, c]) || []);

  // Order games by position
  const games = gameIds.map(id => {
    const game = gamesData?.find(g => g.id === id);
    if (!game) return null;
    return {
      ...game,
      creator: creatorsMap.get(game.creator_id) || { handle: "unknown", display_name: "Unknown" },
      tier: "NEW",
      score: 0,
      play_count: 0,
      reaction_count: 0,
    };
  }).filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/collections" className="hover:text-primary">Collections</Link>
          <span>/</span>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="text-muted-foreground mb-4">{collection.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {creator && (
            <Link href={`/u/${creator.handle}`} className="hover:text-primary">
              Curated by @{creator.handle}
            </Link>
          )}
          <span className="flex items-center gap-1">
            <Gamepad2 className="h-4 w-4" />
            {games.length} games
          </span>
        </div>
      </div>

      {/* Games */}
      {games.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <div key={game!.id} className="relative">
              <div className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                {index + 1}
              </div>
              <GameCard game={game as any} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No games in this collection</h3>
        </div>
      )}
    </div>
  );
}
