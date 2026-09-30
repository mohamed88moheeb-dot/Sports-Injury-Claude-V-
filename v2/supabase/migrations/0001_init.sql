-- ROYO v2 schema. One owner per row; row-level security on every table.
-- The engine's CourseState is stored whole on `courses.state`; the other tables
-- are append-only history used for the athlete's timeline and our outcome data (T5).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  sport text,
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  protocol_id text not null,
  protocol_version text not null,
  track_id text not null,
  side text check (side in ('L', 'R')),
  intake jsonb not null,
  state jsonb not null,
  status text not null default 'active' check (status in ('active', 'referred', 'complete', 'abandoned')),
  started_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index courses_user_idx on public.courses (user_id, created_at desc);

create table public.triage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid references public.courses (id) on delete cascade,
  protocol_id text not null,
  outcome text not null check (outcome in ('proceed', 'see_clinician', 'urgent', 'emergency')),
  flags text[] not null default '{}',
  source text not null check (source in ('intake', 'check_in')),
  created_at timestamptz not null default now()
);

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  day date not null,
  pain_rest smallint not null check (pain_rest between 0 and 10),
  pain_morning smallint not null check (pain_morning between 0 and 10),
  red_flags text[] not null default '{}',
  plan jsonb not null,
  created_at timestamptz not null default now(),
  unique (course_id, day)
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  day date not null,
  stage_id text not null,
  day_type text not null,
  planned jsonb not null,
  completed jsonb not null default '[]',
  max_pain jsonb not null default '{}',
  completed_at timestamptz,
  unique (course_id, day)
);

create table public.test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  day date not null,
  stage_id text not null,
  results jsonb not null,
  decision text not null check (decision in ('advance', 'hold', 'regress', 'complete')),
  reasons jsonb not null,
  created_at timestamptz not null default now()
);

-- Return-to-sport and re-injury follow-ups at 2, 6 and 12 months.
create table public.outcomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  kind text not null check (kind in ('returned_to_sport', 'follow_up_2m', 'follow_up_6m', 'follow_up_12m', 'reinjury')),
  day date not null,
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Row-level security: every table is private to its owner.
do $$
declare t text;
begin
  foreach t in array array['courses', 'triage_events', 'check_ins', 'sessions', 'test_results', 'outcomes'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "own rows" on public.%I for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;

alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger courses_touch before update on public.courses for each row execute function public.touch_updated_at();
