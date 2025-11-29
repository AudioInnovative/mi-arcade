import Link from "next/link";
import { ArrowRight, Gamepad2, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game/game-card";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

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
