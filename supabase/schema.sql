-- ACROSS: one row of progress per learner.
-- Run this once in your Supabase project (SQL Editor > New query > Run).

create table if not exists public.learner_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- Real progress is a few hundred bytes; the cap stops anyone filling their row with junk.
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 20000),
  updated_at timestamptz not null default now()
);

alter table public.learner_progress enable row level security;

-- Each learner can only see and change their own row.
create policy "Learners read their own progress"
  on public.learner_progress for select
  using (auth.uid() = user_id);

create policy "Learners add their own progress"
  on public.learner_progress for insert
  with check (auth.uid() = user_id);

create policy "Learners update their own progress"
  on public.learner_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
