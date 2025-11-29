import { notFound } from "next/navigation";
import Link from "next/link";
import { Expand, Flag, MessageSquare, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/game/tier-badge";
import { ReactionBar } from "@/components/game/reaction-bar";
import { GameCard } from "@/components/game/game-card";
import { createClient } from "@/lib/supabase/server";

interface GamePageProps {
  params: Promise<{ slug: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch game with creator info
  const { data: game, error } = await supabase
    .from("games")
    .select(`
      *,
      profiles!games_creator_id_fkey (
        handle,
        display_name,
        avatar_url
      ),
      game_scores (
        play_count,
        total_reactions,
        tier,
        weighted_score
      )
    `)
    .eq("slug", slug)
    .single();

  if (error || !game) {
    notFound();
  }

  // Fetch more games by this creator
  const { data: moreGames } = await supabase
    .from("games")
    .select(`
      *,
      profiles!games_creator_id_fkey (
        handle,
        display_name
      ),
      game_scores (
        play_count,
        total_reactions,
        tier,
        weighted_score
      )
    `)
    .eq("creator_id", game.creator_id)
    .eq("status", "published")
    .neq("id", game.id)
    .limit(3);

  // Transform data for display
  const creator = game.profiles;
  const scores = game.game_scores;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
            {game.title}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            {creator && (
              <Link
                href={`/u/${creator.handle}`}
                className="hover:text-primary transition-colors"
              >
                @{creator.handle}
              </Link>
            )}
            {scores?.tier && scores.tier !== "NEW" && (
              <TierBadge tier={scores.tier} score={scores.weighted_score} size="md" />
            )}
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
            {game.genres?.map((genre: string) => (
              <Link
                key={genre}
                href={`/games?genre=${genre.toLowerCase()}`}
                className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                {genre}
              </Link>
            ))}
            {game.tags?.map((tag: string) => (
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
        {creator && moreGames && moreGames.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-semibold">
                More by @{creator.handle}
              </h2>
              <Button variant="ghost" asChild>
                <Link href={`/u/${creator.handle}`}>View Profile</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {moreGames.map((g) => (
                <GameCard 
                  key={g.id} 
                  game={{
                    ...g,
                    creator: g.profiles,
                    score: g.game_scores?.weighted_score,
                    tier: g.game_scores?.tier || "NEW",
                    play_count: g.game_scores?.play_count || 0,
                    reaction_count: g.game_scores?.total_reactions || 0,
                  }} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
