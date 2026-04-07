"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { updateProfile } from "@/lib/actions/profile";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface SettingsFormProps {
  initialDisplayName: string;
  initialUsername: string;
  email: string;
}

export default function SettingsForm({ initialDisplayName, initialUsername, email }: SettingsFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [username, setUsername] = useState(initialUsername);
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateProfile({ display_name: displayName.trim(), username: username.trim() });
        toast.success("Profile updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update profile");
      }
    });
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Profile section */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="font-heading font-semibold text-base">Profile</h2>
        <Separator />

        <div className="space-y-1.5">
          <Label htmlFor="display_name">Display name</Label>
          <Input
            id="display_name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground">How your name appears in the app (e.g. on the dashboard greeting).</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="john_doe"
              className="pl-7"
              minLength={3}
              maxLength={30}
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">Lowercase letters, numbers, underscores. Used to log in.</p>
        </div>
      </div>

      {/* Account section (read-only) */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="font-heading font-semibold text-base">Account</h2>
        <Separator />
        <div className="space-y-1.5">
          <Label>Email address</Label>
          <Input value={email} readOnly className="bg-muted/40 text-muted-foreground cursor-default" />
          <p className="text-xs text-muted-foreground">Your email address cannot be changed here.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="rounded-xl gap-2 px-6">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}
