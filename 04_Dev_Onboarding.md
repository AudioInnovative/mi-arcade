# Mi Arcade – Developer Onboarding
**Audience:** Engineers joining the Mi Arcade project  
**Version:** 1.0  

Welcome to Mi Arcade. This document explains how to get the project running locally, how the codebase is structured, and how we expect contributions to be made.

---

## 1. Tech Stack Overview

- **Frontend:** Next.js (App Router), React, TypeScript.
- **Styling:** TailwindCSS + ShadCN UI components.
- **Backend:** Supabase (Postgres, Auth, Storage).
- **Deployment:** Vercel.
- **Analytics / Jobs:** Supabase edge functions or cron-like schedulers.

---

## 2. Prerequisites

- Node.js (LTS) installed.
- pnpm or npm or yarn (project will specify).
- Supabase CLI (for local dev with full backend).
- Git access to the repository.
- Access to:
  - Supabase project credentials (for staging/prod).
  - Vercel project (if deploying).

---

## 3. Getting the Code

```bash
git clone <repo-url> mi-arcade
cd mi-arcade
```

Install dependencies:

```bash
pnpm install
# or
npm install
```

---

## 4. Environment Setup

Create `.env.local` in the root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=<from Supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase>
SUPABASE_SERVICE_ROLE_KEY=<for server-side jobs>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

If using Supabase locally:

```bash
supabase start
```

Then connect the local URL/keys instead of remote ones.

---

## 5. Running the App

```bash
pnpm dev
# or
npm run dev
```

App should run at: `http://localhost:3000`.

Basic smoke test:
- Home page loads.
- Login/signup works (with Supabase email or magic link).
- You can create a dummy profile.

---

## 6. Codebase Structure (Suggested)

```text
/src
  /app
    /page.tsx              # Home
    /g/[slug]/page.tsx     # Game page
    /@/[handle]/page.tsx   # Creator profile
    /dashboard
      /creator/page.tsx    # Creator dashboard
  /components
    /layout
    /game
    /profile
    /ads
    /ui                   # ShadCN wrappers
  /lib
    /supabase.ts          # Client and server helpers
    /rating.ts            # Rating logic
    /analytics.ts
    /auth.ts
  /types
  /hooks
```

This may vary based on final repo decisions, but the above is the conceptual layout.

---

## 7. Core Concepts You Should Understand

### 7.1 Games & Iframes
- Games are not built or hosted by us in MVP.
- They live on external URLs.
- We embed them via iframe in `/g/[slug]`.

Important implications:
- Ads sit outside iframes.
- We must test iframes for:
  - Embeddability.
  - Security headers.
- Game logic is not part of our repo.

### 7.2 Rating System

For each game and player, we track a single reaction row.

Values:
- Play (3+ min) → value 25, weight 0.25.
- Like → 50, weight 1.
- Love → 75, weight 2.
- Favorite → 100, weight 3.

Score calculation (edge function / cron job):
- Once per day.
- Only consider reactions from last 30 days.
- Use weighted average:
  - `score = Σ(value × weight) / Σ(weight)`.
- Score 0–100, rounded to whole number.
- Tier assignment:
  - S: 95–100
  - A: 86–94
  - B: 75–85
  - C: 65–74
  - D: 55–64
  - F: 0–54

### 7.3 Creator Profiles

- `profiles` table holds global user info.
- `creators` table adds creator-specific info.
- Theme is chosen from `themes` presets.
- No raw HTML/CSS allowed in MVP.

---

## 8. Development Workflow

### 8.1 Branching Strategy

- `main` – always deployable.
- `dev` – integration branch for new work (if used).
- Feature branches:
  - `feature/<short-description>`.

### 8.2 Pull Requests

Each PR should:
- Reference a ticket/issue if applicable.
- Include screenshots/GIFs for UI changes.
- Be small and focused when possible.

### 8.3 Code Style

- Use TypeScript for all React components.
- Use functional components and hooks.
- Use Tailwind for styling + limited custom CSS if needed.
- Prefer ShadCN components for base UI primitives.

---

## 9. Local Testing

- Unit tests (if configured) via:
  ```bash
  pnpm test
  ```
- Manual flows to test frequently:
  - Signup / login.
  - Create profile.
  - Add game and test embed.
  - Play game and add reactions.
  - Confirm reactions show correct UI states.
  - View creator profile and theme.

---

## 10. Deployment

### 10.1 Vercel

- Connect GitHub repo to Vercel.
- Auto-deploy on pushes to `main`.
- Environment variables must be configured in Vercel dashboard.

### 10.2 Supabase

- Use migrations for schema changes.
- Avoid ad-hoc manual edits in production DB.
- Keep schema.sql or migration files versioned.

---

## 11. How to Ask for Help

- Use the team chat channel (e.g., #mi-arcade-dev) for questions.
- Tag the tech lead for architectural questions.
- Document any recurring patterns in the repo’s `/docs` folder.

This onboarding document should be kept up-to-date as the project evolves. New engineers should be able to get from clone → running app → first PR in under a day.
