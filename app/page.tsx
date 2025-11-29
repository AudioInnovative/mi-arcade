import Link from "next/link";
import { ArrowRight, Gamepad2, Users, TrendingUp, Sparkles, UserPlus, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game/game-card";
import { createClient } from "@/lib/supabase/server";

// Helper to transform games with creator and score info
function transformGames(
  games: any[], 
  creatorsMap: Map<string, any>, 
  scoresMap: Map<string, any>
) {
  return games.map(game => ({
    ...game,
    creator: creatorsMap.get(game.creator_id) || { handle: "unknown", display_name: "Unknown" },
    tier: scoresMap.get(game.id)?.tier || "NEW",
    score: scoresMap.get(game.id)?.weighted_score || 0,
    play_count: scoresMap.get(game.id)?.play_count || 0,
    reaction_count: scoresMap.get(game.id)?.total_reactions || 0,
  }));
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If logged in, show personalized feed
  if (user) {
    return <PersonalizedFeed userId={user.id} />;
  }

  // Fetch published games
  const { data: gamesData } = await supabase
    .from("games")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(8);

  // Fetch creators for these games
  const creatorIds = [...new Set(gamesData?.map(g => g.creator_id) || [])];
  const { data: creatorsData } = await supabase
    .from("profiles")
    .select("id, handle, display_name")
    .in("id", creatorIds.length > 0 ? creatorIds : ["none"]);

  // Create a map of creator_id to creator
  const creatorsMap = new Map(creatorsData?.map(c => [c.id, c]) || []);

  // Transform games with creator info
  const games = (gamesData || []).map(game => ({
    ...game,
    creator: creatorsMap.get(game.creator_id) || { handle: "unknown", display_name: "Unknown" },
    tier: "NEW",
    score: 0,
    play_count: 0,
    reaction_count: 0,
  }));

  // Get stats
  const { count: gamesCount } = await supabase
    .from("games")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const { count: creatorsCount } = await supabase
    .from("creators")
    .select("*", { count: "exact", head: true });
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
              <div className="text-2xl md:text-3xl font-bold font-heading">{gamesCount || 0}</div>
              <div className="text-sm text-muted-foreground">Games</div>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-neon-purple" />
              <div className="text-2xl md:text-3xl font-bold font-heading">-</div>
              <div className="text-sm text-muted-foreground">Players</div>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-neon-cyan" />
              <div className="text-2xl md:text-3xl font-bold font-heading">-</div>
              <div className="text-sm text-muted-foreground">Plays</div>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-neon-purple" />
              <div className="text-2xl md:text-3xl font-bold font-heading">{creatorsCount || 0}</div>
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
            {games.length > 0 ? (
              games.slice(0, 4).map((game) => (
                <GameCard key={game.id} game={game} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No games yet. Be the first to publish!</p>
              </div>
            )}
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
            {games.length > 0 ? (
              games.slice(0, 4).map((game) => (
                <GameCard key={game.id} game={game} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No new releases yet.</p>
              </div>
            )}
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

// Personalized Feed for logged-in users
async function PersonalizedFeed({ userId }: { userId: string }) {
  const supabase = await createClient();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, display_name")
    .eq("id", userId)
    .single();

  // Get followed creators
  const { data: following } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  const followingIds = following?.map(f => f.following_id) || [];

  // Fetch games from followed creators
  let followingGames: any[] = [];
  if (followingIds.length > 0) {
    const { data } = await supabase
      .from("games")
      .select("*")
      .in("creator_id", followingIds)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(8);
    followingGames = data || [];
  }

  // Fetch trending games (by play count)
  const { data: trendingScores } = await supabase
    .from("game_scores")
    .select("game_id, play_count, total_reactions, tier, weighted_score")
    .order("play_count", { ascending: false })
    .limit(12);

  const trendingGameIds = trendingScores?.map(s => s.game_id) || [];
  
  let trendingGames: any[] = [];
  if (trendingGameIds.length > 0) {
    const { data } = await supabase
      .from("games")
      .select("*")
      .in("id", trendingGameIds)
      .eq("status", "published");
    trendingGames = data || [];
  }

  // Fetch new releases
  const { data: newGames } = await supabase
    .from("games")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(8);

  // Get all unique creator IDs
  const allGames = [...followingGames, ...trendingGames, ...(newGames || [])];
  const creatorIds = [...new Set(allGames.map(g => g.creator_id))];

  // Fetch creators
  const { data: creators } = await supabase
    .from("profiles")
    .select("id, handle, display_name")
    .in("id", creatorIds.length > 0 ? creatorIds : ["none"]);

  const creatorsMap = new Map(creators?.map(c => [c.id, c]) || []);
  const scoresMap = new Map(trendingScores?.map(s => [s.game_id, s]) || []);

  // Transform games
  const transformedFollowingGames = transformGames(followingGames, creatorsMap, scoresMap);
  const transformedTrendingGames = transformGames(
    trendingGames.sort((a, b) => {
      const scoreA = scoresMap.get(a.id)?.play_count || 0;
      const scoreB = scoresMap.get(b.id)?.play_count || 0;
      return scoreB - scoreA;
    }),
    creatorsMap,
    scoresMap
  );
  const transformedNewGames = transformGames(newGames || [], creatorsMap, scoresMap);

  // Suggested creators to follow (those with games, not already following)
  const { data: suggestedCreators } = await supabase
    .from("profiles")
    .select("id, handle, display_name, avatar_url")
    .not("id", "in", `(${[userId, ...followingIds].join(",")})`)
    .limit(5);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold">
                Welcome back, {profile?.display_name || "Player"}!
              </h1>
              <p className="text-muted-foreground">Your personalized gaming feed</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/u/${profile?.handle}`}>
                  My Profile
                </Link>
              </Button>
              <Button asChild>
                <Link href="/games">
                  Browse All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-10">
            {/* From Following */}
            {followingIds.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Rss className="h-5 w-5 text-neon-cyan" />
                  <h2 className="font-heading text-xl font-semibold">From Creators You Follow</h2>
                </div>
                {transformedFollowingGames.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {transformedFollowingGames.slice(0, 6).map(game => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-card rounded-lg border border-border">
                    <Gamepad2 className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No new games from creators you follow</p>
                  </div>
                )}
              </section>
            )}

            {/* Recommended / Trending */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-neon-purple" />
                  <h2 className="font-heading text-xl font-semibold">Recommended For You</h2>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/trending">
                    See All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              {transformedTrendingGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {transformedTrendingGames.slice(0, 6).map(game => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-card rounded-lg border border-border">
                  <TrendingUp className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No trending games yet</p>
                </div>
              )}
            </section>

            {/* New Releases */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-green-400" />
                  <h2 className="font-heading text-xl font-semibold">New Releases</h2>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/games">
                    See All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              {transformedNewGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {transformedNewGames.slice(0, 6).map(game => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-card rounded-lg border border-border">
                  <Gamepad2 className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No new games yet</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="p-4 rounded-lg bg-card border border-border">
              <h3 className="font-semibold mb-3">Your Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Following</span>
                  <span className="font-medium">{followingIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Games Saved</span>
                  <span className="font-medium">-</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            </div>

            {/* Suggested Creators */}
            {suggestedCreators && suggestedCreators.length > 0 && (
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <UserPlus className="h-4 w-4 text-neon-cyan" />
                  <h3 className="font-semibold">Creators to Follow</h3>
                </div>
                <div className="space-y-3">
                  {suggestedCreators.slice(0, 4).map(creator => (
                    <Link
                      key={creator.id}
                      href={`/u/${creator.handle}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        {creator.avatar_url ? (
                          <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {creator.display_name?.charAt(0) || "?"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{creator.display_name}</div>
                        <div className="text-xs text-muted-foreground">@{creator.handle}</div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3" asChild>
                  <Link href="/creators">
                    Browse All Creators
                  </Link>
                </Button>
              </div>
            )}

            {/* Quick Links */}
            <div className="p-4 rounded-lg bg-card border border-border">
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <div className="space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/library">
                    My Library
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/collections">
                    Collections
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/trending">
                    Trending
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
