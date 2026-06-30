-- Run this once in the Supabase SQL editor.

create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number int not null,
  day_title text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_minutes int
);

create table if not exists workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references workout_sessions(id) on delete cascade,
  day_number int not null,
  exercise_name text not null,
  set_number int not null,
  weight_kg numeric,
  reps_done int,
  created_at timestamptz not null default now()
);

alter table workout_sessions enable row level security;
alter table workout_logs enable row level security;

create policy "Users manage their own sessions"
  on workout_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own logs"
  on workout_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists workout_logs_user_exercise_idx
  on workout_logs (user_id, exercise_name, created_at);

create index if not exists workout_sessions_user_idx
  on workout_sessions (user_id, started_at desc);
