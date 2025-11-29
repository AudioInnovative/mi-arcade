import { notFound } from "next/navigation";
import Link from "next/link";
import { Expand, Flag, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/game/tier-badge";
import { ReactionBar } from "@/components/game/reaction-bar";
import { GameCard } from "@/components/game/game-card";

// Mock data - will be replaced with real Supabase queries
const mockGame = {
  id: "1",
  creator_id: "c1",
  title: "Space Invaders Remix",
  slug: "space-invaders-remix",
  short_description: "A modern take on the classic arcade shooter",
  long_description: `
    Experience the classic arcade shooter reimagined for the modern web!

    **Features:**
    - Smooth 60fps gameplay
    - Multiple power-ups and weapons
    - Online leaderboards
    - 50+ levels of increasing difficulty
    - Boss battles every 10 levels

    Use arrow keys or WASD to move, Space to shoot. Have fun!
  `,
  thumbnail_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=450&fit=crop",
  embed_url: "https://playpager.com/embed/breakout-game/",
  status: "published" as const,
  genres: ["Shooter", "Arcade"],
  tags: ["retro", "space", "classic", "action"],
  published_at: "2024-01-15",
  created_at: "2024-01-10",
  updated_at: "2024-01-15",
  creator: {
    handle: "retrodev",
    display_name: "RetroGameDev",
    avatar_url: null,
  },
  score: 92,
  tier: "A",
  play_count: 15420,
  reaction_count: 892,
};

const moreGames = [
  {
    id: "2",
    creator_id: "c1",
    title: "Asteroid Blaster",
    slug: "asteroid-blaster",
    short_description: "Destroy asteroids in this arcade classic",
    long_description: null,
    thumbnail_url: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=225&fit=crop",
    embed_url: "https://example.com/game2",
    status: "published" as const,
    genres: ["Shooter"],
    tags: ["space"],
    published_at: "2024-01-12",
    created_at: "2024-01-10",
    updated_at: "2024-01-12",
    creator: { handle: "retrodev", display_name: "RetroGameDev" },
    score: 85,
    tier: "B",
    play_count: 8200,
    reaction_count: 445,
  },
  {
    id: "3",
    creator_id: "c1",
    title: "Galaga Redux",
    slug: "galaga-redux",
    short_description: "The sequel nobody asked for but everyone needs",
    long_description: null,
    thumbnail_url: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=400&h=225&fit=crop",
    embed_url: "https://example.com/game3",
    status: "published" as const,
    genres: ["Shooter"],
    tags: ["retro"],
    published_at: "2024-01-08",
    created_at: "2024-01-05",
    updated_at: "2024-01-08",
    creator: { handle: "retrodev", display_name: "RetroGameDev" },
    score: 79,
    tier: "B",
    play_count: 6100,
    reaction_count: 298,
  },
];

interface GamePageProps {
  params: Promise<{ slug: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;

  // In production, fetch game from Supabase
  const game = mockGame.slug === slug ? mockGame : null;

  if (!game) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
            {game.title}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <Link
              href={`/@${game.creator.handle}`}
              className="hover:text-primary transition-colors"
            >
              @{game.creator.handle}
            </Link>
            <TierBadge tier={game.tier} score={game.score} size="md" />
          </div>
        </div>

        {/* Ad Placeholder */}
        <div className="mb-6 p-4 border border-dashed border-border rounded-lg text-center text-muted-foreground bg-muted/30">
          Ad Space - Top Banner
        </div>

        {/* Game Frame */}
        <div className="relative mb-6 rounded-xl overflow-hidden border border-border bg-black">
          <div className="aspect-video">
            <iframe
              src={game.embed_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title={game.title}
            />
          </div>
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70"
            title="Fullscreen"
          >
            <Expand className="h-5 w-5" />
          </Button>
        </div>

        {/* Reaction Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-4 rounded-lg bg-card border border-border">
          <ReactionBar />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Flag className="h-4 w-4 mr-2" />
              Report
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="font-heading text-xl font-semibold mb-4">About this game</h2>
          <p className="text-muted-foreground mb-4">{game.short_description}</p>
          {game.long_description && (
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-line text-muted-foreground">
                {game.long_description}
              </p>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {game.genres.map((genre) => (
              <Link
                key={genre}
                href={`/games?genre=${genre.toLowerCase()}`}
                className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                {genre}
              </Link>
            ))}
            {game.tags.map((tag) => (
              <Link
                key={tag}
                href={`/games?tag=${tag}`}
                className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Ad Placeholder */}
        <div className="mb-8 p-4 border border-dashed border-border rounded-lg text-center text-muted-foreground bg-muted/30">
          Ad Space - Mid Banner
        </div>

        {/* Comments Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments
            </h2>
          </div>
          <div className="p-8 rounded-lg bg-card border border-border text-center">
            <p className="text-muted-foreground mb-4">
              No comments yet. Be the first to share your thoughts!
            </p>
            <Button variant="outline">
              <Link href="/login">Sign in to comment</Link>
            </Button>
          </div>
        </div>

        {/* More Games by Creator */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-semibold">
              More by @{game.creator.handle}
            </h2>
            <Button variant="ghost" asChild>
              <Link href={`/@${game.creator.handle}`}>View Profile</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {moreGames.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
