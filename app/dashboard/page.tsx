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
import { checkEmbedUrl } from "@/lib/embed-check";

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
  const [showEditGame, setShowEditGame] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [primaryGenre, setPrimaryGenre] = useState<string>("");
  const [secondaryGenre, setSecondaryGenre] = useState<string>("");
  const [newGame, setNewGame] = useState({
    title: "",
    embed_url: "",
    short_description: "",
  });
  const [editForm, setEditForm] = useState({
    title: "",
    embed_url: "",
    short_description: "",
  });
  const [profile, setProfile] = useState({
    display_name: "",
    bio: "",
    avatar_url: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Available genres
  const GENRES = [
    "Action",
    "Adventure", 
    "Arcade",
    "Board",
    "Card",
    "Casual",
    "Educational",
    "Fighting",
    "Horror",
    "Multiplayer",
    "Music",
    "Platformer",
    "Puzzle",
    "Racing",
    "RPG",
    "Shooter",
    "Simulation",
    "Sports",
    "Strategy",
  ];

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

    async function fetchProfile() {
      if (!user) return;
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, bio, avatar_url")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile({
          display_name: data.display_name || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        });
        setAvatarPreview(data.avatar_url);
      }
    }

    if (user) {
      fetchGames();
      fetchProfile();
    }
  }, [user]);

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!user) return;

    setSavingProfile(true);
    const supabase = createClient();
    let avatarUrl = profile.avatar_url;

    // Upload new avatar if provided
    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("game-thumbnails")
        .upload(filePath, avatarFile, { upsert: true });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("game-thumbnails")
          .getPublicUrl(filePath);
        avatarUrl = publicUrl;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: avatarUrl,
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProfile({ ...profile, avatar_url: avatarUrl });
      toast({
        title: "Profile saved!",
        description: "Your changes have been saved.",
      });
    }

    setSavingProfile(false);
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Handle thumbnail file selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

    // Check if embed URL is allowed
    const embedCheck = checkEmbedUrl(newGame.embed_url);
    if (!embedCheck.allowed) {
      toast({
        title: "URL not allowed",
        description: embedCheck.reason,
        variant: "destructive",
      });
      return;
    }

    if (embedCheck.warning) {
      toast({
        title: "Warning",
        description: embedCheck.warning,
      });
    }

    setSubmitting(true);
    const supabase = createClient();
    
    const slug = generateSlug(newGame.title) + "-" + Date.now().toString(36);
    let thumbnailUrl: string | null = null;

    // Upload thumbnail if provided
    if (thumbnailFile) {
      const fileExt = thumbnailFile.name.split(".").pop();
      const filePath = `${user.id}/${slug}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("game-thumbnails")
        .upload(filePath, thumbnailFile);

      if (uploadError) {
        console.error("Error uploading thumbnail:", uploadError);
        toast({
          title: "Error uploading thumbnail",
          description: uploadError.message,
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("game-thumbnails")
        .getPublicUrl(filePath);
      
      thumbnailUrl = publicUrl;
    }
    
    const { data, error } = await supabase
      .from("games")
      .insert({
        creator_id: user.id,
        title: newGame.title,
        slug: slug,
        embed_url: newGame.embed_url,
        short_description: newGame.short_description || null,
        thumbnail_url: thumbnailUrl,
        genres: primaryGenre ? [primaryGenre, ...(secondaryGenre ? [secondaryGenre] : [])] : null,
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
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setPrimaryGenre("");
      setSecondaryGenre("");
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

  // Start editing a game
  const startEditingGame = (game: Game) => {
    setEditingGame(game);
    setEditForm({
      title: game.title,
      embed_url: game.embed_url,
      short_description: game.short_description || "",
    });
    setThumbnailPreview(game.thumbnail_url);
    setThumbnailFile(null);
    setShowEditGame(true);
  };

  // Handle edit game submission
  const handleEditGame = async () => {
    if (!editingGame || !editForm.title || !editForm.embed_url) {
      toast({
        title: "Missing fields",
        description: "Please fill in the game title and embed URL.",
        variant: "destructive",
      });
      return;
    }

    // Check if embed URL is allowed
    const embedCheck = checkEmbedUrl(editForm.embed_url);
    if (!embedCheck.allowed) {
      toast({
        title: "URL not allowed",
        description: embedCheck.reason,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    let thumbnailUrl = editingGame.thumbnail_url;

    // Upload new thumbnail if provided
    if (thumbnailFile && user) {
      const fileExt = thumbnailFile.name.split(".").pop();
      const filePath = `${user.id}/${editingGame.slug}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("game-thumbnails")
        .upload(filePath, thumbnailFile);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("game-thumbnails")
          .getPublicUrl(filePath);
        thumbnailUrl = publicUrl;
      }
    }

    const { error } = await supabase
      .from("games")
      .update({
        title: editForm.title,
        embed_url: editForm.embed_url,
        short_description: editForm.short_description || null,
        thumbnail_url: thumbnailUrl,
      })
      .eq("id", editingGame.id);

    if (error) {
      toast({
        title: "Error updating game",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Game updated!",
        description: "Your changes have been saved.",
      });
      setGames(games.map(g => 
        g.id === editingGame.id 
          ? { ...g, ...editForm, thumbnail_url: thumbnailUrl }
          : g
      ));
      setShowEditGame(false);
      setEditingGame(null);
      setThumbnailFile(null);
      setThumbnailPreview(null);
    }

    setSubmitting(false);
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
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="primaryGenre">Primary Genre *</Label>
                            <select
                              id="primaryGenre"
                              value={primaryGenre}
                              onChange={(e) => {
                                setPrimaryGenre(e.target.value);
                                if (e.target.value === secondaryGenre) {
                                  setSecondaryGenre("");
                                }
                              }}
                              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                            >
                              <option value="">Select genre...</option>
                              {GENRES.map((genre) => (
                                <option key={genre} value={genre}>
                                  {genre}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="secondaryGenre">Secondary Genre</Label>
                            <select
                              id="secondaryGenre"
                              value={secondaryGenre}
                              onChange={(e) => setSecondaryGenre(e.target.value)}
                              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                              disabled={!primaryGenre}
                            >
                              <option value="">None</option>
                              {GENRES.filter(g => g !== primaryGenre).map((genre) => (
                                <option key={genre} value={genre}>
                                  {genre}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="thumbnail">Thumbnail Image</Label>
                          <div className="flex items-center gap-4">
                            {thumbnailPreview ? (
                              <div className="relative w-24 h-14 rounded overflow-hidden bg-muted">
                                <img
                                  src={thumbnailPreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setThumbnailFile(null);
                                    setThumbnailPreview(null);
                                  }}
                                  className="absolute top-0 right-0 p-1 bg-black/50 text-white rounded-bl text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="w-24 h-14 rounded bg-muted flex items-center justify-center">
                                <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <Input
                              id="thumbnail"
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailChange}
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Recommended: 400x225px (16:9 ratio)
                          </p>
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

                  {/* Edit Game Dialog */}
                  <Dialog open={showEditGame} onOpenChange={setShowEditGame}>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Edit Game</DialogTitle>
                        <DialogDescription>
                          Update your game details.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-title">Game Title</Label>
                          <Input
                            id="edit-title"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-embed_url">Embed URL</Label>
                          <Input
                            id="edit-embed_url"
                            value={editForm.embed_url}
                            onChange={(e) => setEditForm({ ...editForm, embed_url: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-description">Short Description</Label>
                          <Input
                            id="edit-description"
                            value={editForm.short_description}
                            onChange={(e) => setEditForm({ ...editForm, short_description: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-thumbnail">Thumbnail Image</Label>
                          <div className="flex items-center gap-4">
                            {thumbnailPreview ? (
                              <div className="relative w-24 h-14 rounded overflow-hidden bg-muted">
                                <img
                                  src={thumbnailPreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-24 h-14 rounded bg-muted flex items-center justify-center">
                                <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <Input
                              id="edit-thumbnail"
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailChange}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditGame(false)} disabled={submitting}>
                          Cancel
                        </Button>
                        <Button onClick={handleEditGame} disabled={submitting}>
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
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
                          onClick={() => startEditingGame(game)}
                          title="Edit game"
                        >
                          <Edit className="h-4 w-4" />
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
                
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <div className="text-2xl font-bold text-neon-cyan">{games.length}</div>
                    <div className="text-sm text-muted-foreground">Total Games</div>
                  </div>
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <div className="text-2xl font-bold text-neon-purple">
                      {games.filter(g => g.status === "published").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Published</div>
                  </div>
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <div className="text-2xl font-bold text-green-400">
                      {games.reduce((sum, g) => sum + (g.game_scores?.[0]?.play_count || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Plays</div>
                  </div>
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <div className="text-2xl font-bold text-pink-400">
                      {games.reduce((sum, g) => sum + (g.game_scores?.[0]?.total_reactions || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Reactions</div>
                  </div>
                </div>

                {/* Per-Game Analytics */}
                <h3 className="font-semibold mb-4">Game Performance</h3>
                <div className="space-y-3">
                  {games.length === 0 ? (
                    <div className="p-8 rounded-lg bg-card border border-border text-center">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No games yet. Create your first game to see analytics.
                      </p>
                    </div>
                  ) : (
                    games
                      .sort((a, b) => (b.game_scores?.[0]?.play_count || 0) - (a.game_scores?.[0]?.play_count || 0))
                      .map((game) => {
                        const scores = game.game_scores?.[0];
                        return (
                          <div key={game.id} className="p-4 rounded-lg bg-card border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                                  {game.thumbnail_url ? (
                                    <img 
                                      src={game.thumbnail_url} 
                                      alt="" 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium">{game.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {game.status === "published" ? "Published" : "Draft"}
                                  </div>
                                </div>
                              </div>
                              {scores?.tier && scores.tier !== "NEW" && (
                                <TierBadge tier={scores.tier} size="sm" />
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className="text-lg font-semibold">{scores?.play_count || 0}</div>
                                <div className="text-xs text-muted-foreground">Plays</div>
                              </div>
                              <div>
                                <div className="text-lg font-semibold">{scores?.total_reactions || 0}</div>
                                <div className="text-xs text-muted-foreground">Reactions</div>
                              </div>
                              <div>
                                <div className="text-lg font-semibold">{scores?.weighted_score || 0}</div>
                                <div className="text-xs text-muted-foreground">Score</div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
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
                    
                    {/* Avatar */}
                    <div className="space-y-2">
                      <Label>Avatar</Label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-muted-foreground">
                              {profile.display_name?.charAt(0) || "?"}
                            </span>
                          )}
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input 
                        id="display_name" 
                        value={profile.display_name}
                        onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                        placeholder="Tell others about yourself..."
                      />
                    </div>
                    <Button onClick={handleSaveProfile} disabled={savingProfile}>
                      {savingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
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
