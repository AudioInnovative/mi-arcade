"use client";

import { useState } from "react";
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

// Mock data
const mockGames = [
  {
    id: "1",
    title: "Space Invaders Remix",
    slug: "space-invaders-remix",
    status: "published",
    thumbnail_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=112&fit=crop",
    score: 92,
    tier: "A",
    play_count: 15420,
    reaction_count: 892,
    published_at: "2024-01-15",
  },
  {
    id: "2",
    title: "Asteroid Blaster",
    slug: "asteroid-blaster",
    status: "published",
    thumbnail_url: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=200&h=112&fit=crop",
    score: 85,
    tier: "B",
    play_count: 8200,
    reaction_count: 445,
    published_at: "2024-01-12",
  },
  {
    id: "3",
    title: "New Untitled Game",
    slug: "new-untitled-game",
    status: "draft",
    thumbnail_url: null,
    score: undefined,
    tier: "NEW",
    play_count: 0,
    reaction_count: 0,
    published_at: null,
  },
];

const stats = {
  total_games: 3,
  total_plays: 23620,
  total_reactions: 1337,
  average_score: 88,
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "games" | "analytics" | "settings">("overview");
  const [showAddGame, setShowAddGame] = useState(false);
  const [newGame, setNewGame] = useState({
    title: "",
    embed_url: "",
    short_description: "",
  });

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
                    {mockGames.slice(0, 3).map((game) => (
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
                            {game.tier && game.tier !== "NEW" && (
                              <>
                                <span>•</span>
                                <TierBadge tier={game.tier} score={game.score} size="sm" />
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{game.play_count.toLocaleString()} plays</div>
                          <div>{game.reaction_count.toLocaleString()} reactions</div>
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
                        <Button variant="outline" onClick={() => setShowAddGame(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setShowAddGame(false)}>
                          Create Game
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  {mockGames.map((game) => (
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
                          {game.tier && game.tier !== "NEW" && (
                            <>
                              <span>•</span>
                              <TierBadge tier={game.tier} score={game.score} size="sm" />
                            </>
                          )}
                          <span>•</span>
                          <span>{game.play_count.toLocaleString()} plays</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/g/${game.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
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
