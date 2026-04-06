export type Mood = "amazing" | "happy" | "okay" | "sad" | "awful";

export const MOODS: { value: Mood; label: string; emoji: string; color: string }[] = [
  { value: "amazing", label: "Amazing", emoji: "🤩", color: "text-yellow-500" },
  { value: "happy",   label: "Happy",   emoji: "😊", color: "text-green-500" },
  { value: "okay",    label: "Okay",    emoji: "😐", color: "text-blue-400" },
  { value: "sad",     label: "Sad",     emoji: "😔", color: "text-indigo-400" },
  { value: "awful",   label: "Awful",   emoji: "😞", color: "text-red-400" },
];

export interface DiaryEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;          // HTML from Tiptap
  mood: Mood | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}
