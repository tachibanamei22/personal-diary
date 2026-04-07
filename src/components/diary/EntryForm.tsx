"use client";

import { useState, useTransition, useImperativeHandle, useRef, useEffect, forwardRef } from "react";
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

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-border rounded-2xl h-64 bg-muted/30 animate-pulse" />
  ),
});

export interface EntryFormHandle {
  save: () => Promise<void>;
  isPending: boolean;
}

interface EntryFormProps {
  entry?: DiaryEntry;
  onDone?: () => void;
  /** Called whenever the title changes — lets parent update the live preview */
  onTitleChange?: (title: string) => void;
  /** Called whenever mood changes — lets parent update the live preview */
  onMoodChange?: (mood: Mood | null) => void;
  /** Called whenever content changes — lets parent update the live preview */
  onContentChange?: (content: string) => void;
}

const EntryForm = forwardRef<EntryFormHandle, EntryFormProps>(function EntryForm(
  { entry, onDone, onTitleChange, onMoodChange, onContentChange },
  ref
) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(entry?.title ?? "");
  const [content, setContent] = useState(entry?.content ?? "");
  const [mood, setMood] = useState<Mood | null>((entry?.mood as Mood) ?? null);
  const [tags, setTags] = useState<string[]>(entry?.tags ?? []);

  // Always-current ref so save() never reads stale closure values
  const latestValues = useRef({ title, content, mood, tags });
  useEffect(() => {
    latestValues.current = { title, content, mood, tags };
  }, [title, content, mood, tags]);

  function handleTitleChange(val: string) {
    setTitle(val);
    onTitleChange?.(val);
  }

  function handleMoodChange(val: Mood | null) {
    setMood(val);
    onMoodChange?.(val);
  }

  async function save() {
    // Read from ref — always has the latest values regardless of closure age
    const { title: t, content: c, mood: m, tags: tg } = latestValues.current;
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          if (entry) {
            await updateEntry(entry.id, { title: t, content: c, mood: m, tags: tg });
          } else {
            const newEntry = await createEntry({ title: t, content: c, mood: m, tags: tg });
            router.push(`/dashboard/entries/${newEntry.id}`);
          }
          resolve();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Something went wrong";
          toast.error(msg);
          reject(err);
        }
      });
    });
  }

  // Stable ref — save() reads latestValues ref so deps don't matter here
  useImperativeHandle(ref, () => ({ save, isPending }), [isPending]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={onDone ? "space-y-5" : "max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-6"}>
      {/* Header — standalone page only */}
      {!onDone && (
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
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
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Give this entry a title…"
        className="text-lg font-heading font-semibold h-12 rounded-xl border-border"
      />

      {/* Mood */}
      <MoodPicker value={mood} onChange={handleMoodChange} />

      {/* Editor */}
      <RichTextEditor
        content={content}
        onChange={(val) => { setContent(val); onContentChange?.(val); }}
        placeholder="What's on your mind today?"
      />

      {/* Tags */}
      <div className="space-y-1.5">
        <label className="text-sm text-muted-foreground">Tags</label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {/* Save button — only shown in standalone mode (not embedded in EntryView) */}
      {!onDone && (
        <div className="flex justify-end">
          <Button onClick={() => save().then(() => toast.success("Entry saved"))} disabled={isPending} className="rounded-xl gap-2 px-6">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {entry ? "Update entry" : "Save entry"}
          </Button>
        </div>
      )}
    </div>
  );
});

export default EntryForm;
