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

  const trimmedUsername = updates.username?.trim().toLowerCase();

  if (trimmedUsername) {
    if (!/^[a-z0-9_]{3,30}$/.test(trimmedUsername)) {
      throw new Error("Username must be 3–30 chars: lowercase letters, numbers, underscores only");
    }

    // Check uniqueness against other users
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", trimmedUsername)
      .neq("id", user.id)
      .maybeSingle();

    if (existing) throw new Error("Username is already taken");
  }

  // Use upsert so accounts that pre-date the trigger get a profile row created
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email ?? "",
      username: trimmedUsername ?? user.email?.split("@")[0] ?? user.id.slice(0, 8),
      display_name: updates.display_name?.trim() || null,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Delete all entries (cascade will handle profile too via FK)
  await supabase.from("entries").delete().eq("user_id", user.id);
  await supabase.from("profiles").delete().eq("id", user.id);

  // Sign out — actual auth.users deletion requires service role key (admin),
  // so we sign out and the account becomes inaccessible (no profile, can't log in by username).
  // For full deletion, the user can also request it via Supabase dashboard.
  await supabase.auth.signOut();
}
