"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function updateProfile(updates: {
  display_name?: string;
  username?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check username uniqueness if changing it
  if (updates.username) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", updates.username)
      .neq("id", user.id)
      .single();

    if (existing) throw new Error("Username is already taken");

    if (!/^[a-z0-9_]{3,30}$/.test(updates.username)) {
      throw new Error("Username must be 3–30 chars: lowercase letters, numbers, underscores only");
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
}

/** Look up a user's UUID by username (used for username login) */
export async function getUserIdByUsername(username: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username.toLowerCase())
    .single();

  return data?.id ?? null;
}
