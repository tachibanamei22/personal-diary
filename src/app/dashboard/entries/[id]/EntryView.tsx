"use client";

import { useState } from "react";
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
}

export default function EntryView({ entry, images: initialImages }: EntryViewProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  // Lifted state — shared between edit and view modes so changes are instant
  const [images, setImages] = useState<EntryImage[]>(initialImages);
  const mood = MOODS.find((m) => m.value === entry.mood);

  function handleDone() {
    setEditing(false);
    // Refresh server component so updated text, mood, tags flow down
    router.refresh();
  }

  if (editing) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Nav */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Button variant="outline" size="sm" onClick={handleDone} className="gap-1.5 rounded-xl">
            <Check className="h-3.5 w-3.5" />
            Done editing
          </Button>
        </div>

        {/* Photos canvas (edit mode) */}
        <div className="relative" style={{ minHeight: "520px" }}>
          <ImageCanvas
            entryId={entry.id}
            images={images}
            onImagesChange={setImages}
            editable={true}
          />
        </div>

        {/* Text editor */}
        <EntryForm entry={entry} onDone={handleDone} />
      </div>
    );
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

      {/* Content + photos (view mode) */}
      <div className="relative" style={{ minHeight: images.length > 0 ? "520px" : undefined }}>
        <div
          className="tiptap-editor text-foreground leading-relaxed"
          style={{ paddingBottom: images.length > 0 ? "2rem" : undefined }}
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
        <ImageCanvas
          entryId={entry.id}
          images={images}
          onImagesChange={setImages}
          editable={false}
        />
      </div>
    </div>
  );
}
