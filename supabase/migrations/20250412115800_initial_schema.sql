/*
  Migration: Initial Schema Creation
  Description: Creates the foundational database structure including users, flashcards, generations, and error logs tables.

  Tables Created:
  - users (extends Supabase Auth)
  - flashcards
  - generations
  - generation_error_logs

  Security: Implements Row Level Security (RLS) for all tables with appropriate policies.

  Developer: AI Assistant
  Date: 2025-04-12
*/

-- extend the auth.users table with additional fields
alter table auth.users add column if not exists registered_at timestamptz not null default now();

-- create flashcards table
create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid null,
  front varchar(200) not null check (char_length(front) <= 200),
  back varchar(500) not null check (char_length(back) <= 500),
  status varchar(50) not null check (status in ('accepted', 'rejected')),
  source varchar(50) not null check (source in ('ai-full', 'ai-edited', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- comment on flashcards table
comment on table public.flashcards is 'Stores flashcard data created by users, either manually or through AI generation';
comment on column public.flashcards.user_id is 'References the user who owns this flashcard';
comment on column public.flashcards.generation_id is 'References the generation operation that created this flashcard, null if manually created';
comment on column public.flashcards.front is 'The front (question) part of the flashcard, limited to 200 characters';
comment on column public.flashcards.back is 'The back (answer) part of the flashcard, limited to 500 characters';
comment on column public.flashcards.status is 'Status of the flashcard: either accepted or rejected by the user';
comment on column public.flashcards.source is 'Source of the flashcard: ai-full (completely by AI), ai-edited (AI-generated then edited), or manual (user-created)';

-- create generations table
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- comment on generations table
comment on table public.generations is 'Stores logs of AI generation operations';
comment on column public.generations.user_id is 'References the user who initiated the generation';
comment on column public.generations.log is 'JSON log containing details about the generation process';

-- create generation_error_logs table
create table if not exists public.generation_error_logs (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.generations(id) on delete cascade,
  status varchar(50) not null,
  error_code varchar(50) not null,
  error_message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- comment on generation_error_logs table
comment on table public.generation_error_logs is 'Stores error logs related to AI generation operations';
comment on column public.generation_error_logs.generation_id is 'References the generation operation that produced this error';
comment on column public.generation_error_logs.status is 'Status of the error';
comment on column public.generation_error_logs.error_code is 'Error code for programmatic handling';
comment on column public.generation_error_logs.error_message is 'Detailed error message for debugging';

-- set up foreign key from flashcards to generations
do $$
begin
  if not exists (
    select 1 from information_schema.constraint_column_usage
    where constraint_name = 'flashcards_generation_id_fkey'
  ) then
    alter table public.flashcards
    add constraint flashcards_generation_id_fkey
    foreign key (generation_id) references public.generations(id) on delete set null;
  end if;
end $$;

-- create indexes for improved query performance
create index if not exists flashcards_user_id_idx on public.flashcards(user_id);
create index if not exists flashcards_generation_id_idx on public.flashcards(generation_id);
create index if not exists flashcards_status_idx on public.flashcards(status);
create index if not exists flashcards_source_idx on public.flashcards(source);
create index if not exists generations_user_id_idx on public.generations(user_id);
create index if not exists generation_error_logs_generation_id_idx on public.generation_error_logs(generation_id);

-- create trigger function for updating updated_at column
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- create triggers for automatically updating updated_at column
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'update_flashcards_updated_at') then
    create trigger update_flashcards_updated_at
    before update on public.flashcards
    for each row execute function public.update_updated_at_column();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'update_generations_updated_at') then
    create trigger update_generations_updated_at
    before update on public.generations
    for each row execute function public.update_updated_at_column();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'update_generation_error_logs_updated_at') then
    create trigger update_generation_error_logs_updated_at
    before update on public.generation_error_logs
    for each row execute function public.update_updated_at_column();
  end if;
end $$;

-- enable row level security (rls) on all tables
alter table public.flashcards enable row level security;
alter table public.generations enable row level security;
alter table public.generation_error_logs enable row level security;

