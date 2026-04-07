-- ── entry_images table ──────────────────────────────────
-- Stores images/GIFs attached to diary entries.
-- Position (x, y) is stored as percentage of the canvas container.
-- rotation is in degrees. z_index controls stacking order.

create table if not exists public.entry_images (
  id           uuid primary key default gen_random_uuid(),
  entry_id     uuid not null references public.entries(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  url          text not null,
  x            real not null default 5,
  y            real not null default 5,
  rotation     real not null default 0,
  z_index      integer not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.entry_images enable row level security;

create policy "select own entry images"
  on public.entry_images for select using (auth.uid() = user_id);

create policy "insert own entry images"
  on public.entry_images for insert with check (auth.uid() = user_id);

create policy "update own entry images"
  on public.entry_images for update using (auth.uid() = user_id);

create policy "delete own entry images"
  on public.entry_images for delete using (auth.uid() = user_id);

-- ── Supabase Storage Setup (do this in Supabase Dashboard) ──
-- 1. Go to Storage → New bucket
-- 2. Name: diary-images
-- 3. Check "Public bucket" (so public URLs work)
-- 4. Add storage policy: authenticated users can upload/delete their own files
--    Path pattern: {user_id}/**
--
-- Or run in SQL Editor:
-- insert into storage.buckets (id, name, public) values ('diary-images', 'diary-images', true);
--
-- Storage policies:
-- create policy "upload own images" on storage.objects for insert
--   with check (bucket_id = 'diary-images' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- create policy "delete own images" on storage.objects for delete
--   using (bucket_id = 'diary-images' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- create policy "public read images" on storage.objects for select
--   using (bucket_id = 'diary-images');
