export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ReactionType = "none" | "play" | "like" | "love" | "favorite";
export type GameStatus = "draft" | "published" | "unlisted";
export type ReportTargetType = "game" | "comment";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          handle: string;
          display_name: string;
          avatar_url: string | null;
          banner_url: string | null;
          bio: string | null;
          is_creator: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          handle: string;
          display_name: string;
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          is_creator?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          handle?: string;
          display_name?: string;
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          is_creator?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      creators: {
        Row: {
          id: string;
          theme_id: string | null;
          total_plays: number;
          total_reactions: number;
          total_games: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          theme_id?: string | null;
          total_plays?: number;
          total_reactions?: number;
          total_games?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          theme_id?: string | null;
          total_plays?: number;
          total_reactions?: number;
          total_games?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      themes: {
        Row: {
          id: string;
          name: string;
          primary_color: string;
          secondary_color: string;
          accent_color: string;
          background_variant: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          primary_color: string;
          secondary_color: string;
          accent_color: string;
          background_variant?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          primary_color?: string;
          secondary_color?: string;
          accent_color?: string;
          background_variant?: string | null;
          created_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          slug: string;
          short_description: string;
          long_description: string | null;
          thumbnail_url: string | null;
          embed_url: string;
          status: GameStatus;
          genres: string[];
          tags: string[];
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          slug: string;
          short_description: string;
          long_description?: string | null;
          thumbnail_url?: string | null;
          embed_url: string;
          status?: GameStatus;
          genres?: string[];
          tags?: string[];
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          title?: string;
          slug?: string;
          short_description?: string;
          long_description?: string | null;
          thumbnail_url?: string | null;
          embed_url?: string;
          status?: GameStatus;
          genres?: string[];
          tags?: string[];
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_embed_checks: {
        Row: {
          id: number;
          game_id: string | null;
          checked_at: string;
          success: boolean;
          status_code: number | null;
          x_frame_options: string | null;
          csp_header: string | null;
          error_message: string | null;
        };
        Insert: {
          id?: number;
          game_id?: string | null;
          checked_at?: string;
          success: boolean;
          status_code?: number | null;
          x_frame_options?: string | null;
          csp_header?: string | null;
          error_message?: string | null;
        };
        Update: {
          id?: number;
          game_id?: string | null;
          checked_at?: string;
          success?: boolean;
          status_code?: number | null;
          x_frame_options?: string | null;
          csp_header?: string | null;
          error_message?: string | null;
        };
      };
      reactions: {
        Row: {
          id: number;
          user_id: string;
          game_id: string;
          reaction: ReactionType;
          play_duration_seconds: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          game_id: string;
          reaction: ReactionType;
          play_duration_seconds?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          game_id?: string;
          reaction?: ReactionType;
          play_duration_seconds?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_scores: {
        Row: {
          id: number;
          game_id: string;
          score_date: string;
          score: number;
          tier: string;
          total_weight: number;
          total_reactions: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          game_id: string;
          score_date: string;
          score: number;
          tier: string;
          total_weight: number;
          total_reactions: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          game_id?: string;
          score_date?: string;
          score?: number;
          tier?: string;
          total_weight?: number;
          total_reactions?: number;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: number;
          game_id: string;
          user_id: string;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          game_id: string;
          user_id: string;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          game_id?: string;
          user_id?: string;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: number;
          reporter_id: string | null;
          target_type: ReportTargetType;
          target_id: number;
          reason: string | null;
          created_at: string;
          resolved: boolean;
          resolved_by: string | null;
          resolved_at: string | null;
        };
        Insert: {
          id?: number;
          reporter_id?: string | null;
          target_type: ReportTargetType;
          target_id: number;
          reason?: string | null;
          created_at?: string;
          resolved?: boolean;
          resolved_by?: string | null;
          resolved_at?: string | null;
        };
        Update: {
          id?: number;
          reporter_id?: string | null;
          target_type?: ReportTargetType;
          target_id?: number;
          reason?: string | null;
          created_at?: string;
          resolved?: boolean;
          resolved_by?: string | null;
          resolved_at?: string | null;
        };
      };
      analytics_game_daily: {
        Row: {
          id: number;
          game_id: string;
          stats_date: string;
          play_count: number;
          unique_players: number;
          avg_session_seconds: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          game_id: string;
          stats_date: string;
          play_count?: number;
          unique_players?: number;
          avg_session_seconds?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          game_id?: string;
          stats_date?: string;
          play_count?: number;
          unique_players?: number;
          avg_session_seconds?: number;
          created_at?: string;
        };
      };
      ads_impressions: {
        Row: {
          id: number;
          game_id: string | null;
          placement: string;
          impression_at: string;
        };
        Insert: {
          id?: number;
          game_id?: string | null;
          placement: string;
          impression_at?: string;
        };
        Update: {
          id?: number;
          game_id?: string | null;
          placement?: string;
          impression_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      reaction_type: ReactionType;
      report_target_type: ReportTargetType;
    };
  };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Creator = Database["public"]["Tables"]["creators"]["Row"];
export type Game = Database["public"]["Tables"]["games"]["Row"];
export type Theme = Database["public"]["Tables"]["themes"]["Row"];
export type Reaction = Database["public"]["Tables"]["reactions"]["Row"];
export type GameScore = Database["public"]["Tables"]["game_scores"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
