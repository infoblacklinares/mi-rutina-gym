-- Rutinas por usuario + compartibles. Correr una vez en el SQL Editor de Supabase.

create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Mi Rutina',
  share_code text unique not null default substr(md5(random()::text), 1, 8),
  created_at timestamptz not null default now()
);

create table if not exists routine_days (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references routines(id) on delete cascade,
  day_number int not null,
  title text not null,
  extra text
);

create table if not exists routine_exercises (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references routine_days(id) on delete cascade,
  name text not null,
  sets int not null,
  reps text not null,
  image text not null default '',
  tip text not null default '',
  order_index int not null default 0
);

alter table routines enable row level security;
alter table routine_days enable row level security;
alter table routine_exercises enable row level security;

-- Lectura pública (necesaria para que el link compartido se vea sin cuenta)
create policy "Anyone can read routines"
  on routines for select using (true);
create policy "Anyone can read routine days"
  on routine_days for select using (true);
create policy "Anyone can read routine exercises"
  on routine_exercises for select using (true);

-- Escritura solo del dueño
create policy "Owners insert routines"
  on routines for insert with check (auth.uid() = owner_id);
create policy "Owners update routines"
  on routines for update using (auth.uid() = owner_id);
create policy "Owners delete routines"
  on routines for delete using (auth.uid() = owner_id);

create policy "Owners manage days"
  on routine_days for all
  using (exists (select 1 from routines r where r.id = routine_id and r.owner_id = auth.uid()))
  with check (exists (select 1 from routines r where r.id = routine_id and r.owner_id = auth.uid()));

create policy "Owners manage exercises"
  on routine_exercises for all
  using (exists (
    select 1 from routine_days d join routines r on r.id = d.routine_id
    where d.id = day_id and r.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from routine_days d join routines r on r.id = d.routine_id
    where d.id = day_id and r.owner_id = auth.uid()
  ));

create index if not exists routines_owner_idx on routines (owner_id);
create index if not exists routines_share_code_idx on routines (share_code);
create index if not exists routine_days_routine_idx on routine_days (routine_id);
create index if not exists routine_exercises_day_idx on routine_exercises (day_id);
