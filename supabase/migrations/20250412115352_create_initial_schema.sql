-- Migration: create_initial_schema
-- Description: Initial database schema for flashcard application
-- Tables: users, flashcards, generations, generation_error_logs
-- Created at: 2025-04-12

-- ========== USERS TABLE ==========
-- Note: This table is mostly managed by Supabase Auth
-- We're only adding the registered_at field and enabling RLS
alter table auth.users add column if not exists registered_at timestamptz not null default now();

-- Enable RLS
alter table auth.users enable row level security;

-- ========== GENERATIONS TABLE ==========
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create index for generations
create index if not exists generations_user_id_idx on public.generations(user_id);

-- Enable RLS
alter table public.generations enable row level security;

-- Create RLS policies for generations
-- Allow authenticated users to select their own generations
create policy "Users can view their own generations"
  on public.generations
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Allow authenticated users to insert their own generations
create policy "Users can insert their own generations"
  on public.generations
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Allow authenticated users to update their own generations
create policy "Users can update their own generations"
  on public.generations
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Allow authenticated users to delete their own generations
create policy "Users can delete their own generations"
  on public.generations
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ========== GENERATION ERROR LOGS TABLE ==========
create table if not exists public.generation_error_logs (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.generations(id) on delete cascade,
  status varchar(50) not null,
  error_code varchar(50) not null,
  error_message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create index for generation_error_logs
create index if not exists generation_error_logs_generation_id_idx on public.generation_error_logs(generation_id);

-- Enable RLS
alter table public.generation_error_logs enable row level security;

-- Create RLS policies for generation_error_logs
-- This needs to join with generations to verify user ownership
-- Allow authenticated users to select their own error logs
create policy "Users can view their own generation error logs"
  on public.generation_error_logs
  for select
  to authenticated
  using (
    generation_id in (
      select id from public.generations where user_id = auth.uid()
    )
  );

-- Allow authenticated users to insert their own error logs
create policy "Users can insert their own generation error logs"
  on public.generation_error_logs
  for insert
  to authenticated
  with check (
    generation_id in (
      select id from public.generations where user_id = auth.uid()
    )
  );

-- Allow authenticated users to update their own error logs
create policy "Users can update their own generation error logs"
  on public.generation_error_logs
  for update
  to authenticated
  using (
    generation_id in (
      select id from public.generations where user_id = auth.uid()
    )
  );

-- Allow authenticated users to delete their own error logs
create policy "Users can delete their own generation error logs"
  on public.generation_error_logs
  for delete
  to authenticated
  using (
    generation_id in (
      select id from public.generations where user_id = auth.uid()
    )
  );

-- ========== FLASHCARDS TABLE ==========
create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid references public.generations(id) on delete set null,
  front varchar(200) not null check (char_length(front) <= 200),
  back varchar(500) not null check (char_length(back) <= 500),
  status varchar(50) not null check (status in ('accepted', 'rejected')),
  source varchar(50) not null check (source in ('ai-full', 'ai-edited', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes for flashcards
create index if not exists flashcards_user_id_idx on public.flashcards(user_id);
create index if not exists flashcards_generation_id_idx on public.flashcards(generation_id);
create index if not exists flashcards_status_idx on public.flashcards(status);
create index if not exists flashcards_source_idx on public.flashcards(source);

-- Enable RLS
alter table public.flashcards enable row level security;

-- Create RLS policies for flashcards
-- Allow authenticated users to select their own flashcards
create policy "Users can view their own flashcards"
  on public.flashcards
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Allow authenticated users to insert their own flashcards
create policy "Users can insert their own flashcards"
  on public.flashcards
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Allow authenticated users to update their own flashcards
create policy "Users can update their own flashcards"
  on public.flashcards
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Allow authenticated users to delete their own flashcards
create policy "Users can delete their own flashcards"
  on public.flashcards
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ========== CREATE UPDATED_AT TRIGGERS ==========
-- Create function to update the updated_at column
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for flashcards
create trigger update_flashcards_updated_at
  before update on public.flashcards
  for each row
  execute function public.update_updated_at_column();

-- Create trigger for generations
create trigger update_generations_updated_at
  before update on public.generations
  for each row
  execute function public.update_updated_at_column();

-- Create trigger for generation_error_logs
create trigger update_generation_error_logs_updated_at
  before update on public.generation_error_logs
  for each row
  execute function public.update_updated_at_column();