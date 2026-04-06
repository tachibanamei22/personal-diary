import { Suspense } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getEntries, getEntryDates } from "@/lib/actions/entries";
import EntryCard from "@/components/diary/EntryCard";
import DiaryCalendar from "@/components/diary/DiaryCalendar";
import SearchBar from "@/components/diary/SearchBar";
import { PenLine, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { DiaryEntry } from "@/types";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const [entries, entryDates, supabase] = await Promise.all([
    getEntries(q),
    getEntryDates(),
    createClient(),
  ]);

  const { data: { user } } = await supabase.auth.getUser();
  const firstName = user?.email?.split("@")[0] ?? "there";

  const streak = calcStreak(entryDates);

  return (
    <div className="px-4 md:px-8 py-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Hello, {firstName} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {entries.length > 0
              ? `${entries.length} entr${entries.length === 1 ? "y" : "ies"}${q ? ` matching "${q}"` : ""}`
              : "No entries yet — write your first one!"}
          </p>
        </div>
        <Link href="/dashboard/entries/new" className={buttonVariants({ className: "rounded-xl gap-2 shrink-0" })}>
          <PenLine className="h-4 w-4" />
          New Entry
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
        {/* Entry list */}
        <section>
          <div className="mb-4">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>

          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-muted p-5 mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-1">
                {q ? "No entries found" : "Your diary is empty"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {q
                  ? `Try a different search term.`
                  : "Start writing to capture your thoughts, feelings, and memories."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(entries as DiaryEntry[]).map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </section>

        {/* Sidebar widgets */}
        <aside className="space-y-4">
          <DiaryCalendar entryDates={entryDates} />

          {/* Streak card */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Writing streak</p>
            <div className="flex items-end gap-1.5">
              <span className="font-heading text-3xl font-bold text-primary">{streak}</span>
              <span className="text-muted-foreground text-sm pb-0.5">
                {streak === 1 ? "day" : "days"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {streak > 0 ? "Keep it up!" : "Write today to start a streak!"}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Count consecutive days (ending today) that have at least one entry. */
function calcStreak(isoDates: string[]): number {
  if (!isoDates.length) return 0;

  const uniqueDays = [
    ...new Set(isoDates.map((d) => d.slice(0, 10))),
  ].sort((a, b) => b.localeCompare(a));

  const todayStr = new Date().toISOString().slice(0, 10);

  let streak = 0;
  let cursor = todayStr;

  for (const day of uniqueDays) {
    if (day === cursor) {
      streak++;
      const d = new Date(cursor);
      d.setDate(d.getDate() - 1);
      cursor = d.toISOString().slice(0, 10);
    } else if (day < cursor) {
      break;
    }
  }

  return streak;
}
