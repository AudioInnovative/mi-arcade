# Mi Arcade – MVP Direction
**Project Lead:** Tyler  
**Document Type:** High-level product and build direction  
**Version:** 1.0  
**Last Updated:** 2025-11-29

Mi Arcade is a web-based arcade hub where creators embed their own HTML5/WebGL games and players discover, rate, and share them. It blends the feel of an old-school social profile (MySpace energy) with a modern game portal.

The goal of this MVP is to:
- Prove the core loop: creators add games → players play and rate them → discovery surfaces good games.
- Establish a rating + discovery system that feels fair and modern.
- Ship a creator profile system that’s visually distinct but safe and responsive.
- Lay foundations for revenue sharing via ads.

---

## 1. Core Product Pillars

1. **Web-based only (no downloads)**
   - All games are HTML5/WebGL.
   - All play inside Mi Arcade’s shell via iframe.

2. **Link-based games (MVP)**
   - Creators host their own builds (GitHub Pages, Netlify, etc.).
   - Mi Arcade embeds them via iframe on a game page.

3. **Creator-centric**
   - Each creator has a profile with:
     - Banner, avatar, bio.
     - Theming (colors, layout template).
     - List of their games.

4. **Ratings + Tiers**
   - Lightweight reactions: Play, Like, Love, Favorite.
   - Weighted score on a 0–100 scale.
   - Tier badges (S/A/B/C/D/F) displayed prominently.

5. **Ad-supported with future rev share**
   - Ads live in Mi Arcade’s page shell, not inside the game iframe.
   - MVP: track impressions and hypothetical split; real payouts can follow later.

---

## 2. MVP Scope (What We Are Building Now)

### 2.1 User Types

- **Player**
  - Create account.
  - Browse and search games.
  - Play games.
  - React (Like, Love, Favorite).
  - Favorite games.
  - Leave comments (if enabled on that game).
  - View and lightly customize a player profile (avatar, bio).

- **Creator**
  - Everything a Player can do, plus:
    - Create a **Creator Profile**.
    - Add and manage games.
    - Customize profile theme (from presets).
    - View basic stats (plays, score, reactions).

- **Admin (internal only)**
  - Moderate reported games and comments.
  - Flag/remove abusive content.
  - View internal analytics.

### 2.2 Key Flows

#### 2.2.1 Creator Onboarding
- Sign up / log in.
- Choose “I’m a creator” (or upgrade from player).
- Set:
  - Display name.
  - @handle.
  - Avatar and banner.
  - Short bio.
  - Theme (pick from presets).
- Land in Creator Dashboard.

#### 2.2.2 Add Game (MVP)
- Creator clicks **Add Game**.
- Form:
  - Title (required).
  - Slug (auto-derived from title, editable).
  - Short description (required).
  - Long description (optional).
  - Thumbnail (upload).
  - Genres/tags (multi-select).
  - **Game Embed URL** (required).
- Creator clicks **Test Embed**:
  - Backend checks:
    - HTTP 200 OK.
    - No X-Frame-Options: DENY/SAMEORIGIN.
    - CSP allows framing.
    - Game loads in iframe in a test container.
  - If passes → mark as “Embed OK”.
  - If fails → error message with hints.
- Game saved as **Draft**.
- Creator can preview game page.
- Creator publishes the game → visible in discovery.

#### 2.2.3 Player Plays a Game
- Player visits `/g/[slug]`.
- Sees:
  - Game title + creator.
  - Tier badge (if enough data) or “New Game”.
  - Top ad unit.
  - Game iframe (responsive).
  - Reaction bar (Like/Love/Favorite).
  - Score and tier.
  - Description.
  - Comments.
  - More games by this creator.
- Player taps/clicks **Play Fullscreen** (optional):
  - Game iframe expands to fullscreen mode.
  - Exit fullscreen returns to normal layout.

#### 2.2.4 Reactions and Score
- Player can:
  - Do nothing (just play).
  - Like.
  - Love.
  - Favorite.
  - Change or remove their reaction.
- Values:
  - Play (3+ minutes) → value 25, weight 0.25.
  - Like → 50, weight 1.
  - Love → 75, weight 2.
  - Favorite → 100, weight 3.
- Score capped to last 30 days of reactions.
- Score updated once per day globally.
- Score shown only after:
  - At least 10 total reactions.
  - AND game has existed 24+ hours.
  - Before that, show “New Game”.

---

## 3. Non-Goals for MVP

- No direct file uploads for game builds.
- No AI game coding assistance.
- No complex messaging/friends/social graph.
- No direct payout implementation (only tracking).
- No raw HTML/CSS customization for profiles (no MySpace-style full chaos yet).

---

## 4. Platform Principles

1. **Creator safety**
   - Protect against stolen games (eventual domain verification).
   - Clear reporting flows and moderation.

2. **Performance**
   - Mobile-first layout.
   - Games live in iframes; shell remains fast.

3. **Simplicity**
   - Clear flows for both creators and players.
   - Avoid feature creep in MVP.

4. **Extensibility**
   - Database and API designed for future:
     - Direct hosting.
     - Rev share.
     - Advanced customization.
     - AI helpers.

---

## 5. Acceptance Criteria (MVP)

- A creator can:
  - Create an account.
  - Set up a profile.
  - Add at least one game via external URL.
  - See their game embedded and playable.
  - See basic stats for that game.

- A player can:
  - Create an account.
  - Browse a list of games (Trending, New).
  - Play a game on desktop and mobile.
  - React to a game and see their reaction.
  - See a score and tier for games with enough data.

- Admin can:
  - See and review reported games.
  - Remove problematic games/comments.

Once all of the above are working, Mi Arcade’s MVP is considered complete and ready for early testers.
