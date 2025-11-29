# Mi Arcade – UX & UI Design Spec (MVP)
**Document Type:** Design / UX Specification  
**Version:** 1.0  

This document describes the core user-facing layouts and interactions for Mi Arcade’s MVP.

---

## 1. Global Design Language

### 1.1 Visual Style
- Overall vibe: **neon arcade / modern web / dark mode first**.
- Base background: very dark gray or near-black.
- Accent colors:
  - Neon cyan.
  - Electric purple.
  - Optional accent gradients (cyan → magenta).
- Card style:
  - Rounded corners (8–12px).
  - Soft shadows.
  - Slight glow on hover for interactive elements.

### 1.2 Typography
- Heading font: futuristic but legible (e.g., Oxanium, Orbitron, or similar).
- Body font: clean sans-serif (e.g., Inter, Roboto).
- Text sizes:
  - H1: 28–32px.
  - H2: 22–26px.
  - Body: 14–16px.
  - Buttons: 14–16px bold.

### 1.3 Layout
- Desktop:
  - Max width: 1200–1440px container, centered.
  - 2–3 column layouts for lists.
- Mobile:
  - Single-column.
  - Game page: title → badge → game frame → actions → description → comments.

### 1.4 Buttons & States
- Primary button:
  - Filled, neon border, subtle glow on hover.
- Secondary:
  - Outlined with accent color.
- Disabled:
  - Lower opacity, no glow, cursor: not-allowed.

---

## 2. Navigation & Global Elements

### 2.1 Top Navigation Bar
- Left:
  - Logo (Mi Arcade).
  - “Games”.
  - “Creators”.
  - “Trending”.
- Right:
  - Search bar (icon + input).
  - “Log in” / “Sign up” when logged out.
  - Avatar + dropdown when logged in (Profile, Dashboard, Logout).

Mobile:
- Collapsed menu via hamburger.
- Search via icon tapping.

### 2.2 Footer
- Links: About, Terms, Privacy, Contact, Report issue.
- Muted text color.

---

## 3. Homepage Layout

### 3.1 Sections
Order (desktop and mobile):

1. **Hero strip** (optional simple):
   - Tagline: “Your Personal Web Arcade”
   - CTA: [Browse Games] [Become a Creator]

2. **Trending Games**
   - Horizontal scroll / grid of game cards.
   - Each card: thumbnail, title, creator, tier badge, score.

3. **New Releases**
   - Recently published games, marked “New Game”.

4. **Top Rated**
   - Games with highest scores (with min reactions).

5. **Creator Spotlight**
   - Highlighted creator profile preview.

### 3.2 Game Card UI
Each card shows:
- Thumbnail image.
- Tier badge and score (if available).
- “New Game” label if <24h or <10 reactions.
- Title.
- Creator name (@handle).
- Quick icon strip (mobile-friendly):
  - Play count icon + count.
  - Heart icon with count (likes + loves + favorites).

Card hover (desktop):
- Slight scale up.
- Glow border.
- “Play” CTA button appears in bottom-right.

---

## 4. Game Page UX (`/g/[slug]`)

### 4.1 Layout Structure

**Desktop:**
- Column layout with main content centered.

Order:
1. Title + creator name (@handle).
2. Tier badge (large emblem) and score (e.g., “A Tier – 87/100”).
3. Top ad unit (full width of main content).
4. Game iframe container:
   - Aspect ratio locked (16:9) on desktop.
   - Responsive width.
   - “Fullscreen” button overlay at top-right of the frame.
5. Reaction bar:
   - Buttons: Like, Love, Favorite.
   - Current selection highlighted.
   - Tooltips: “Like”, “Love”, “Favorite”.
6. Score display (dynamic text):
   - If enough data: “Score: 87/100 (A Tier)”.
   - Else: “New Game – rating soon”.
7. Description section:
   - Long description.
   - Tags (genre pills).
8. Bottom ad unit.
9. Comments section (if enabled by creator).
10. “More games by [Creator]” horizontally scrollable row.

