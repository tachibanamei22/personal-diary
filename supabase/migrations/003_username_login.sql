-- Add email column to profiles for username-based login lookup
alter table public.profiles
  add column if not exists email text;

-- Backfill email from auth.users for existing profiles (if any)
update public.profiles p
  set email = u.email
  from auth.users u
  where p.id = u.id;

-- Keep email in sync when a user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

-- Security-definer function: given a username, return the email.
-- Runs as postgres superuser so it can read the email column even
-- though the profiles row is only selectable by the owner.
create or replace function public.get_email_by_username(p_username text)
returns text language plpgsql security definer as $$
declare
  v_email text;
begin
  select email into v_email
  from public.profiles
  where username = lower(p_username)
  limit 1;
  return v_email;
end;
$$;

-- Only allow anon/authenticated roles to call it (not service_role bypass)
revoke all on function public.get_email_by_username(text) from public;
grant execute on function public.get_email_by_username(text) to anon, authenticated;
