import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import { Gamepad2 } from "lucide-react";
import { GameCard } from "@/components/game/game-card";
import { FollowButton } from "@/components/user/follow-button";
import { createClient } from "@/lib/supabase/server";

interface CreatorPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: CreatorPageProps): Promise<Metadata> {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, avatar_url")
    .eq("handle", handle)
    .single();

  if (!profile) {
    return { title: "Creator Not Found | Mi Arcade" };
  }

  const { count: gameCount } = await supabase
    .from("games")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", profile.display_name);

  const title = `${profile.display_name} (@${handle}) | Mi Arcade`;
  const description = profile.bio || `Check out games by ${profile.display_name} on Mi Arcade`;

  return {
    title,
    description,
    openGraph: {
      title: profile.display_name,
      description,
      type: "profile",
      url: `https://miarcade.me/u/${handle}`,
      images: profile.avatar_url ? [
        {
          url: profile.avatar_url,
          width: 400,
          height: 400,
          alt: profile.display_name,
        }
      ] : [],
      siteName: "Mi Arcade",
    },
    twitter: {
      card: "summary",
      title: profile.display_name,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function CreatorPage({ params }: CreatorPageProps) {
  const { handle } = await params;
  const supabase = await createClient();

  // Fetch creator profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Fetch creator's games
  const { data: gamesData } = await supabase
    .from("games")
    .select("*")
    .eq("creator_id", profile.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  // Transform games for GameCard
  const games = (gamesData || []).map(game => ({
    ...game,
    creator: { handle: profile.handle, display_name: profile.display_name },
    tier: "NEW",
    score: 0,
    play_count: 0,
    reaction_count: 0,
  }));

  // Check if current user follows this creator
  const { data: { user } } = await supabase.auth.getUser();
  let isFollowing = false;
  let followerCount = 0;

  // Get follower count
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.id);
  followerCount = count || 0;

  if (user && user.id !== profile.id) {
    const { data: followData } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", profile.id)
      .single();
    isFollowing = !!followData;
  }

  const isOwnProfile = user?.id === profile.id;

  // Default theme if none set
  const theme = {
    primary_color: "#00f5ff",
    secondary_color: "#a855f7",
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-neon-cyan/30 to-neon-purple/30">
        {profile.banner_url && (
          <Image
            src={profile.banner_url}
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
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span
                    className="text-4xl md:text-5xl font-bold"
                    style={{ color: theme.primary_color }}
                  >
                    {profile.display_name.charAt(0)}
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
                {profile.display_name}
              </h1>
              <p className="text-muted-foreground">@{profile.handle}</p>
            </div>

            {/* Actions */}
            {!isOwnProfile && (
              <div className="flex items-center gap-3">
                <FollowButton 
                  userId={profile.id}
                  initialFollowing={isFollowing}
                  initialCount={followerCount}
                  showCount
                />
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-md">
          <div className="text-center p-4 rounded-lg bg-card border border-border">
            <div
              className="text-2xl font-bold font-heading"
              style={{ color: theme.primary_color }}
            >
              {games.length}
            </div>
            <div className="text-sm text-muted-foreground">Games</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card border border-border">
            <div
              className="text-2xl font-bold font-heading"
              style={{ color: theme.primary_color }}
            >
              -
            </div>
            <div className="text-sm text-muted-foreground">Plays</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card border border-border">
            <div
              className="text-2xl font-bold font-heading"
              style={{ color: theme.primary_color }}
            >
              -
            </div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mb-8 max-w-2xl">
            <h2 className="font-heading text-lg font-semibold mb-2">About</h2>
            <p className="text-muted-foreground">{profile.bio}</p>
          </div>
        )}

        {/* Games */}
        <div className="pb-16">
          <h2 className="font-heading text-xl font-semibold mb-6">
            Games by {profile.display_name}
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
