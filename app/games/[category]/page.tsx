import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game/game-card";
import { BannerAd } from "@/components/ads/ad-unit";
import { createClient } from "@/lib/supabase/server";

// Valid categories/genres
const CATEGORIES: Record<string, { title: string; description: string; icon?: string }> = {
  action: {
    title: "Action Games",
    description: "Fast-paced action games with exciting gameplay and intense moments.",
  },
  adventure: {
    title: "Adventure Games",
    description: "Explore vast worlds and embark on epic adventures.",
  },
  arcade: {
    title: "Arcade Games",
    description: "Classic arcade-style games with simple, addictive gameplay.",
  },
  board: {
    title: "Board Games",
    description: "Digital versions of classic board games and new creations.",
  },
  card: {
    title: "Card Games",
    description: "Card games from poker to collectible card games.",
  },
  casual: {
    title: "Casual Games",
    description: "Easy to pick up games perfect for quick play sessions.",
  },
  educational: {
    title: "Educational Games",
    description: "Learn while you play with educational games.",
  },
  fighting: {
    title: "Fighting Games",
    description: "Battle opponents in intense fighting games.",
  },
  horror: {
    title: "Horror Games",
    description: "Scary games that will keep you on the edge of your seat.",
  },
  multiplayer: {
    title: "Multiplayer Games",
    description: "Play with friends or compete against players online.",
  },
  music: {
    title: "Music & Rhythm Games",
    description: "Rhythm-based games with great soundtracks.",
  },
  platformer: {
    title: "Platformer Games",
    description: "Jump, run, and navigate through challenging levels.",
  },
  puzzle: {
    title: "Puzzle Games",
    description: "Brain-teasing puzzles to challenge your mind.",
  },
  racing: {
    title: "Racing Games",
    description: "Speed through tracks and compete for the best time.",
  },
  rpg: {
    title: "RPG Games",
    description: "Role-playing games with deep stories and character progression.",
  },
  shooter: {
    title: "Shooter Games",
    description: "Action-packed shooting games.",
  },
  simulation: {
    title: "Simulation Games",
    description: "Simulate real-world activities and scenarios.",
  },
  sports: {
    title: "Sports Games",
    description: "Play your favorite sports virtually.",
  },
  strategy: {
    title: "Strategy Games",
    description: "Plan, build, and conquer in strategy games.",
  },
};

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryData = CATEGORIES[category.toLowerCase()];

  if (!categoryData) {
    return { title: "Category Not Found | Mi Arcade" };
  }

  return {
    title: categoryData.title,
    description: categoryData.description,
    openGraph: {
      title: `${categoryData.title} | Mi Arcade`,
      description: categoryData.description,
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({
    category,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryKey = category.toLowerCase();
  const categoryData = CATEGORIES[categoryKey];

  if (!categoryData) {
    notFound();
  }

  const supabase = await createClient();

  // Fetch games in this category
  const { data: gamesData } = await supabase
    .from("games")
    .select("*")
    .eq("status", "published")
    .contains("genres", [category.charAt(0).toUpperCase() + category.slice(1)])
    .order("created_at", { ascending: false });

  // Get creator info
  const creatorIds = [...new Set(gamesData?.map(g => g.creator_id) || [])];
  const { data: creators } = await supabase
    .from("profiles")
    .select("id, handle, display_name")
    .in("id", creatorIds.length > 0 ? creatorIds : ["none"]);

  const creatorsMap = new Map(creators?.map(c => [c.id, c]) || []);

  // Get game scores
  const gameIds = gamesData?.map(g => g.id) || [];
  const { data: scoresData } = await supabase
    .from("game_scores")
    .select("game_id, play_count, total_reactions, tier, weighted_score")
    .in("game_id", gameIds.length > 0 ? gameIds : ["none"]);

  const scoresMap = new Map(scoresData?.map(s => [s.game_id, s]) || []);

  // Transform games
  const games = (gamesData || []).map(game => ({
    ...game,
    creator: creatorsMap.get(game.creator_id) || { handle: "unknown", display_name: "Unknown" },
    tier: scoresMap.get(game.id)?.tier || "NEW",
    score: scoresMap.get(game.id)?.weighted_score || 0,
    play_count: scoresMap.get(game.id)?.play_count || 0,
    reaction_count: scoresMap.get(game.id)?.total_reactions || 0,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/games">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Games
          </Link>
        </Button>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
          {categoryData.title}
        </h1>
        <p className="text-muted-foreground text-lg">
          {categoryData.description}
        </p>
      </div>

      {/* Ad Banner */}
      <BannerAd className="mb-8" />

      {/* Games Grid */}
      {games.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg border border-border">
          <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No games yet</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to publish a {category} game!
          </p>
          <Button asChild>
            <Link href="/dashboard">Add a Game</Link>
          </Button>
        </div>
      )}

      {/* Related Categories */}
      <div className="mt-12">
        <h2 className="font-heading text-xl font-semibold mb-4">Browse Other Categories</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORIES)
            .filter(([key]) => key !== categoryKey)
            .slice(0, 8)
            .map(([key, data]) => (
              <Link
                key={key}
                href={`/games/${key}`}
                className="px-4 py-2 rounded-full bg-card border border-border hover:border-primary transition-colors"
              >
                {data.title.replace(" Games", "")}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
