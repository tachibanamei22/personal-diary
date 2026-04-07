import { redirect } from "next/navigation";
import { createDraftEntry } from "@/lib/actions/entries";

export const metadata = { title: "New Entry — My Diary" };

// Create a blank draft entry on the server and immediately redirect
// to the entry view in edit mode — so images can be added straight away.
export default async function NewEntryPage() {
  const entry = await createDraftEntry();
  redirect(`/dashboard/entries/${entry.id}?new=true`);
}
