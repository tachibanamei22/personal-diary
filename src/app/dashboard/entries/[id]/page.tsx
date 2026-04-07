import { notFound } from "next/navigation";
import { getEntry } from "@/lib/actions/entries";
import { getEntryImages } from "@/lib/actions/images";
import EntryView from "./EntryView";
import type { DiaryEntry, EntryImage } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}

export default async function EntryPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { new: isNew } = await searchParams;

  const [entry, images] = await Promise.all([
    getEntry(id),
    getEntryImages(id),
  ]);

  if (!entry) notFound();

  return (
    <EntryView
      entry={entry as DiaryEntry}
      images={images as EntryImage[]}
      startInEditMode={isNew === "true"}
    />
  );
}
