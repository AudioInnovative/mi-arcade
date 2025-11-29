import { notFound } from "next/navigation";
import Image from "next/image";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game/game-card";

// Mock data - will be replaced with real Supabase queries
const mockCreator = {
  id: "c1",
  handle: "retrodev",
  display_name: "RetroGameDev",
  avatar_url: null,
  banner_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=400&fit=crop",
  bio: "Indie game developer specializing in retro-style arcade games. Making games since 2015. Love pixel art and classic gameplay mechanics.",
  is_creator: true,
  theme: {
    name: "Neon Cyan & Purple",
    primary_color: "#00f5ff",
    secondary_color: "#a855f7",
    accent_color: "#ff00ff",
  },
  total_plays: 30220,
  total_games: 5,
  followers: 1247,
};

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

interface CreatorPageProps {
  params: Promise<{ handle: string }>;
}

export default async function CreatorPage({ params }: CreatorPageProps) {
  const { handle } = await params;

  // In production, fetch creator from Supabase
  const creator = mockCreator.handle === handle ? mockCreator : null;

  if (!creator) {
    notFound();
  }

  const games = mockGames;

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-neon-cyan/30 to-neon-purple/30">
        {creator.banner_url && (
          <Image
            src={creator.banner_url}
            alt=""
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 md:-mt-20 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-background bg-card flex items-center justify-center overflow-hidden">
                {creator.avatar_url ? (
                  <Image
                    src={creator.avatar_url}
                    alt={creator.display_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span
                    className="text-4xl md:text-5xl font-bold"
                    style={{ color: creator.theme.primary_color }}
                  >
                    {creator.display_name.charAt(0)}
                  </span>
                )}
              </div>
              {/* Creator badge */}
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded text-xs font-bold bg-neon-cyan text-black">
                CREATOR
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="font-heading text-2xl md:text-3xl font-bold">
                {creator.display_name}
              </h1>
              <p className="text-muted-foreground">@{creator.handle}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                style={{
                  borderColor: creator.theme.primary_color,
                  color: creator.theme.primary_color,
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Follow
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-md">
          <div className="text-center p-4 rounded-lg bg-card border border-border">
            <div
              className="text-2xl font-bold font-heading"
              style={{ color: creator.theme.primary_color }}
            >
              {creator.total_games}
            </div>
            <div className="text-sm text-muted-foreground">Games</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card border border-border">
            <div
              className="text-2xl font-bold font-heading"
              style={{ color: creator.theme.primary_color }}
            >
              {(creator.total_plays / 1000).toFixed(1)}K
            </div>
            <div className="text-sm text-muted-foreground">Plays</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card border border-border">
            <div
              className="text-2xl font-bold font-heading"
              style={{ color: creator.theme.primary_color }}
            >
              {(creator.followers / 1000).toFixed(1)}K
            </div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
        </div>

        {/* Bio */}
        {creator.bio && (
          <div className="mb-8 max-w-2xl">
            <h2 className="font-heading text-lg font-semibold mb-2">About</h2>
            <p className="text-muted-foreground">{creator.bio}</p>
          </div>
        )}

        {/* Games */}
        <div className="pb-16">
          <h2 className="font-heading text-xl font-semibold mb-6">
            Games by {creator.display_name}
          </h2>
          {games.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-lg bg-card border border-border text-center">
              <p className="text-muted-foreground">
                This creator hasn&apos;t added any games yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
