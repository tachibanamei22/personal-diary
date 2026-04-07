"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOODS, type DiaryEntry, type EntryImage, type Mood } from "@/types";
import EntryForm, { type EntryFormHandle } from "@/components/diary/EntryForm";
import ImageCanvas from "@/components/diary/ImageCanvas";
import { ArrowLeft, Pencil, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface EntryViewProps {
  entry: DiaryEntry;
  images: EntryImage[];
  startInEditMode?: boolean;
}

export default function EntryView({ entry, images: initialImages, startInEditMode = false }: EntryViewProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(startInEditMode);
  const [images, setImages] = useState<EntryImage[]>(initialImages);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Lifted state — keeps live preview in sync while typing in the editor below
  const [liveTitle, setLiveTitle] = useState(entry.title);
  const [liveMood, setLiveMood] = useState<Mood | null>((entry.mood as Mood) ?? null);
  const [liveContent, setLiveContent] = useState(entry.content);

  // Ref to the embedded form so "Done editing" can trigger save
  const formRef = useRef<EntryFormHandle>(null);
  const [saving, setSaving] = useState(false);

  async function handleDone() {
    if (!formRef.current) { setEditing(false); return; }
    setSaving(true);
    try {
      await formRef.current.save();
      toast.success("Entry saved");
      setEditing(false);
      router.replace(`/dashboard/entries/${entry.id}`);
      router.refresh();
    } catch {
      // error already toasted inside save()
    } finally {
      setSaving(false);
    }
  }

  const displayMood = editing ? MOODS.find((m) => m.value === liveMood) : MOODS.find((m) => m.value === entry.mood);
  const displayTitle = editing ? liveTitle : entry.title;

  return (
    <div className="relative w-full px-4 md:px-8 py-8 animate-page-enter">

      {/* ── Nav bar ──────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-6">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        {editing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDone}
            disabled={saving}
            className="gap-1.5 rounded-xl min-w-32"
          >
            {saving
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Check className="h-3.5 w-3.5" />}
            {saving ? "Saving…" : "Done editing"}
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5 rounded-xl">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </div>

      {/* ── Live preview area ────────────────────────────── */}
      <div ref={canvasRef} className="relative w-full" style={{ minHeight: images.length > 0 || editing ? "480px" : undefined }}>

        {/* Text content */}
        <div className="relative max-w-3xl mx-auto space-y-4" style={{ zIndex: 0 }}>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {displayMood && <span className="text-xl">{displayMood.emoji}</span>}
              <span>{format(new Date(entry.created_at), "EEEE, MMMM d, yyyy")}</span>
              {!startInEditMode && entry.updated_at !== entry.created_at && (
                <span className="text-xs">· edited {format(new Date(entry.updated_at), "MMM d")}</span>
              )}
            </div>

            {/* Title — live while editing */}
            <h1 className="font-heading text-3xl font-bold text-foreground">
              {displayTitle || (
                <span className="text-muted-foreground/50 font-normal italic text-2xl">No title yet…</span>
              )}
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

          {/* Rendered text — live in edit mode, static in view mode */}
          <div
            className="tiptap-editor text-foreground leading-relaxed"
            style={{ paddingBottom: images.length > 0 ? "3rem" : undefined }}
            dangerouslySetInnerHTML={{ __html: editing ? liveContent : entry.content }}
          />
        </div>

        {/* Polaroid canvas */}
        <ImageCanvas
          entryId={entry.id}
          images={images}
          onImagesChange={setImages}
          editable={editing}
          canvasRef={canvasRef}
        />
      </div>

      {/* ── Editor — only in edit mode ───────────────────── */}
      {editing && (
        <div className="max-w-3xl mx-auto mt-6 pt-6 border-t border-border">
          <EntryForm
            ref={formRef}
            entry={entry}
            onDone={handleDone}
            onTitleChange={setLiveTitle}
            onMoodChange={setLiveMood}
            onContentChange={setLiveContent}
          />
        </div>
      )}
    </div>
  );
}
