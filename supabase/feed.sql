-- Reacciones 💪 a sesiones del feed. Correr una vez en el SQL Editor de Supabase.

create table if not exists session_reactions (
  session_id uuid not null references workout_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

alter table session_reactions enable row level security;

create policy "Anyone can read reactions"
  on session_reactions for select using (true);
create policy "Users react"
  on session_reactions for insert with check (auth.uid() = user_id);
create policy "Users unreact"
  on session_reactions for delete using (auth.uid() = user_id);

create index if not exists session_reactions_session_idx on session_reactions (session_id);
