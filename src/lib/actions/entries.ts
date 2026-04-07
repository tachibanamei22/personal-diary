"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Mood } from "@/types";

export async function createDraftEntry() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: entry, error } = await supabase
    .from("entries")
    .insert({ user_id: user.id, title: "", content: "", tags: [], mood: null })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return entry;
}

export async function createEntry(data: {
  title: string;
  content: string;
  mood: Mood | null;
  tags: string[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: entry, error } = await supabase
    .from("entries")
    .insert({ ...data, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  return entry;
}

export async function updateEntry(
  id: string,
  data: { title: string; content: string; mood: Mood | null; tags: string[] }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("entries")
    .update(data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/entries/${id}`);
}

export async function deleteEntry(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function getEntries(search?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (search && search.trim()) {
    query = query.textSearch("title, content", search.trim(), {
      type: "websearch",
      config: "english",
    });
  }

  const { data, error } = await query;
  if (error) return [];
  return data;
}

export async function getEntry(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return null;
  return data;
}

export async function getEntryDates() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("entries")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data.map((e) => e.created_at);
}
