"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdUnit({ 
  slot, 
  format = "auto", 
  responsive = true,
  className = "" 
}: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (isLoaded.current) return;
    
    try {
      if (typeof window !== "undefined" && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoaded.current = true;
      }
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-9290821408652543"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

// Pre-configured ad components for common placements
export function BannerAd({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full max-w-4xl mx-auto my-4 ${className}`}>
      <AdUnit slot="auto" format="horizontal" />
    </div>
  );
}

export function SidebarAd({ className = "" }: { className?: string }) {
  return (
    <div className={`hidden lg:block ${className}`}>
      <AdUnit slot="auto" format="rectangle" />
    </div>
  );
}

export function InFeedAd({ className = "" }: { className?: string }) {
  return (
    <div className={`col-span-full my-2 ${className}`}>
      <AdUnit slot="auto" format="auto" />
    </div>
  );
}

// Placeholder for development (shows where ads will appear)
export function AdPlaceholder({ 
  label = "Ad", 
  className = "" 
}: { 
  label?: string;
  className?: string;
}) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className={`bg-muted/30 border border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm ${className}`}>
      {label}
    </div>
  );
}
