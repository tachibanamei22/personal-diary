"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MoodPicker from "./MoodPicker";
import TagInput from "./TagInput";
import { createEntry, updateEntry } from "@/lib/actions/entries";
import type { DiaryEntry, Mood } from "@/types";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Lazy-load editor to avoid SSR issues
const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-border rounded-2xl h-64 bg-muted/30 animate-pulse" />
  ),
});

interface EntryFormProps {
  entry?: DiaryEntry;
  onDone?: () => void;
}

export default function EntryForm({ entry, onDone }: EntryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(entry?.title ?? "");
  const [content, setContent] = useState(entry?.content ?? "");
  const [mood, setMood] = useState<Mood | null>((entry?.mood as Mood) ?? null);
  const [tags, setTags] = useState<string[]>(entry?.tags ?? []);

  function handleSave() {
    startTransition(async () => {
      try {
        if (entry) {
          await updateEntry(entry.id, { title, content, mood, tags });
          toast.success("Entry updated");
          onDone?.();
        } else {
          const newEntry = await createEntry({ title, content, mood, tags });
          toast.success("Entry saved");
          router.push(`/dashboard/entries/${newEntry.id}`);
          return;
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className={onDone ? "space-y-6" : "max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-6"}>
      {/* Header — only shown when used as standalone page (not embedded) */}
      {!onDone && (
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-heading text-2xl font-bold">
            {entry ? "Edit entry" : "New entry"}
          </h1>
        </div>
      )}

      {/* Title */}
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Give this entry a title…"
        className="text-lg font-heading font-semibold h-12 rounded-xl border-border"
      />

      {/* Mood */}
      <MoodPicker value={mood} onChange={setMood} />

      {/* Editor */}
      <RichTextEditor
        content={content}
        onChange={setContent}
        placeholder="What's on your mind today?"
      />

      {/* Tags */}
      <div className="space-y-1.5">
        <label className="text-sm text-muted-foreground">Tags</label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending} className="rounded-xl gap-2 px-6">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {entry ? "Update entry" : "Save entry"}
        </Button>
      </div>
    </div>
  );
}
