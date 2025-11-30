// Blocked domains - games from these portals cannot be embedded
// This prevents stolen games from being added
const BLOCKED_DOMAINS = [
  // Major game portals
  "itch.io",
  "newgrounds.com",
  "kongregate.com",
  "armorgames.com",
  "miniclip.com",
  "poki.com",
  "crazygames.com",
  "y8.com",
  "addictinggames.com",
  "agame.com",
  "gameflare.com",
  "silvergames.com",
  "kizi.com",
  "friv.com",
  "coolmathgames.com",
  
  // Game hosting platforms
  "gamejolt.com",
  "games.construct.net",
  "playcanvas.com",
  
  // Generic hosting that often hosts stolen content
  "iogames.space",
];

// Suspicious patterns in URLs
const SUSPICIOUS_PATTERNS = [
  /\/embed\//i,
  /\/play\//i,
  /\?game=/i,
  /\/games?\//i,
];

export interface EmbedCheckResult {
  allowed: boolean;
  reason?: string;
  warning?: string;
}

export function checkEmbedUrl(url: string): EmbedCheckResult {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    // Check blocked domains
    for (const domain of BLOCKED_DOMAINS) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        return {
          allowed: false,
          reason: `Games from ${domain} cannot be embedded. Please host your game on your own domain (GitHub Pages, Netlify, etc.).`,
        };
      }
    }

    // Check for suspicious patterns (warning only)
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(url)) {
        return {
          allowed: true,
          warning: "This URL pattern is commonly used by game portals. Make sure you own this game.",
        };
      }
    }

    // Require HTTPS for security
    if (parsedUrl.protocol !== "https:") {
      return {
        allowed: false,
        reason: "Only HTTPS URLs are allowed for security.",
      };
    }

    return { allowed: true };
  } catch (error) {
    return {
      allowed: false,
      reason: "Invalid URL format.",
    };
  }
}

// Recommended hosting providers
export const RECOMMENDED_HOSTS = [
  { name: "GitHub Pages", url: "https://pages.github.com" },
  { name: "Netlify", url: "https://netlify.com" },
  { name: "Vercel", url: "https://vercel.com" },
  { name: "Cloudflare Pages", url: "https://pages.cloudflare.com" },
  { name: "Firebase Hosting", url: "https://firebase.google.com/products/hosting" },
];
