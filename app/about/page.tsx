import { Metadata } from "next";
import Link from "next/link";
import { Gamepad2, Heart, Users, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Mi Arcade - your personal web arcade for discovering and playing HTML5 games.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-heading text-4xl font-bold mb-6">About Mi Arcade</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-xl text-muted-foreground mb-8">
            Mi Arcade is a platform dedicated to indie game creators and players who love 
            browser-based games. We believe great games deserve to be discovered.
          </p>

          <div className="grid gap-6 my-12">
            <div className="flex gap-4 p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Gamepad2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold mb-1">Play Anywhere</h3>
                <p className="text-muted-foreground">
                  All games run directly in your browser - no downloads, no installs.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold mb-1">Creator First</h3>
                <p className="text-muted-foreground">
                  We empower indie developers to share their games and build an audience.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold mb-1">Community Driven</h3>
                <p className="text-muted-foreground">
                  Players help surface the best games through reactions and feedback.
                </p>
              </div>
            </div>
          </div>

          <h2 className="font-heading text-2xl font-bold mt-12 mb-4">Our Mission</h2>
          <p className="text-muted-foreground mb-6">
            We're building the best place for HTML5 games on the web. Whether you're a 
            player looking for your next favorite game or a creator ready to share your 
            work with the world, Mi Arcade is for you.
          </p>

          <div className="flex gap-4 mt-8">
            <Button asChild>
              <Link href="/games">Browse Games</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/become-creator">Become a Creator</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
