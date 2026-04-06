import { notFound } from "next/navigation";
import { getEntry } from "@/lib/actions/entries";
import EntryView from "./EntryView";
import type { DiaryEntry } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EntryPage({ params }: Props) {
  const { id } = await params;
  const entry = await getEntry(id);
  if (!entry) notFound();
  return <EntryView entry={entry as DiaryEntry} />;
}
