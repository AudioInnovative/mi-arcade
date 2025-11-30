import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold mb-4">
              <Gamepad2 className="h-6 w-6 text-neon-cyan" />
              <span className="text-gradient">Mi Arcade</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your personal web arcade. Discover, play, and share HTML5 games from creators around the world.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/games" className="hover:text-primary transition-colors">
                  Browse Games
                </Link>
              </li>
              <li>
                <Link href="/creators" className="hover:text-primary transition-colors">
                  Creators
                </Link>
              </li>
              <li>
                <Link href="/trending" className="hover:text-primary transition-colors">
                  Trending
                </Link>
              </li>
              <li>
                <Link href="/become-creator" className="hover:text-primary transition-colors">
                  Become a Creator
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Mi Arcade. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/contact" className="hover:text-primary transition-colors">
              Report an Issue
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
