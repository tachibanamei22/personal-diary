"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateProfile, deleteAccount } from "@/lib/actions/profile";
import { toast } from "sonner";
import { Loader2, Save, Trash2 } from "lucide-react";

interface SettingsFormProps {
  initialDisplayName: string;
  initialUsername: string;
  email: string;
}

export default function SettingsForm({ initialDisplayName, initialUsername, email }: SettingsFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [username, setUsername] = useState(initialUsername);
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startSave(async () => {
      try {
        await updateProfile({ display_name: displayName.trim(), username: username.trim() });
        toast.success("Profile updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update profile");
      }
    });
  }

  function handleDelete() {
    startDelete(async () => {
      try {
        await deleteAccount();
        toast.success("Account deleted");
        router.push("/login");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete account");
        setDeleteOpen(false);
      }
    });
  }

  return (
    <div className="space-y-6">
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
            <p className="text-xs text-muted-foreground">How your name appears on the dashboard greeting.</p>
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
            <p className="text-xs text-muted-foreground">Used to log in. Lowercase letters, numbers, underscores.</p>
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
          <Button type="submit" disabled={isSaving} className="rounded-xl gap-2 px-6">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </Button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="bg-card border border-destructive/30 rounded-2xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-base text-destructive">Danger zone</h2>
        <Separator className="border-destructive/20" />
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently delete your account and all diary entries. This cannot be undone.
            </p>
          </div>
          <Dialog open={deleteOpen} onOpenChange={(o) => { setDeleteOpen(o); setDeleteConfirm(""); }}>
            <DialogTrigger className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="h-4 w-4" />
              Delete account
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-heading">Delete your account?</DialogTitle>
                <DialogDescription>
                  This will permanently delete all your diary entries and your profile. You cannot undo this.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 py-1">
                <Label htmlFor="confirm-delete" className="text-sm">
                  Type <span className="font-mono font-semibold text-foreground">delete my account</span> to confirm
                </Label>
                <Input
                  id="confirm-delete"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="delete my account"
                  autoComplete="off"
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || deleteConfirm !== "delete my account"}
                  className="rounded-xl gap-2"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
