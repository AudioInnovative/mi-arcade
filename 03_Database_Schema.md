# Mi Arcade – Database Schema (MVP)
**Backend:** Supabase (Postgres)  
**Version:** 1.0  

This document describes the core tables and relations needed for the Mi Arcade MVP.

---

## 1. Overview of Entities

- `users` – base auth users (managed largely by Supabase).
- `profiles` – extended profile info for each user.
- `creators` – flags and settings for users who act as creators.
- `games` – game metadata.
- `game_embed_checks` – history/log of embed tests.
- `reactions` – reactions to games (play/like/love/favorite).
- `game_scores` – daily calculated scores.
- `comments` – comments on games.
- `reports` – reports for abuse/stolen games/comments.
- `themes` – preset theme configurations.
- `analytics_game_daily` – rollup for daily stats per game.
- `ads_impressions` – simple impression tracking (MVP-level).

---

## 2. Core Tables

### 2.1 `profiles`

One row per user.

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  handle text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  banner_url text,
  bio text,
  is_creator boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

- `handle`: used in URLs like `/@handle`.
- `is_creator`: whether the user has creator capabilities.

### 2.2 `creators`

Additional data specific to creators.

```sql
CREATE TABLE creators (
  id uuid PRIMARY KEY REFERENCES profiles (id) ON DELETE CASCADE,
  theme_id uuid REFERENCES themes (id),
  total_plays bigint DEFAULT 0,
  total_reactions bigint DEFAULT 0,
  total_games int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 2.3 `themes`

Preset themes.

```sql
CREATE TABLE themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  primary_color text NOT NULL,
  secondary_color text NOT NULL,
  accent_color text NOT NULL,
  background_variant text, -- e.g., 'neon', 'galaxy'
  created_at timestamptz DEFAULT now()
);
```

---

## 3. Games & Embeds

### 3.1 `games`

```sql
CREATE TABLE games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creators (id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  short_description text NOT NULL,
  long_description text,
  thumbnail_url text,
  embed_url text NOT NULL,
  status text NOT NULL DEFAULT 'draft', -- 'draft' | 'published' | 'unlisted'
  genres text[] DEFAULT ARRAY[]::text[],
  tags text[] DEFAULT ARRAY[]::text[],
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT games_slug_creator UNIQUE (creator_id, slug)
);
```

### 3.2 `game_embed_checks`

For logging embed test attempts.

```sql
CREATE TABLE game_embed_checks (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  game_id uuid REFERENCES games (id) ON DELETE CASCADE,
  checked_at timestamptz DEFAULT now(),
  success boolean NOT NULL,
  status_code int,
  x_frame_options text,
  csp_header text,
  error_message text
);
```

---

## 4. Reactions & Scores

### 4.1 `reactions`

Each row is a user’s reaction to a specific game at a specific time.

```sql
CREATE TYPE reaction_type AS ENUM ('none', 'play', 'like', 'love', 'favorite');

CREATE TABLE reactions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES games (id) ON DELETE CASCADE,
  reaction reaction_type NOT NULL,
  play_duration_seconds int DEFAULT 0, -- for play-based values
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT reactions_user_game_unique UNIQUE (user_id, game_id)
);
```

Behavior:
- `reaction`:
  - `play` applies only if `play_duration_seconds >= 180`.
  - `like`, `love`, `favorite` can be set immediately.
- When user changes reaction, update this row.

### 4.2 `game_scores`

Stores daily scores.

```sql
CREATE TABLE game_scores (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  game_id uuid NOT NULL REFERENCES games (id) ON DELETE CASCADE,
  score_date date NOT NULL,
  score int NOT NULL, -- 0-100
  tier text NOT NULL, -- 'S' | 'A' | 'B' | 'C' | 'D' | 'F' | 'NEW'
  total_weight numeric NOT NULL,
  total_reactions int NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT game_scores_unique_day UNIQUE (game_id, score_date)
);
```

- The current score displayed is from the latest `score_date`.
- Calculation uses only reactions from last 30 days.

---

## 5. Comments & Reports

### 5.1 `comments`

```sql
CREATE TABLE comments (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  game_id uuid NOT NULL REFERENCES games (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 5.2 `reports`

```sql
CREATE TYPE report_target_type AS ENUM ('game', 'comment');

CREATE TABLE reports (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  reporter_id uuid REFERENCES profiles (id) ON DELETE SET NULL,
  target_type report_target_type NOT NULL,
  target_id bigint NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now(),
  resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES profiles (id),
  resolved_at timestamptz
);
```

`target_id` points to:
- `games.id` when `target_type = 'game'`.
- `comments.id` when `target_type = 'comment'`.

---

## 6. Analytics & Ads

### 6.1 `analytics_game_daily`

Basic aggregated stats per game per day.

```sql
CREATE TABLE analytics_game_daily (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  game_id uuid NOT NULL REFERENCES games (id) ON DELETE CASCADE,
  stats_date date NOT NULL,
  play_count int DEFAULT 0,
  unique_players int DEFAULT 0,
  avg_session_seconds numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT analytics_game_unique_day UNIQUE (game_id, stats_date)
);
```

### 6.2 `ads_impressions`

Lightweight tracking for impressions.

```sql
CREATE TABLE ads_impressions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  game_id uuid REFERENCES games (id) ON DELETE CASCADE,
  placement text NOT NULL, -- 'top', 'bottom', 'sidebar'
  impression_at timestamptz DEFAULT now()
);
```

---

## 7. RLS & Security Notes (High-Level)

- `profiles`:
  - Users can `SELECT` public fields of all profiles.
  - Users can `UPDATE` only their own profile.

- `creators`:
  - Creator row exists only for users flagged as creators.
  - Only the creator and admins can update.

- `games`:
  - `SELECT` only where `status = 'published'` for public.
  - Creators can `SELECT/UPDATE` their own games.
  - Admin can `SELECT/UPDATE` all.

- `reactions`:
  - Users can `SELECT` their own reactions.
  - Aggregations done in backend or views.

- `comments`:
  - Public can `SELECT` for published games.
  - Users can `INSERT` comments.
  - Users can `UPDATE/DELETE` only their own comments (or admin).

This schema is MVP-level and should be evolved as we add direct hosting, payouts, and more social features.