**Mobile:**
- Same order, single column.
- Game iframe fills width, shorter height but maintains ratio.
- Fullscreen button should be large enough for thumb use.

### 4.2 Game Iframe Container

- Background: dark with subtle border/glow.
- If game fails to load:
  - Show error message: “Game failed to load. Try again or contact the creator.”
- Fullscreen:
  - On click: toggle fullscreen for just the game region.
  - Provide clear “Exit Fullscreen” overlay button.

### 4.3 Reactions UX

States:
- **No reaction**:
  - None selected; all buttons neutral.
- **Like, Love, or Favorite**:
  - Selected button highlighted with glow.
- **Change reaction**:
  - Clicking another button switches to that reaction.
- **Remove reaction**:
  - UI pattern option: clicking the selected state again prompts:
    - “Remove reaction?” Confirmation can be implicit (“click again to clear”).

Feedback:
- On click: small inline toast: “Reaction saved” or “Reaction removed” if needed.
- Rating updates not shown live; score refresh is daily.

---

## 5. Creator Profile UX (`/@handle`)

### 5.1 Layout

Sections:
1. Banner:
   - Image (creator-uploaded).
   - Overlay gradient (for readability).
2. Profile header:
   - Avatar (circle or hex).
   - Display name + @handle.
   - Creator badges (e.g., “Creator”, “Rising Star”).
   - Follow button (future feature; stubbed in).
3. About:
   - Short bio text.
4. Theme:
   - Profile background and accent colors applied to cards and buttons here.
5. Games list:
   - Grid of game cards with thumbnails and tier badges.
6. Optional sections (MVP simple toggles):
   - Links (YouTube, GitHub, itch, socials).

**Mobile:**
- Same sections stacked in single column.

### 5.2 Theme System (MVP)

Creators choose from a small set of presets:
- Neon Cyan & Purple (default).
- Galaxy Purple & Pink.
- Pixel Green & Black.
- Minimal Light.
- Minimal Dark.

Theme affects:
- Button colors.
- Card borders.
- Accent text.
- Profile header accent lines.

No custom CSS/HTML allowed in MVP.

---

## 6. Creator Dashboard UX

Main sections:
- **Overview**
  - Game count.
  - Total plays.
  - Average score across games.
- **My Games**
  - Table/grid of games:
    - Title.
    - Status (Draft/Published).
    - Plays.
    - Score.
    - Tier.
    - Actions: Edit, View, Unpublish.
- **Add Game**
  - Form as defined in MVP Direction.
- **Profile Settings**
  - Avatar, banner, bio.
  - Theme preset.
- **Analytics** (MVP light)
  - Per game:
    - Plays (last 30 days).
    - Reaction count.
    - Average score.

---

## 7. Comments UX

- Flat comment list (no deep threading in MVP).
- Each comment:
  - Avatar + name.
  - Timestamp.
  - Body text.
- Input:
  - Simple text area with submit button.
- Moderation:
  - “Report” link on each comment (opens a simple modal).
- Creator can toggle comments on/off per game from the dashboard.

---

## 8. Empty States & Error States

### 8.1 Empty States
- No games for a creator:
  - “This creator hasn’t added any games yet.”
- No search results:
  - “No games match that search. Try a different keyword or tag.”
- No comments:
  - “No comments yet. Be the first to share your thoughts.”

### 8.2 Error States
- Failed embed test:
  - “We couldn’t load this URL in an iframe. Check your hosting settings or try a different link.”
- Game load error:
  - Within iframe container: show fallback message.

---

## 9. Accessibility

- Color contrast: meet WCAG AA for text.
- All interactive elements keyboard-focusable.
- Focus ring visible on key elements.
- Alt text for thumbnails and avatars.
- ARIA labels on rating buttons (e.g., “Like this game”, “Love this game”).

This spec should be used by designers and frontend devs as the baseline for implementing Mi Arcade’s MVP experience.
