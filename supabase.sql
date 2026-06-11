-- Injury Recovery beta database schema
-- Run this in Supabase SQL Editor before testing accounts/progress.

create table if not exists public.recovery_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  profile_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.recovery_profiles enable row level security;

drop policy if exists "Users can read their own recovery profile" on public.recovery_profiles;
drop policy if exists "Users can insert their own recovery profile" on public.recovery_profiles;
drop policy if exists "Users can update their own recovery profile" on public.recovery_profiles;

create policy "Users can read their own recovery profile"
on public.recovery_profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own recovery profile"
on public.recovery_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own recovery profile"
on public.recovery_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_recovery_profiles_updated_at on public.recovery_profiles;
create trigger set_recovery_profiles_updated_at
before update on public.recovery_profiles
for each row execute function public.set_updated_at();
