"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOODS, type DiaryEntry, type EntryImage } from "@/types";
import EntryForm from "@/components/diary/EntryForm";
import ImageCanvas from "@/components/diary/ImageCanvas";
import { ArrowLeft, Pencil, Check } from "lucide-react";
import Link from "next/link";

interface EntryViewProps {
  entry: DiaryEntry;
  images: EntryImage[];
  startInEditMode?: boolean;
}

export default function EntryView({ entry, images: initialImages, startInEditMode = false }: EntryViewProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(startInEditMode);
  const [images, setImages] = useState<EntryImage[]>(initialImages);
  const mood = MOODS.find((m) => m.value === entry.mood);
  const canvasRef = useRef<HTMLDivElement>(null);

  function handleDone() {
    setEditing(false);
    // Clean up ?new=true from the URL without adding to history stack
    router.replace(`/dashboard/entries/${entry.id}`);
    router.refresh();
  }

  return (
    // Outer wrapper: full-width so the image canvas can extend into margins
    <div className="relative w-full px-4 md:px-8 py-8 animate-page-enter">

      {/* ── Nav bar ──────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-6">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        {editing ? (
          <Button variant="outline" size="sm" onClick={handleDone} className="gap-1.5 rounded-xl">
            <Check className="h-3.5 w-3.5" />
            Done editing
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5 rounded-xl">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </div>

      {/* ── Live preview area (same in both modes) ───────── */}
      {/* This full-width relative div IS the canvas for polaroids */}
      <div ref={canvasRef} className="relative w-full" style={{ minHeight: images.length > 0 || editing ? "480px" : undefined }}>

        {/* Text content — centered column, z-index 0 */}
        <div className="relative max-w-3xl mx-auto space-y-4" style={{ zIndex: 0 }}>
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

          {/* Rendered text */}
          <div
            className="tiptap-editor text-foreground leading-relaxed"
            style={{ paddingBottom: "3rem" }}
            dangerouslySetInnerHTML={{ __html: entry.content }}
          />
        </div>

        {/* Polaroid canvas — covers full width, images float freely */}
        <ImageCanvas
          entryId={entry.id}
          images={images}
          onImagesChange={setImages}
          editable={editing}
          canvasRef={canvasRef}
        />
      </div>

      {/* ── Text editor — only in edit mode, below the preview ── */}
      {editing && (
        <div className="max-w-3xl mx-auto mt-8 pt-6 border-t border-border space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-4">
            Edit text, mood &amp; tags
          </p>
          <EntryForm entry={entry} onDone={handleDone} />
        </div>
      )}
    </div>
  );
}
