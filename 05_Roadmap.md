# Mi Arcade – Roadmap (MVP → Phase 2)
**Version:** 1.0  

This roadmap describes the planned phases for Mi Arcade, starting with MVP and outlining the next most likely feature waves.

---

## Phase 0 – Foundations (In Progress / Immediate)

**Goals:**
- Finalize architecture and data model.
- Get basic end-to-end flow working in dev.

**Key Tasks:**
- [ ] Set up Next.js + Supabase + Tailwind + ShadCN.
- [ ] Implement auth (signup/login/logout).
- [ ] Implement `profiles` table and profile edit page.
- [ ] Create basic homepage with placeholder sections.
- [ ] Implement basic creator toggle (is_creator flag).

**Exit Criteria:**
- Developer can log into local environment and edit their profile.
- App can deploy successfully to staging on Vercel.

---

## Phase 1 – MVP Core (Link-Based Games)

**Goals:**
- Support creation and publishing of games via external URLs.
- Support players browsing and playing games.
- Support basic reactions and ranking.

**Key Features:**
- Creator Dashboard:
  - Add Game (external URL, metadata, thumbnail).
  - List My Games.
  - Edit & Publish/Unpublish.
- Game Page:
  - Iframe-based embedding.
  - Rating UI (Like/Love/Favorite).
  - Basic score display (placeholder until scoring job runs).
- Rating System:
  - Store per-user reactions.
  - Cron/edge function to compute daily scores.
  - Tier badges computed from scores.
- Discovery:
  - Trending.
  - New releases.
  - Top rated.
- Creator Profiles:
  - Theming with presets.
  - List of games.

**Tech Tasks:**
- [ ] Implement `games` table and API.
- [ ] Implement iframe embed tests.
- [ ] Enforce basic security for iframe usage.
- [ ] Implement reactions UI and backend schema.
- [ ] Background job for scoring (daily).
- [ ] Caching or efficient querying for discovery lists.

**Exit Criteria:**
- A creator can:
  - Add a game via URL.
  - Pass embed test.
  - Publish it.
- A player can:
  - Find the game from the homepage.
  - Play it.
  - React to it.
  - See a score and tier after enough time and reactions.

---

## Phase 2 – Analytics, Reporting & Anti-Theft

**Goals:**
- Give creators genuinely useful stats.
- Introduce minimum viable protection against stolen games.
- Improve platform trust and data quality.

**Key Features:**
- Analytics (Creator View):
  - Per-game:
    - Plays (last 30 days).
    - Unique players.
    - Reaction breakdown.
    - Score history (simple chart).
- Reporting System:
  - Report game.
  - Report comment.
  - Admin review queue.
- Anti-Theft (First Layer):
  - Block known third-party game portals (e.g., itch.io domains).
  - Embed URL warning for suspicious hosts.
  - Admin warnings for repeated offenders.

**Tech Tasks:**
- [ ] Implement `analytics_game_daily` aggregation.
- [ ] Implement charts in dashboard.
- [ ] Implement `reports` table and admin UI.
- [ ] Blocklist domains in embed test logic.

**Exit Criteria:**
- Creators can view basic analytics per game.
- Reporting works end-to-end (user → admin → resolution).

---

## Phase 3 – Domain Verification & Monetization Prep

**Goals:**
- Strengthen ownership guarantees for games.
- Begin serious preparation for rev share with ad-based monetization.

**Key Features:**
- Domain Ownership Verification:
  - Creator adds a host/domain in dashboard.
  - System provides a signed token.
  - Creator uploads a verification file (e.g., `arcadeinnovative-verify.txt` or `miarcade-verify.txt`).
  - System checks and approves domain.
  - Only verified domains can be used for new games (or flagged clearly otherwise).
- Monetization Data:
  - Track ad impressions by game.
  - Track estimated revenue (hypothetical values initially).
  - Show creators a “Revenue (Beta)” section in dashboard.

**Tech Tasks:**
- [ ] Implement `verified_domains` table.
- [ ] Implement verification flow and check logic.
- [ ] Extend `ads_impressions` tracking.
- [ ] Build revenue estimation logic (configurable rates).
- [ ] Creator UI for viewing estimated revenue.

**Exit Criteria:**
- Creators can verify a domain.
- New games can be restricted to verified domains (feature flag).
- Creators can see a simple estimated revenue number per game.

---

## Phase 4 – Profile Customization & Social Layer

**Goals:**
- Deepen creator identity and expression.
- Make Mi Arcade feel more like a living community than a static portal.

**Key Features:**
- Profile Customization Expansion:
  - Additional themes.
  - Layout variants (centered, sidebar, gallery).
  - Stickers and decorations.
  - Optional profile music (from a safe track library).
- Social Layer:
  - Player profiles (minimal).
  - Follow creators.
  - “Activity” section (e.g., “New game from creator X”).
  - Game collections or playlists (future).

**Tech Tasks:**
- [ ] Extend `themes` and profile customization fields.
- [ ] Implement sticker system (with limits).
- [ ] Build follow relationship schema (user_follows_creator).
- [ ] Implement simple activity feed.

**Exit Criteria:**
- Creators can significantly customize their profiles through presets.
- Players can follow creators and see a basic activity timeline.

---

## Phase 5 – Direct Upload Hosting (Post-MVP, Major Feature)

**Goals:**
- Allow select creators (or all) to upload builds directly.
- Own the full game hosting stack.

**Key Features:**
- Direct upload of HTML5/WebGL builds.
- Build storage in object storage (Supabase storage or S3).
- Hosting through Mi Arcade’s CDN.
- Enhanced security and analytics.

**Tech Tasks:**
- [ ] Design `game_builds` storage format.
- [ ] Implement upload and extraction pipeline.
- [ ] Implement hosting URLs and routing.
- [ ] Automated scanning / validation of builds.

**Exit Criteria:**
- At least one build path working end-to-end for direct hosting.
- Backward compatibility with link-based games preserved.

---

## Prioritization Notes

- **Non-negotiable for MVP:**
  - Link-based games.
  - Ratings and tiers.
  - Basic discovery.
  - Creator profiles + themes.
  - Basic analytics and admin moderation.

- **Can be deferred if needed:**
  - Complex social features (followers, feeds).
  - Fancy profile customization.
  - Direct hosting.
  - Fine-grained revenue dashboards.

This roadmap should be revisited after MVP launch based on real user feedback and traction.
