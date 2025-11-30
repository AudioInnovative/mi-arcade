# Mi Arcade – Roadmap (MVP → Phase 2)
**Version:** 2.0  
**Last Updated:** 2025-11-30

This roadmap describes the planned phases for Mi Arcade, starting with MVP and outlining the next most likely feature waves.

---

## Phase 0 – Foundations ✅ COMPLETE

**Goals:**
- Finalize architecture and data model.
- Get basic end-to-end flow working in dev.

**Key Tasks:**
- [x] Set up Next.js + Supabase + Tailwind + ShadCN.
- [x] Implement auth (signup/login/logout).
- [x] Implement `profiles` table and profile edit page.
- [x] Create basic homepage with placeholder sections.
- [x] Implement basic creator toggle (is_creator flag).

**Exit Criteria:** ✅
- Developer can log into local environment and edit their profile.
- App can deploy successfully to staging on Vercel.

---

## Phase 1 – MVP Core (Link-Based Games) ✅ COMPLETE

**Goals:**
- Support creation and publishing of games via external URLs.
- Support players browsing and playing games.
- Support basic reactions and ranking.

**Key Features:**
- Creator Dashboard:
  - [x] Add Game (external URL, metadata, thumbnail).
  - [x] List My Games.
  - [x] Edit & Publish/Unpublish.
- Game Page:
  - [x] Iframe-based embedding.
  - [x] Rating UI (Like/Love/Favorite).
  - [x] Basic score display (placeholder until scoring job runs).
- Rating System:
  - [x] Store per-user reactions.
  - [x] `calculate_game_score` function created.
  - [x] Tier badges computed from scores.
- Discovery:
  - [x] Trending.
  - [x] New releases.
  - [x] Top rated.
- Creator Profiles:
  - [x] Theming with presets.
  - [x] List of games.

**Tech Tasks:**
- [x] Implement `games` table and API.
- [x] Implement iframe embed tests.
- [x] Enforce basic security for iframe usage (sandbox attribute).
- [x] Implement reactions UI and backend schema.
- [x] Scoring function (needs scheduled job setup).
- [x] Caching or efficient querying for discovery lists.

**Exit Criteria:** ✅
- A creator can add a game via URL, pass embed test, and publish it.
- A player can find, play, and react to games.
- Scores and tiers display correctly.

---

## Phase 2 – Analytics, Reporting & Anti-Theft 🟡 IN PROGRESS

**Goals:**
- Give creators genuinely useful stats.
- Introduce minimum viable protection against stolen games.
- Improve platform trust and data quality.

**Key Features:**
- Analytics (Creator View):
  - Per-game:
    - [x] Plays (last 30 days) - basic tracking
    - [ ] Unique players
    - [x] Reaction breakdown
    - [ ] Score history chart
- Reporting System:
  - [x] Report game.
  - [x] Report comment.
  - [ ] Admin review queue UI.
- Anti-Theft (First Layer):
  - [x] Block known third-party game portals (itch.io, etc.).
  - [x] Embed URL warning for suspicious hosts.
  - [ ] Admin warnings for repeated offenders.

**Tech Tasks:**
- [x] Implement `analytics_game_daily` table.
- [x] Implement charts in dashboard (basic bar chart component).
- [x] Implement `reports` table and admin UI with stats.
- [x] Blocklist domains in embed test logic.
- [x] Daily scoring cron job (pg_cron scheduled).

**Exit Criteria:**
- [x] Creators can view analytics per game.
- [x] Reporting works end-to-end (user → admin → resolution).

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
