/*
  Migration: Add pending status to flashcards
  Description: Adds 'pending' as a valid status for flashcards to support the AI generation workflow

  Changes:
  - Modifies the status check constraint in flashcards table to include 'pending'

  Developer: AI Assistant
  Date: 2025-04-12
*/

-- temporarily disable the check constraint
alter table public.flashcards
  drop constraint if exists flashcards_status_check;

-- add new check constraint with pending status
alter table public.flashcards
  add constraint flashcards_status_check
  check (status in ('accepted', 'rejected', 'pending'));

-- add comment explaining the status values
comment on column public.flashcards.status is 'Status of the flashcard: pending (awaiting review), accepted, or rejected by the user';

-- update existing RLS policies to handle pending status
drop policy if exists "Users can view their own flashcards" on public.flashcards;
drop policy if exists "Users can update their own flashcards" on public.flashcards;

-- recreate select policy with explicit mention of pending status
create policy "Users can view their own flashcards"
  on public.flashcards
  for select
  to authenticated
  using (auth.uid() = user_id);

-- recreate update policy with explicit mention of pending status
create policy "Users can update their own flashcards"
  on public.flashcards
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- add comment to the table documenting the change
comment on table public.flashcards is 'Stores flashcard data created by users or AI. Status can be pending (during AI generation), accepted, or rejected.';