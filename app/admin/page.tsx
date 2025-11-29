"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Loader2,
  MessageSquare,
  Gamepad2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  reporter?: { handle: string; display_name: string };
  game?: { title: string; slug: string } | null;
  comment?: { body: string } | null;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<"pending" | "resolved" | "all">("pending");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) return;
      
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      
      if (!profile?.is_admin) {
        router.push("/");
        return;
      }
      
      setIsAdmin(true);
      fetchReports();
    }

    if (!userLoading) {
      if (!user) {
        router.push("/login");
      } else {
        checkAdmin();
      }
    }
  }, [user, userLoading, router]);

  async function fetchReports() {
    const supabase = createClient();
    
    let query = supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter === "pending") {
      query = query.eq("status", "pending");
    } else if (filter === "resolved") {
      query = query.neq("status", "pending");
    }

    const { data } = await query;
    
    if (data) {
      // Fetch additional data for each report
      const enrichedReports = await Promise.all(
        data.map(async (report) => {
          const enriched: Report = { ...report };
          
          // Get reporter info
          const { data: reporter } = await supabase
            .from("profiles")
            .select("handle, display_name")
            .eq("id", report.reporter_id)
            .single();
          enriched.reporter = reporter || undefined;
          
          // Get target info
          if (report.target_type === "game") {
            const { data: game } = await supabase
              .from("games")
              .select("title, slug")
              .eq("id", report.target_id)
              .single();
            enriched.game = game;
          } else if (report.target_type === "comment") {
            const { data: comment } = await supabase
              .from("comments")
              .select("body")
              .eq("id", report.target_id)
              .single();
            enriched.comment = comment;
          }
          
          return enriched;
        })
      );
      
      setReports(enrichedReports);
    }
    
    setLoading(false);
  }

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
    }
  }, [filter, isAdmin]);

  async function handleResolve(reportId: string, action: "dismiss" | "remove") {
    setProcessing(reportId);
    
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action }),
      });

      if (!res.ok) {
        throw new Error("Failed to process report");
      }

      toast({
        title: action === "dismiss" ? "Report dismissed" : "Content removed",
        description: action === "dismiss" 
          ? "The report has been marked as resolved."
          : "The reported content has been removed.",
      });

      fetchReports();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process report.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-neon-cyan" />
        <h1 className="font-heading text-3xl font-bold">Admin Panel</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
          size="sm"
        >
          Pending
        </Button>
        <Button
          variant={filter === "resolved" ? "default" : "outline"}
          onClick={() => setFilter("resolved")}
          size="sm"
        >
          Resolved
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          size="sm"
        >
          All
        </Button>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold mb-2">No reports</h3>
            <p className="text-muted-foreground">
              {filter === "pending" 
                ? "No pending reports to review."
                : "No reports found."}
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="p-4 rounded-lg bg-card border border-border"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Report Type Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    {report.target_type === "game" ? (
                      <span className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                        <Gamepad2 className="h-3 w-3" />
                        Game
                      </span>
                    ) : report.target_type === "comment" ? (
                      <span className="flex items-center gap-1 text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                        <MessageSquare className="h-3 w-3" />
                        Comment
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                        <User className="h-3 w-3" />
                        Profile
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      report.status === "pending" 
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  {/* Target Info */}
                  <div className="mb-2">
                    {report.game && (
                      <Link 
                        href={`/g/${report.game.slug}`}
                        className="font-medium hover:text-primary"
                      >
                        {report.game.title}
                      </Link>
                    )}
                    {report.comment && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        "{report.comment.body}"
                      </p>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium capitalize">{report.reason}</span>
                  </div>

                  {report.details && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {report.details}
                    </p>
                  )}

                  {/* Reporter & Time */}
                  <div className="text-xs text-muted-foreground">
                    Reported by @{report.reporter?.handle} · {new Date(report.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                {report.status === "pending" && (
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolve(report.id, "dismiss")}
                      disabled={processing === report.id}
                    >
                      {processing === report.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Dismiss
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleResolve(report.id, "remove")}
                      disabled={processing === report.id}
                    >
                      {processing === report.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </>
                      )}
                    </Button>
                    {report.game && (
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                      >
                        <Link href={`/g/${report.game.slug}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
