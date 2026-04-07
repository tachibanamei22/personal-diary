-- ── profiles table ──────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  display_name  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Enforce lowercase, no spaces, sensible length
alter table public.profiles
  add constraint username_format check (
    username ~ '^[a-z0-9_]{3,30}$'
  );

-- Index for fast username lookup (used in login)
create unique index if not exists profiles_username_idx on public.profiles (username);

-- RLS
alter table public.profiles enable row level security;

create policy "public profile read"
  on public.profiles for select
  using (true);

create policy "own profile insert"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "own profile update"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-update updated_at
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
