-- Create problems table for storing user coding problems
create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Problem',
  description text default '',
  language text not null default 'python',
  code text default '',
  test_cases jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.problems enable row level security;

-- Create RLS policies
create policy "problems_select_own" on public.problems 
  for select using (auth.uid() = user_id);

create policy "problems_insert_own" on public.problems 
  for insert with check (auth.uid() = user_id);

create policy "problems_update_own" on public.problems 
  for update using (auth.uid() = user_id);

create policy "problems_delete_own" on public.problems 
  for delete using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists problems_user_id_idx on public.problems(user_id);
create index if not exists problems_updated_at_idx on public.problems(updated_at desc);
