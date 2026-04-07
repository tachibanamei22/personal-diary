"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MOODS, type DiaryEntry } from "@/types";
import { Trash2, Loader2 } from "lucide-react";
import { deleteEntry } from "@/lib/actions/entries";
import { toast } from "sonner";
import { useState } from "react";

interface EntryCardProps {
  entry: DiaryEntry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const mood = MOODS.find((m) => m.value === entry.mood);

  // Strip HTML tags for preview
  const preview = entry.content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteEntry(entry.id);
      toast.success("Entry deleted");
      setOpen(false);
    } catch {
      toast.error("Failed to delete entry");
      setDeleting(false);
    }
  }

  return (
    <div className="relative group">
      <Link href={`/dashboard/entries/${entry.id}`} className="block">
        <article className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-sm transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                {mood && (
                  <span className="text-lg" title={mood.label}>{mood.emoji}</span>
                )}
                <span className="text-xs text-muted-foreground">
                  {format(new Date(entry.created_at), "MMMM d, yyyy")}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-base text-foreground truncate group-hover:text-primary transition-colors">
                {entry.title || "Untitled entry"}
              </h3>
              {preview && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {preview}
                </p>
              )}
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-normal rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Delete button — stops link propagation via Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                onClick={(e) => e.preventDefault()}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground shrink-0"
                title="Delete entry"
              >
                <Trash2 className="h-4 w-4" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-heading">Delete entry?</DialogTitle>
                  <DialogDescription>
                    &ldquo;{entry.title || "Untitled entry"}&rdquo; will be permanently deleted. This can&apos;t be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={deleting}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-xl gap-2"
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </article>
      </Link>
    </div>
  );
}
