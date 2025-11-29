import Link from "next/link";
import Image from "next/image";
import { FolderOpen, Gamepad2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function CollectionsPage() {
  const supabase = await createClient();

  // Fetch public collections with game counts
  const { data: collections } = await supabase
    .from("collections")
    .select(`
      id,
      title,
      slug,
      description,
      cover_url,
      creator_id,
      created_at
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  // Get creator profiles
  const creatorIds = [...new Set(collections?.map(c => c.creator_id) || [])];
  const { data: creators } = await supabase
    .from("profiles")
    .select("id, handle, display_name")
    .in("id", creatorIds.length > 0 ? creatorIds : ["none"]);

  const creatorsMap = new Map(creators?.map(c => [c.id, c]) || []);

  // Get game counts per collection
  const collectionIds = collections?.map(c => c.id) || [];
  const { data: gameCounts } = await supabase
    .from("collection_games")
    .select("collection_id")
    .in("collection_id", collectionIds.length > 0 ? collectionIds : ["none"]);

  const countMap = new Map<string, number>();
  gameCounts?.forEach(g => {
    countMap.set(g.collection_id, (countMap.get(g.collection_id) || 0) + 1);
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FolderOpen className="h-8 w-8 text-neon-purple" />
          <h1 className="font-heading text-3xl md:text-4xl font-bold">
            Collections
          </h1>
        </div>
        <p className="text-muted-foreground">
          Curated playlists of games by creators
        </p>
      </div>

      {collections && collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => {
            const creator = creatorsMap.get(collection.creator_id);
            const gameCount = countMap.get(collection.id) || 0;

            return (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group block rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 transition-colors"
              >
                {/* Cover */}
                <div className="aspect-video relative bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20">
                  {collection.cover_url ? (
                    <Image
                      src={collection.cover_url}
                      alt={collection.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FolderOpen className="h-16 w-16 text-muted-foreground opacity-50" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-1">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {collection.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>by @{creator?.handle}</span>
                    <span className="flex items-center gap-1">
                      <Gamepad2 className="h-4 w-4" />
                      {gameCount} games
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
          <p className="text-muted-foreground">
            Collections will appear here when creators make them.
          </p>
        </div>
      )}
    </div>
  );
}
