"use server";

import { createClient } from "@/lib/supabase/server";

export async function getEntryImages(entryId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("entry_images")
    .select("*")
    .eq("entry_id", entryId)
    .eq("user_id", user.id)
    .order("z_index", { ascending: true });

  return data ?? [];
}

export async function createImageRecord(data: {
  entryId: string;
  url: string;
  storagePath: string;
  x: number;
  y: number;
  rotation: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: image, error } = await supabase
    .from("entry_images")
    .insert({
      entry_id: data.entryId,
      user_id: user.id,
      url: data.url,
      storage_path: data.storagePath,
      x: data.x,
      y: data.y,
      rotation: data.rotation,
      z_index: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return image;
}

export async function updateImageTransform(
  id: string,
  x: number,
  y: number,
  rotation: number,
  zIndex?: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const updates: Record<string, unknown> = { x, y, rotation };
  if (zIndex !== undefined) updates.z_index = zIndex;

  const { error } = await supabase
    .from("entry_images")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}

export async function deleteImage(id: string, storagePath: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Remove from storage
  await supabase.storage.from("diary-images").remove([storagePath]);

  const { error } = await supabase
    .from("entry_images")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}
