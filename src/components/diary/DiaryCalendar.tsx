"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  isToday,
  isFuture,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiaryCalendarProps {
  entryDates: string[]; // ISO date strings
}

export default function DiaryCalendar({ entryDates }: DiaryCalendarProps) {
  const [current, setCurrent] = useState(new Date());

  const parsed = entryDates.map((d) => new Date(d));

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // pad the start so the grid aligns to Mon
  const startPad = (monthStart.getDay() + 6) % 7; // 0 = Monday

  function hasEntry(day: Date) {
    return parsed.some((d) => isSameDay(d, day));
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrent(subMonths(current, 1))}
          className="p-1 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-heading font-semibold text-sm text-foreground">
          {format(current, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setCurrent(addMonths(current, 1))}
          className="p-1 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-1">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <div key={d} className="text-center text-xs text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {/* Leading empty cells */}
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {days.map((day) => {
          const wrote = hasEntry(day);
          const today = isToday(day);
          const future = isFuture(day);
          const currentMonth = isSameMonth(day, current);

          return (
            <div
              key={day.toISOString()}
              title={wrote ? `Entry on ${format(day, "MMM d")}` : undefined}
              className={cn(
                "flex items-center justify-center rounded-lg text-xs h-7 w-full transition-colors",
                !currentMonth && "opacity-30",
                future && "opacity-40",
                wrote && "bg-primary/20 text-primary font-semibold",
                !wrote && !future && currentMonth && "text-muted-foreground hover:bg-accent",
                today && !wrote && "ring-1 ring-primary/40 text-foreground",
                today && wrote && "ring-1 ring-primary"
              )}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border justify-center">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="h-3 w-3 rounded bg-primary/20" />
          Wrote
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="h-3 w-3 rounded ring-1 ring-primary/40" />
          Today
        </div>
      </div>
    </div>
  );
}
