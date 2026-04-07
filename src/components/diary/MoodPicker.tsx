"use client";

import { MOODS, type Mood } from "@/types";
import { cn } from "@/lib/utils";

interface MoodPickerProps {
  value: Mood | null;
  onChange: (mood: Mood | null) => void;
}

export default function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground mr-1">Mood:</span>
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          title={mood.label}
          onClick={() => onChange(value === mood.value ? null : mood.value)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all duration-150",
            value === mood.value
              ? "bg-primary/10 border-primary/40 text-primary font-medium scale-105"
              : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground hover:scale-105 active:scale-95"
          )}
        >
          <span>{mood.emoji}</span>
          <span className="text-xs">{mood.label}</span>
        </button>
      ))}
    </div>
  );
}
