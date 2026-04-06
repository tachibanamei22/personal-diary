-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── entries table ────────────────────────────────────────
create table if not exists public.entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default '',
  content     text not null default '',
  mood        text check (mood in ('amazing', 'happy', 'okay', 'sad', 'awful')),
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for fast per-user queries sorted by date
create index if not exists entries_user_id_created_at_idx
  on public.entries (user_id, created_at desc);

-- Full-text search index over title + content
create index if not exists entries_fts_idx
  on public.entries
  using gin (to_tsvector('english', title || ' ' || content));

-- ── Row-Level Security ───────────────────────────────────
alter table public.entries enable row level security;

-- Users can only see their own entries
create policy "select own entries"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "insert own entries"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "update own entries"
  on public.entries for update
  using (auth.uid() = user_id);

create policy "delete own entries"
  on public.entries for delete
  using (auth.uid() = user_id);

-- ── Auto-update updated_at ───────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger entries_updated_at
  before update on public.entries
  for each row execute procedure public.handle_updated_at();
