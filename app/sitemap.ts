import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const baseUrl = "https://miarcade.me";

  // Game categories
  const categories = [
    "action", "adventure", "arcade", "board", "card", "casual",
    "educational", "fighting", "horror", "multiplayer", "music",
    "platformer", "puzzle", "racing", "rpg", "shooter",
    "simulation", "sports", "strategy"
  ];

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/games`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/creators`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    // Category pages
    ...categories.map(cat => ({
      url: `${baseUrl}/games/${cat}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];

  // Fetch published games
  const { data: games } = await supabase
    .from("games")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  const gamePages: MetadataRoute.Sitemap = (games || []).map((game) => ({
    url: `${baseUrl}/g/${game.slug}`,
    lastModified: new Date(game.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Fetch creators with published games
  const { data: creators } = await supabase
    .from("profiles")
    .select("handle, updated_at");

  const creatorPages: MetadataRoute.Sitemap = (creators || []).map((creator) => ({
    url: `${baseUrl}/u/${creator.handle}`,
    lastModified: new Date(creator.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Fetch public collections
  const { data: collections } = await supabase
    .from("collections")
    .select("slug, updated_at")
    .eq("is_public", true);

  const collectionPages: MetadataRoute.Sitemap = (collections || []).map((col) => ({
    url: `${baseUrl}/collections/${col.slug}`,
    lastModified: new Date(col.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...gamePages, ...creatorPages, ...collectionPages];
}
