-- Perfiles públicos + sistema de seguidores. Correr una vez en el SQL Editor de Supabase.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

alter table profiles enable row level security;
alter table follows enable row level security;

-- Perfiles: lectura pública, escritura solo del dueño
create policy "Anyone can read profiles"
  on profiles for select using (true);
create policy "Users insert own profile"
  on profiles for insert with check (auth.uid() = id);
create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);

-- Follows: lectura pública (para contadores), gestionar solo los propios
create policy "Anyone can read follows"
  on follows for select using (true);
create policy "Users follow"
  on follows for insert with check (auth.uid() = follower_id);
create policy "Users unfollow"
  on follows for delete using (auth.uid() = follower_id);

-- Las sesiones pasan a ser legibles por cualquiera (necesario para ver stats
-- de otros perfiles; los pesos en workout_logs siguen siendo privados)
create policy "Anyone can read sessions"
  on workout_sessions for select using (true);

create index if not exists profiles_username_idx on profiles (username);
create index if not exists follows_following_idx on follows (following_id);
