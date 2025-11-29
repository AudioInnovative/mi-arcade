import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Users, Gamepad2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Game Creators",
  description: "Meet the talented game creators on Mi Arcade. Follow your favorites and discover new games.",
  openGraph: {
    title: "Game Creators | Mi Arcade",
    description: "Meet the talented game creators on Mi Arcade.",
  },
};

interface Profile {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
}

export default async function CreatorsPage() {
  const supabase = await createClient();

  // Fetch all creators
  const { data: creatorsData } = await supabase
    .from("creators")
    .select("user_id");

  const creatorIds = creatorsData?.map(c => c.user_id) || [];

  // Fetch profiles for these creators
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, handle, display_name, avatar_url, bio")
    .in("id", creatorIds.length > 0 ? creatorIds : ["none"]);

  // Get game counts for each creator
  const { data: gameCounts } = await supabase
    .from("games")
    .select("creator_id")
    .eq("status", "published")
    .in("creator_id", creatorIds.length > 0 ? creatorIds : ["none"]);

  // Count games per creator
  const gameCountMap = new Map<string, number>();
  gameCounts?.forEach(g => {
    gameCountMap.set(g.creator_id, (gameCountMap.get(g.creator_id) || 0) + 1);
  });

  // Create profiles array
  const creators = (profilesData || []) as Profile[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
          Creators
        </h1>
        <p className="text-muted-foreground">
          Discover talented game creators on Mi Arcade
        </p>
      </div>

      {creators && creators.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {creators.map((profile) => {
            const gameCount = gameCountMap.get(profile.id) || 0;

            return (
              <Link
                key={profile.id}
                href={`/u/${profile.handle}`}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-muted mb-4">
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={profile.display_name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {profile.display_name?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {profile.display_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    @{profile.handle}
                  </p>
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {profile.bio}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Gamepad2 className="h-4 w-4" />
                    <span>{gameCount} {gameCount === 1 ? "game" : "games"}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No creators yet</h3>
          <p className="text-muted-foreground">
            Be the first to become a creator!
          </p>
        </div>
      )}
    </div>
  );
}
