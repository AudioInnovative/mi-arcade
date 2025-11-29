import Link from "next/link";
import { ArrowRight, Gamepad2, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game/game-card";

// Mock data for demo
const mockGames = [
  {
    id: "1",
    creator_id: "c1",
    title: "Space Invaders Remix",
    slug: "space-invaders-remix",
    short_description: "A modern take on the classic arcade shooter",
    long_description: null,
    thumbnail_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=225&fit=crop",
    embed_url: "https://example.com/game1",
    status: "published" as const,
    genres: ["Shooter", "Arcade"],
    tags: ["retro", "space"],
    published_at: "2024-01-15",
    created_at: "2024-01-10",
    updated_at: "2024-01-15",
    creator: { handle: "retrodev", display_name: "RetroGameDev" },
    score: 92,
    tier: "A",
    play_count: 15420,
    reaction_count: 892,
  },
  {
    id: "2",
    creator_id: "c2",
    title: "Pixel Dungeon Quest",
    slug: "pixel-dungeon-quest",
    short_description: "Explore procedurally generated dungeons",
    long_description: null,
    thumbnail_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=225&fit=crop",
    embed_url: "https://example.com/game2",
    status: "published" as const,
    genres: ["RPG", "Roguelike"],
    tags: ["pixel", "dungeon"],
    published_at: "2024-01-20",
    created_at: "2024-01-18",
    updated_at: "2024-01-20",
    creator: { handle: "pixelmaster", display_name: "PixelMaster" },
    score: 88,
    tier: "A",
    play_count: 8930,
    reaction_count: 567,
  },
  {
    id: "3",
    creator_id: "c3",
    title: "Neon Racer",
    slug: "neon-racer",
    short_description: "High-speed racing through neon cityscapes",
    long_description: null,
    thumbnail_url: "https://images.unsplash.com/photo-1493711662062-fa541f7f7d25?w=400&h=225&fit=crop",
    embed_url: "https://example.com/game3",
    status: "published" as const,
    genres: ["Racing", "Arcade"],
    tags: ["neon", "speed"],
    published_at: "2024-01-22",
    created_at: "2024-01-21",
    updated_at: "2024-01-22",
    creator: { handle: "speedking", display_name: "SpeedKing" },
    score: 78,
    tier: "B",
    play_count: 5621,
    reaction_count: 321,
  },
  {
    id: "4",
    creator_id: "c4",
    title: "Puzzle Blocks",
    slug: "puzzle-blocks",
    short_description: "Relaxing puzzle game with colorful blocks",
    long_description: null,
    thumbnail_url: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=400&h=225&fit=crop",
    embed_url: "https://example.com/game4",
    status: "published" as const,
    genres: ["Puzzle", "Casual"],
    tags: ["relaxing", "colorful"],
    published_at: "2024-01-25",
    created_at: "2024-01-24",
    updated_at: "2024-01-25",
    creator: { handle: "puzzlemaker", display_name: "PuzzleMaker" },
    tier: "NEW",
    play_count: 1240,
    reaction_count: 89,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 via-transparent to-neon-purple/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">Your Personal</span>
              <br />
              Web Arcade
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover, play, and share HTML5 games from creators around the world.
              Create your own arcade profile and showcase your games.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="neon" asChild>
                <Link href="/games">
                  Browse Games
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/become-creator">Become a Creator</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <Gamepad2 className="h-8 w-8 mx-auto mb-2 text-neon-cyan" />
              <div className="text-2xl md:text-3xl font-bold font-heading">500+</div>
              <div className="text-sm text-muted-foreground">Games</div>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-neon-purple" />
              <div className="text-2xl md:text-3xl font-bold font-heading">10K+</div>
              <div className="text-sm text-muted-foreground">Players</div>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-neon-cyan" />
              <div className="text-2xl md:text-3xl font-bold font-heading">1M+</div>
              <div className="text-sm text-muted-foreground">Plays</div>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-neon-purple" />
              <div className="text-2xl md:text-3xl font-bold font-heading">200+</div>
              <div className="text-sm text-muted-foreground">Creators</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Games */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold">Trending Games</h2>
              <p className="text-muted-foreground mt-1">Most popular games this week</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/trending">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </section>

      {/* New Releases */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold">New Releases</h2>
              <p className="text-muted-foreground mt-1">Fresh games from our creators</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/games?sort=new">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockGames.slice(2).map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
            {mockGames.slice(0, 2).map((game) => (
              <GameCard key={game.id + "-new"} game={{ ...game, tier: "NEW", score: undefined }} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl border border-border bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 p-8 md:p-16 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Ready to Share Your Games?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Join Mi Arcade as a creator and reach thousands of players.
                Set up your profile, add your games, and start building your audience.
              </p>
              <Button size="xl" variant="neon" asChild>
                <Link href="/signup?creator=true">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
