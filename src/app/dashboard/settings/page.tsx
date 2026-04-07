import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/actions/profile";
import SettingsForm from "./SettingsForm";

export const metadata = { title: "Settings — My Diary" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile();

  // Derive fallback username from email prefix for accounts pre-dating the trigger
  const fallbackUsername = user.email?.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_") ?? "";

  return (
    <div className="max-w-xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-page-enter">
      <div>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your profile and account preferences.</p>
      </div>
      <SettingsForm
        initialDisplayName={profile?.display_name ?? ""}
        initialUsername={profile?.username ?? fallbackUsername}
        email={user.email ?? ""}
      />
    </div>
  );
}
