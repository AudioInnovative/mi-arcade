import { redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Gamepad2, Rocket, Users, BarChart3, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Become a Creator",
  description: "Share your HTML5 games with the world on Mi Arcade. Join our community of game creators.",
  openGraph: {
    title: "Become a Creator | Mi Arcade",
    description: "Share your HTML5 games with the world on Mi Arcade.",
  },
};

export default async function BecomeCreatorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is logged in, check if they're already a creator
  if (user) {
    const { data: creator } = await supabase
      .from("creators")
      .select("id")
      .eq("id", user.id)
      .single();

    // If already a creator, redirect to dashboard
    if (creator) {
      redirect("/dashboard");
    }
  }

  const benefits = [
    {
      icon: Gamepad2,
      title: "Share Your Games",
      description: "Upload and share your HTML5 games with players around the world.",
    },
    {
      icon: Users,
      title: "Build Your Audience",
      description: "Grow your following and connect with players who love your games.",
    },
    {
      icon: BarChart3,
      title: "Track Performance",
      description: "Get detailed analytics on plays, reactions, and player engagement.",
    },
    {
      icon: DollarSign,
      title: "Earn Revenue",
      description: "Monetize your games through ad revenue sharing (coming soon).",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Rocket className="h-4 w-4" />
          Join the Creator Program
        </div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
          Share Your Games with the World
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Mi Arcade makes it easy to publish, promote, and monetize your HTML5 games. 
          Join our growing community of indie game creators.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">
                  Already have an account? Log in
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <benefit.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2">
              {benefit.title}
            </h3>
            <p className="text-muted-foreground">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="font-heading text-3xl font-bold mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold mb-2">Sign Up</h3>
            <p className="text-sm text-muted-foreground">
              Create your free Mi Arcade account
            </p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold mb-2">Upload Your Game</h3>
            <p className="text-sm text-muted-foreground">
              Host your game and add the embed URL
            </p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold mb-2">Start Growing</h3>
            <p className="text-sm text-muted-foreground">
              Get discovered and build your audience
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-12 px-8 rounded-2xl bg-gradient-to-r from-primary/10 to-neon-cyan/10 border border-border">
        <h2 className="font-heading text-2xl font-bold mb-4">
          Ready to share your games?
        </h2>
        <p className="text-muted-foreground mb-6">
          Join Mi Arcade today and start reaching players worldwide.
        </p>
        <Button size="lg" asChild>
          <Link href={user ? "/dashboard" : "/signup"}>
            {user ? "Go to Dashboard" : "Create Your Account"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
