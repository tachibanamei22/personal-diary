"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MOODS, type DiaryEntry } from "@/types";
import { Trash2 } from "lucide-react";
import { deleteEntry } from "@/lib/actions/entries";
import { toast } from "sonner";
import { useState } from "react";

interface EntryCardProps {
  entry: DiaryEntry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const [deleting, setDeleting] = useState(false);
  const mood = MOODS.find((m) => m.value === entry.mood);

  // Strip HTML tags for preview
  const preview = entry.content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm("Delete this entry? This can't be undone.")) return;
    setDeleting(true);
    try {
      await deleteEntry(entry.id);
      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete entry");
      setDeleting(false);
    }
  }

  return (
    <Link href={`/dashboard/entries/${entry.id}`} className="block group">
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
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
            title="Delete entry"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </article>
    </Link>
  );
}
