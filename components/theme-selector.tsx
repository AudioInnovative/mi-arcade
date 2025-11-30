"use client";

import { useState } from "react";
import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { THEMES, Theme } from "@/lib/themes";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ThemeSelectorProps {
  currentThemeId: string;
  userId: string;
  onThemeChange?: (themeId: string) => void;
}

export function ThemeSelector({ currentThemeId, userId, onThemeChange }: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentThemeId);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ theme_id: selectedTheme })
      .eq("id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save theme.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Theme saved",
        description: "Your profile theme has been updated.",
      });
      onThemeChange?.(selectedTheme);
      setOpen(false);
    }

    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="h-4 w-4 mr-2" />
          Change Theme
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose Your Profile Theme</DialogTitle>
          <DialogDescription>
            Select a color theme for your profile page.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 py-4">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`relative p-3 rounded-lg border-2 transition-all ${
                selectedTheme === theme.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <div className="flex gap-1 mb-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: theme.primary_color }}
                />
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: theme.secondary_color }}
                />
              </div>
              <p className="text-xs font-medium truncate">{theme.name}</p>
              {selectedTheme === theme.id && (
                <div className="absolute top-1 right-1">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-2">Preview</p>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
              style={{ backgroundColor: THEMES.find(t => t.id === selectedTheme)?.primary_color }}
            >
              A
            </div>
            <div>
              <h3
                className="font-heading text-xl font-bold"
                style={{ color: THEMES.find(t => t.id === selectedTheme)?.primary_color }}
              >
                Your Name
              </h3>
              <p className="text-muted-foreground">@yourhandle</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Theme"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
