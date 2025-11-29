import type { Metadata } from "next";
import { Orbitron, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://miarcade.me"),
  title: {
    default: "Mi Arcade - Play Free Online Games",
    template: "%s | Mi Arcade",
  },
  description:
    "Discover, play, and share HTML5 games. Create your own arcade profile and showcase your games to the world.",
  keywords: ["arcade", "games", "html5", "webgl", "indie games", "game portal", "free games", "online games", "browser games"],
  authors: [{ name: "Mi Arcade" }],
  creator: "Mi Arcade",
  publisher: "Mi Arcade",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://miarcade.me",
    siteName: "Mi Arcade",
    title: "Mi Arcade - Play Free Online Games",
    description: "Discover, play, and share HTML5 games. Create your own arcade profile and showcase your games.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mi Arcade",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mi Arcade - Play Free Online Games",
    description: "Discover, play, and share HTML5 games. Create your own arcade profile.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add these when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${orbitron.variable} ${inter.variable} font-body antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
