create schema if not exists private;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 18),
  display_name_key text generated always as (nullif(lower(btrim(display_name)), '')) stored,
  banned boolean not null default false,
  xp integer not null default 0 check (xp >= 0 and xp <= 1000000),
  owned_characters text[] not null default array['regular']::text[],
  equipped_character text not null default 'regular' check (char_length(equipped_character) >= 1 and char_length(equipped_character) <= 64),
  redeemed_codes text[] not null default '{}'::text[],
  mode_bests jsonb not null default '{}'::jsonb,
  leaderboard_row_id uuid references public.leaderboard_scores(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (coalesce(array_length(owned_characters, 1), 0) between 1 and 100),
  check (coalesce(array_length(redeemed_codes, 1), 0) <= 250)
);

create unique index if not exists user_profiles_display_name_key_unique
  on public.user_profiles (display_name_key)
  where display_name_key is not null;

create index if not exists user_profiles_leaderboard_row_id_idx
  on public.user_profiles (leaderboard_row_id)
  where leaderboard_row_id is not null;

alter table public.user_profiles enable row level security;
revoke all on public.user_profiles from anon, authenticated;
grant select on public.user_profiles to authenticated;
grant insert (
  user_id,
  display_name,
  xp,
  owned_characters,
  equipped_character,
  redeemed_codes,
  mode_bests,
  leaderboard_row_id
) on public.user_profiles to authenticated;
grant update (
  display_name,
  xp,
  owned_characters,
  equipped_character,
  redeemed_codes,
  mode_bests,
  leaderboard_row_id,
  updated_at
) on public.user_profiles to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
      and policyname = 'Users can read their own profile'
  ) then
    create policy "Users can read their own profile"
      on public.user_profiles
      for select
      to authenticated
      using ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
      and policyname = 'Users can create their own profile'
  ) then
    create policy "Users can create their own profile"
      on public.user_profiles
      for insert
      to authenticated
      with check ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
      and policyname = 'Users can update their own profile'
  ) then
    create policy "Users can update their own profile"
      on public.user_profiles
      for update
      to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;
end $$;

create or replace function private.touch_user_profiles_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_user_profiles_updated_at on public.user_profiles;
create trigger touch_user_profiles_updated_at
before update on public.user_profiles
for each row execute function private.touch_user_profiles_updated_at();

create or replace function private.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  requested_name text;
begin
  requested_name := left(
    regexp_replace(coalesce(new.raw_user_meta_data->>'display_name', ''), '[^A-Za-z0-9 _-]', '', 'g'),
    18
  );

  begin
    insert into public.user_profiles (user_id, display_name)
    values (new.id, requested_name)
    on conflict (user_id) do nothing;
  exception
    when unique_violation then
      insert into public.user_profiles (user_id, display_name)
      values (new.id, '')
      on conflict (user_id) do nothing;
  end;

  return new;
end;
$$;

drop trigger if exists create_profile_for_auth_user on auth.users;
create trigger create_profile_for_auth_user
after insert on auth.users
for each row execute function private.create_profile_for_auth_user();

alter table public.leaderboard_scores
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create unique index if not exists leaderboard_scores_user_id_unique
  on public.leaderboard_scores (user_id)
  where user_id is not null;

alter table public.leaderboard_scores enable row level security;
revoke insert, update, delete on public.leaderboard_scores from anon;
revoke delete on public.leaderboard_scores from authenticated;
grant select on public.leaderboard_scores to anon, authenticated;
grant insert (
  user_id,
  player_name,
  score,
  mode_id,
  mode_label,
  character_id,
  xp_earned
) on public.leaderboard_scores to authenticated;
grant update (
  player_name,
  score,
  mode_id,
  mode_label,
  character_id,
  xp_earned
) on public.leaderboard_scores to authenticated;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname from pg_policies
    where schemaname = 'public'
      and tablename = 'leaderboard_scores'
  loop
    execute format('drop policy if exists %I on public.leaderboard_scores', existing_policy.policyname);
  end loop;
end $$;

create policy "Public can read leaderboard scores"
  on public.leaderboard_scores
  for select
  to anon, authenticated
  using (true);

create policy "Users can insert their own leaderboard score"
  on public.leaderboard_scores
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own leaderboard score"
  on public.leaderboard_scores
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ============================================
-- MULTIPLAYER & SECURITY SCHEMA ADDITIONS
-- ============================================

-- Add multiplayer tracking columns to user_profiles
alter table public.user_profiles
  add column if not exists wins integer not null default 0 check (wins >= 0),
  add column if not exists losses integer not null default 0 check (losses >= 0),
  add column if not exists win_streak integer not null default 0 check (win_streak >= 0);

-- Update RLS policies to include new multiplayer columns
grant update (
  wins,
  losses,
  win_streak
) on public.user_profiles to authenticated;

-- Validation trigger to reject invalid scores on leaderboard_scores
create or replace function private.validate_score_insert()
returns trigger as $$
begin
  if new.score > 50000 then
    raise exception 'Score exceeds maximum allowed (50000)';
  end if;
  if new.xp_earned < 0 then
    raise exception 'XP earned cannot be negative';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists validate_score_insert on public.leaderboard_scores;
create trigger validate_score_insert
before insert or update on public.leaderboard_scores
for each row execute function private.validate_score_insert();

-- Validation trigger to reject invalid XP on user_profiles
create or replace function private.validate_user_xp()
returns trigger as $$
begin
  if new.xp > 999999 then
    raise exception 'XP exceeds maximum allowed (999999)';
  end if;
  if new.xp < 0 then
    raise exception 'XP cannot be negative';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists validate_user_xp on public.user_profiles;
create trigger validate_user_xp
before insert or update on public.user_profiles
for each row execute function private.validate_user_xp();

-- Multiplayer leaderboard table
create table if not exists public.multiplayer_leaderboard (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  player_name text not null default '',
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  win_streak integer not null default 0 check (win_streak >= 0),
  character_id text not null default 'regular',
  updated_at timestamptz not null default now()
);

create unique index if not exists multiplayer_leaderboard_user_id_unique
  on public.multiplayer_leaderboard (user_id);

alter table public.multiplayer_leaderboard enable row level security;

revoke all on public.multiplayer_leaderboard from anon, authenticated;
grant select on public.multiplayer_leaderboard to anon, authenticated;
grant insert (user_id, player_name, wins, losses, win_streak, character_id) on public.multiplayer_leaderboard to authenticated;
grant update (player_name, wins, losses, win_streak, character_id, updated_at) on public.multiplayer_leaderboard to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'multiplayer_leaderboard'
      and policyname = 'Anyone can read multiplayer leaderboard'
  ) then
    create policy "Anyone can read multiplayer leaderboard"
      on public.multiplayer_leaderboard
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'multiplayer_leaderboard'
      and policyname = 'Users can create their own leaderboard entry'
  ) then
    create policy "Users can create their own leaderboard entry"
      on public.multiplayer_leaderboard
      for insert
      to authenticated
      with check ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'multiplayer_leaderboard'
      and policyname = 'Users can update their own leaderboard entry'
  ) then
    create policy "Users can update their own leaderboard entry"
      on public.multiplayer_leaderboard
      for update
      to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;
end $$;
