"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOODS, type DiaryEntry } from "@/types";
import EntryForm from "@/components/diary/EntryForm";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";

interface EntryViewProps {
  entry: DiaryEntry;
}

export default function EntryView({ entry }: EntryViewProps) {
  const [editing, setEditing] = useState(false);
  const mood = MOODS.find((m) => m.value === entry.mood);

  if (editing) {
    return <EntryForm entry={entry} />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-6">
      {/* Nav */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5 rounded-xl">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </div>

      {/* Meta */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {mood && <span className="text-xl">{mood.emoji}</span>}
          <span>{format(new Date(entry.created_at), "EEEE, MMMM d, yyyy")}</span>
          {entry.updated_at !== entry.created_at && (
            <span className="text-xs">· edited {format(new Date(entry.updated_at), "MMM d")}</span>
          )}
        </div>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {entry.title || "Untitled entry"}
        </h1>
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs rounded-full font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="tiptap-editor prose-warm text-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: entry.content }}
      />
    </div>
  );
}
