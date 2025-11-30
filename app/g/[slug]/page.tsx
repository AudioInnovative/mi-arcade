import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportDialog } from "@/components/report-dialog";
import { TierBadge } from "@/components/game/tier-badge";
import { ReactionBar } from "@/components/game/reaction-bar";
import { GameCard } from "@/components/game/game-card";
import { PlayTracker } from "@/components/game/play-tracker";
import { Comments } from "@/components/game/comments";
import { BookmarkButton } from "@/components/game/bookmark-button";
import { ShareButtons } from "@/components/game/share-buttons";
import { FullscreenButton } from "@/components/game/fullscreen-button";
import { BannerAd } from "@/components/ads/ad-unit";
import { createClient } from "@/lib/supabase/server";

interface GamePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: game } = await supabase
    .from("games")
    .select("title, short_description, thumbnail_url, creator_id")
    .eq("slug", slug)
    .single();

  if (!game) {
    return { title: "Game Not Found | Mi Arcade" };
  }

  const { data: creator } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", game.creator_id)
    .single();

  const title = `${game.title} | Mi Arcade`;
  const description = game.short_description || `Play ${game.title} on Mi Arcade`;

  return {
    title,
    description,
    openGraph: {
      title: game.title,
      description,
      type: "website",
      url: `https://miarcade.me/g/${slug}`,
      images: game.thumbnail_url ? [
        {
          url: game.thumbnail_url,
          width: 1200,
          height: 630,
          alt: game.title,
        }
      ] : [],
      siteName: "Mi Arcade",
    },
    twitter: {
      card: "summary_large_image",
      title: game.title,
      description,
      images: game.thumbnail_url ? [game.thumbnail_url] : [],
      creator: creator?.display_name,
    },
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch game
  const { data: game, error } = await supabase
    .from("games")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !game) {
    notFound();
  }

  // Fetch creator profile
  const { data: creator } = await supabase
    .from("profiles")
    .select("handle, display_name, avatar_url")
    .eq("id", game.creator_id)
    .single();

  // Fetch game scores
  const { data: scoresData } = await supabase
    .from("game_scores")
    .select("play_count, total_reactions, tier, weighted_score, like_count, love_count, favorite_count")
    .eq("game_id", game.id)
    .single();

  const scores = scoresData;

  // Get current user's reaction
  const { data: { user } } = await supabase.auth.getUser();
  let userReaction = "none";
  let isBookmarked = false;
  if (user) {
    const { data: reactionData } = await supabase
      .from("reactions")
      .select("reaction")
      .eq("user_id", user.id)
      .eq("game_id", game.id)
      .single();
    userReaction = reactionData?.reaction || "none";

    const { data: bookmarkData } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("game_id", game.id)
      .single();
    isBookmarked = !!bookmarkData;
  }

  // Fetch more games by this creator
  const { data: moreGames } = await supabase
    .from("games")
    .select("*")
    .eq("creator_id", game.creator_id)
    .eq("status", "published")
    .neq("id", game.id)
    .limit(3);

  return (
    <div className="container mx-auto px-4 py-8">
      <PlayTracker gameId={game.id} />
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

        {/* Top Ad Banner */}
        <BannerAd className="mb-6" />

        {/* Game Frame */}
        <div id="game-frame" className="relative mb-6 rounded-xl overflow-hidden border border-border bg-black">
          <div className="aspect-video">
            <iframe
              src={game.embed_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title={game.title}
            />
          </div>
          <FullscreenButton targetId="game-frame" />
        </div>

        {/* Reaction Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-4 rounded-lg bg-card border border-border">
          <ReactionBar 
            gameId={game.id}
            initialReaction={userReaction as "none" | "like" | "love" | "favorite"}
            counts={{
              like: scores?.like_count || 0,
              love: scores?.love_count || 0,
              favorite: scores?.favorite_count || 0,
            }}
          />
          <div className="flex items-center gap-2">
            <BookmarkButton gameId={game.id} initialBookmarked={isBookmarked} />
            <ShareButtons title={game.title} slug={game.slug} />
            <ReportDialog targetType="game" targetId={game.id} targetName={game.title} />
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

        {/* Mid Ad Banner */}
        <BannerAd className="mb-8" />

        {/* Comments Section */}
        <div className="mb-8 p-6 rounded-lg bg-card border border-border">
          <Comments gameId={game.id} currentUserId={user?.id} />
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
                    creator: creator,
                    score: 0,
                    tier: "NEW",
                    play_count: 0,
                    reaction_count: 0,
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