-- flashcards rls policies
do $$
begin
  -- policy for authenticated users to select only their own flashcards
  if not exists (select 1 from pg_policies where policyname = 'Users can view their own flashcards' and tablename = 'flashcards') then
    create policy "Users can view their own flashcards"
    on public.flashcards for select
    to authenticated
    using (auth.uid() = user_id);
  end if;

  -- policy for authenticated users to insert only their own flashcards
  if not exists (select 1 from pg_policies where policyname = 'Users can insert their own flashcards' and tablename = 'flashcards') then
    create policy "Users can insert their own flashcards"
    on public.flashcards for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;

  -- policy for authenticated users to update only their own flashcards
  if not exists (select 1 from pg_policies where policyname = 'Users can update their own flashcards' and tablename = 'flashcards') then
    create policy "Users can update their own flashcards"
    on public.flashcards for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;

  -- policy for authenticated users to delete only their own flashcards
  if not exists (select 1 from pg_policies where policyname = 'Users can delete their own flashcards' and tablename = 'flashcards') then
    create policy "Users can delete their own flashcards"
    on public.flashcards for delete
    to authenticated
    using (auth.uid() = user_id);
  end if;

  -- anonymous users cannot access flashcards
  if not exists (select 1 from pg_policies where policyname = 'Anonymous users cannot view flashcards' and tablename = 'flashcards') then
    create policy "Anonymous users cannot view flashcards"
    on public.flashcards for select
    to anon
    using (false);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Anonymous users cannot insert flashcards' and tablename = 'flashcards') then
    create policy "Anonymous users cannot insert flashcards"
    on public.flashcards for insert
    to anon
    with check (false);
  end if;
end $$;

-- generations rls policies
do $$
begin
  -- policy for authenticated users to select only their own generations
  if not exists (select 1 from pg_policies where policyname = 'Users can view their own generations' and tablename = 'generations') then
    create policy "Users can view their own generations"
    on public.generations for select
    to authenticated
    using (auth.uid() = user_id);
  end if;

  -- policy for authenticated users to insert only their own generations
  if not exists (select 1 from pg_policies where policyname = 'Users can insert their own generations' and tablename = 'generations') then
    create policy "Users can insert their own generations"
    on public.generations for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;

  -- policy for authenticated users to update only their own generations
  if not exists (select 1 from pg_policies where policyname = 'Users can update their own generations' and tablename = 'generations') then
    create policy "Users can update their own generations"
    on public.generations for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;

  -- policy for authenticated users to delete only their own generations
  if not exists (select 1 from pg_policies where policyname = 'Users can delete their own generations' and tablename = 'generations') then
    create policy "Users can delete their own generations"
    on public.generations for delete
    to authenticated
    using (auth.uid() = user_id);
  end if;

  -- anonymous users cannot access generations
  if not exists (select 1 from pg_policies where policyname = 'Anonymous users cannot view generations' and tablename = 'generations') then
    create policy "Anonymous users cannot view generations"
    on public.generations for select
    to anon
    using (false);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Anonymous users cannot insert generations' and tablename = 'generations') then
    create policy "Anonymous users cannot insert generations"
    on public.generations for insert
    to anon
    with check (false);
  end if;
end $$;

-- generation_error_logs rls policies
do $$
begin
  -- policy for authenticated users to select only error logs related to their generations
  if not exists (select 1 from pg_policies where policyname = 'Users can view error logs for their own generations' and tablename = 'generation_error_logs') then
    create policy "Users can view error logs for their own generations"
    on public.generation_error_logs for select
    to authenticated
    using (
      exists (
        select 1 from public.generations g
        where g.id = generation_id and g.user_id = auth.uid()
      )
    );
  end if;

  -- policy for authenticated users to insert error logs only for their generations
  if not exists (select 1 from pg_policies where policyname = 'Users can insert error logs for their own generations' and tablename = 'generation_error_logs') then
    create policy "Users can insert error logs for their own generations"
    on public.generation_error_logs for insert
    to authenticated
    with check (
      exists (
        select 1 from public.generations g
        where g.id = generation_id and g.user_id = auth.uid()
      )
    );
  end if;

  -- policy for authenticated users to update error logs only for their generations
  if not exists (select 1 from pg_policies where policyname = 'Users can update error logs for their own generations' and tablename = 'generation_error_logs') then
    create policy "Users can update error logs for their own generations"
    on public.generation_error_logs for update
    to authenticated
    using (
      exists (
        select 1 from public.generations g
        where g.id = generation_id and g.user_id = auth.uid()
      )
    )
    with check (
      exists (
        select 1 from public.generations g
        where g.id = generation_id and g.user_id = auth.uid()
      )
    );
  end if;

  -- policy for authenticated users to delete error logs only for their generations
  if not exists (select 1 from pg_policies where policyname = 'Users can delete error logs for their own generations' and tablename = 'generation_error_logs') then
    create policy "Users can delete error logs for their own generations"
    on public.generation_error_logs for delete
    to authenticated
    using (
      exists (
        select 1 from public.generations g
        where g.id = generation_id and g.user_id = auth.uid()
      )
    );
  end if;

  -- anonymous users cannot access generation error logs
  if not exists (select 1 from pg_policies where policyname = 'Anonymous users cannot view generation error logs' and tablename = 'generation_error_logs') then
    create policy "Anonymous users cannot view generation error logs"
    on public.generation_error_logs for select
    to anon
    using (false);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Anonymous users cannot insert generation error logs' and tablename = 'generation_error_logs') then
    create policy "Anonymous users cannot insert generation error logs"
    on public.generation_error_logs for insert
    to anon
    with check (false);
  end if;
end $$;