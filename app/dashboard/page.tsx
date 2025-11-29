"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Gamepad2,
  Plus,
  BarChart3,
  Settings,
  Eye,
  Edit,
  Trash2,
  Play,
  Heart,
  Loader2,
  Globe,
  GlobeLock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TierBadge } from "@/components/game/tier-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GameScores {
  play_count: number;
  total_reactions: number;
  tier: string;
  weighted_score: number;
}

interface Game {
  id: string;
  title: string;
  slug: string;
  status: string;
  thumbnail_url: string | null;
  short_description: string | null;
  embed_url: string;
  created_at: string;
  published_at: string | null;
  game_scores: GameScores[] | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"overview" | "games" | "analytics" | "settings">("overview");
  const [showAddGame, setShowAddGame] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newGame, setNewGame] = useState({
    title: "",
    embed_url: "",
    short_description: "",
  });

  // Check if user is a creator
  const isCreator = user?.user_metadata?.is_creator === true;

  // Fetch user's games
  useEffect(() => {
    async function fetchGames() {
      if (!user) return;
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from("games")
        .select(`
          id,
          title,
          slug,
          status,
          thumbnail_url,
          short_description,
          embed_url,
          created_at,
          published_at,
          game_scores (
            play_count,
            total_reactions,
            tier,
            weighted_score
          )
        `)
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching games:", error);
      } else {
        setGames(data || []);
      }
      setLoading(false);
    }

    if (user) {
      fetchGames();
    }
  }, [user]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Handle game submission
  const handleCreateGame = async () => {
    if (!user || !newGame.title || !newGame.embed_url) {
      toast({
        title: "Missing fields",
        description: "Please fill in the game title and embed URL.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    
    const slug = generateSlug(newGame.title) + "-" + Date.now().toString(36);
    
    const { data, error } = await supabase
      .from("games")
      .insert({
        creator_id: user.id,
        title: newGame.title,
        slug: slug,
        embed_url: newGame.embed_url,
        short_description: newGame.short_description || null,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating game:", error);
      toast({
        title: "Error creating game",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Game created!",
        description: "Your game has been saved as a draft.",
      });
      setGames([{ ...data, game_scores: null }, ...games]);
      setNewGame({ title: "", embed_url: "", short_description: "" });
      setShowAddGame(false);
    }
    
    setSubmitting(false);
  };

  // Handle publish/unpublish toggle
  const handleTogglePublish = async (gameId: string, currentStatus: string) => {
    const supabase = createClient();
    const newStatus = currentStatus === "published" ? "draft" : "published";
    
    const { error } = await supabase
      .from("games")
      .update({ 
        status: newStatus,
        published_at: newStatus === "published" ? new Date().toISOString() : null
      })
      .eq("id", gameId);

    if (error) {
      toast({
        title: "Error updating game",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setGames(games.map(g => 
        g.id === gameId 
          ? { ...g, status: newStatus, published_at: newStatus === "published" ? new Date().toISOString() : null }
          : g
      ));
      toast({
        title: newStatus === "published" ? "Game published!" : "Game unpublished",
        description: newStatus === "published" 
          ? "Your game is now visible to everyone." 
          : "Your game is now a draft.",
      });
    }
  };

  // Handle delete game
  const handleDeleteGame = async (gameId: string) => {
    if (!confirm("Are you sure you want to delete this game? This cannot be undone.")) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("games")
      .delete()
      .eq("id", gameId);

    if (error) {
      toast({
        title: "Error deleting game",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setGames(games.filter(g => g.id !== gameId));
      toast({
        title: "Game deleted",
        description: "Your game has been removed.",
      });
    }
  };

  // Calculate stats from games
  const stats = {
    total_games: games.length,
    total_plays: games.reduce((sum, g) => sum + (g.game_scores?.[0]?.play_count || 0), 0),
    total_reactions: games.reduce((sum, g) => sum + (g.game_scores?.[0]?.total_reactions || 0), 0),
    average_score: games.length > 0 
      ? Math.round(games.reduce((sum, g) => sum + (g.game_scores?.[0]?.weighted_score || 0), 0) / games.length)
      : 0,
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    router.push("/login?message=Please log in to access the dashboard");
    return null;
  }

  // Not a creator
  if (!isCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Gamepad2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Creator Access Required</h1>
          <p className="text-muted-foreground mb-6">
            You need a creator account to access the dashboard and submit games.
          </p>
          <Button onClick={() => router.push("/signup?creator=true")}>
            Become a Creator
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-24">
              <h1 className="font-heading text-2xl font-bold mb-6">Dashboard</h1>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === "overview"
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("games")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === "games"
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <Gamepad2 className="h-5 w-5" />
                  My Games
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === "analytics"
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === "settings"
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-heading text-xl font-semibold mb-4">Overview</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <Gamepad2 className="h-6 w-6 text-neon-cyan mb-2" />
                      <div className="text-2xl font-bold font-heading">{stats.total_games}</div>
                      <div className="text-sm text-muted-foreground">Total Games</div>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <Play className="h-6 w-6 text-neon-purple mb-2" />
                      <div className="text-2xl font-bold font-heading">
                        {(stats.total_plays / 1000).toFixed(1)}K
                      </div>
                      <div className="text-sm text-muted-foreground">Total Plays</div>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <Heart className="h-6 w-6 text-pink-400 mb-2" />
                      <div className="text-2xl font-bold font-heading">
                        {(stats.total_reactions / 1000).toFixed(1)}K
                      </div>
                      <div className="text-sm text-muted-foreground">Reactions</div>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <BarChart3 className="h-6 w-6 text-tier-a mb-2" />
                      <div className="text-2xl font-bold font-heading">{stats.average_score}</div>
                      <div className="text-sm text-muted-foreground">Avg Score</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-lg font-semibold">Recent Games</h3>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("games")}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading games...
                      </div>
                    ) : games.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Gamepad2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No games yet. Add your first game!</p>
                      </div>
                    ) : games.slice(0, 3).map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border"
                      >
                        <div className="w-24 h-14 rounded bg-muted overflow-hidden shrink-0">
                          {game.thumbnail_url ? (
                            <Image
                              src={game.thumbnail_url}
                              alt={game.title}
                              width={96}
                              height={56}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{game.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className={game.status === "published" ? "text-tier-a" : "text-yellow-400"}>
                              {game.status === "published" ? "Published" : "Draft"}
                            </span>
                            {game.game_scores?.[0]?.tier && game.game_scores[0].tier !== "NEW" && (
                              <>
                                <span>•</span>
                                <TierBadge tier={game.game_scores[0].tier} score={game.game_scores[0].weighted_score} size="sm" />
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{(game.game_scores?.[0]?.play_count || 0).toLocaleString()} plays</div>
                          <div>{(game.game_scores?.[0]?.total_reactions || 0).toLocaleString()} reactions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Games Tab */}
            {activeTab === "games" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-xl font-semibold">My Games</h2>
                  <Dialog open={showAddGame} onOpenChange={setShowAddGame}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Game
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add New Game</DialogTitle>
                        <DialogDescription>
                          Add a new game by providing the embed URL where your game is hosted.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Game Title</Label>
                          <Input
                            id="title"
                            placeholder="My Awesome Game"
                            value={newGame.title}
                            onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="embed_url">Embed URL</Label>
                          <Input
                            id="embed_url"
                            placeholder="https://your-game-host.com/game"
                            value={newGame.embed_url}
                            onChange={(e) => setNewGame({ ...newGame, embed_url: e.target.value })}
                          />
                          <p className="text-xs text-muted-foreground">
                            Must be an HTTPS URL that allows iframe embedding
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Short Description</Label>
                          <Input
                            id="description"
                            placeholder="A brief description of your game"
                            value={newGame.short_description}
                            onChange={(e) => setNewGame({ ...newGame, short_description: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddGame(false)} disabled={submitting}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateGame} disabled={submitting}>
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Game"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading games...
                    </div>
                  ) : games.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No games yet</p>
                      <p className="text-sm mb-4">Click "Add Game" to submit your first game!</p>
                    </div>
                  ) : games.map((game) => (
                    <div
                      key={game.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border"
                    >
                      <div className="w-32 h-18 rounded bg-muted overflow-hidden shrink-0">
                        {game.thumbnail_url ? (
                          <Image
                            src={game.thumbnail_url}
                            alt={game.title}
                            width={128}
                            height={72}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center aspect-video">
                            <Gamepad2 className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{game.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span className={game.status === "published" ? "text-tier-a" : "text-yellow-400"}>
                            {game.status === "published" ? "Published" : "Draft"}
                          </span>
                          {game.game_scores?.[0]?.tier && game.game_scores[0].tier !== "NEW" && (
                            <>
                              <span>•</span>
                              <TierBadge tier={game.game_scores[0].tier} score={game.game_scores[0].weighted_score} size="sm" />
                            </>
                          )}
                          <span>•</span>
                          <span>{(game.game_scores?.[0]?.play_count || 0).toLocaleString()} plays</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleTogglePublish(game.id, game.status)}
                          title={game.status === "published" ? "Unpublish" : "Publish"}
                        >
                          {game.status === "published" ? (
                            <Globe className="h-4 w-4 text-tier-a" />
                          ) : (
                            <GlobeLock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/g/${game.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteGame(game.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div>
                <h2 className="font-heading text-xl font-semibold mb-6">Analytics</h2>
                <div className="p-8 rounded-lg bg-card border border-border text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Detailed analytics coming soon. Track plays, reactions, and score history for each game.
                  </p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div>
                <h2 className="font-heading text-xl font-semibold mb-6">Profile Settings</h2>
                <div className="max-w-xl space-y-6">
                  <div className="p-6 rounded-lg bg-card border border-border space-y-4">
                    <h3 className="font-semibold">Profile Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input id="display_name" defaultValue="RetroGameDev" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        defaultValue="Indie game developer specializing in retro-style arcade games."
                      />
                    </div>
                    <Button>Save Changes</Button>
                  </div>

                  <div className="p-6 rounded-lg bg-card border border-border space-y-4">
                    <h3 className="font-semibold">Theme</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a theme for your creator profile page.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {["Neon Cyan & Purple", "Galaxy Purple", "Pixel Green", "Minimal Dark", "Minimal Light"].map(
                        (theme) => (
                          <button
                            key={theme}
                            className="p-3 rounded-lg border border-border text-sm hover:border-primary transition-colors text-left"
                          >
                            {theme}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
