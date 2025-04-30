/*
  Migration: Modify status constraint to include pending
  Description: Updates the status check constraint to allow 'pending' status

  Developer: AI Assistant
  Date: 2025-04-12
*/

do $$
begin
  -- Only modify the constraint if it exists and doesn't include 'pending'
  if exists (
    select 1
    from information_schema.check_constraints
    where constraint_name = 'flashcards_status_check'
    and check_clause not like '%pending%'
  ) then
    -- Drop the existing constraint
    alter table public.flashcards
      drop constraint if exists flashcards_status_check;

    -- Add the new constraint
    alter table public.flashcards
      add constraint flashcards_status_check
      check (status in ('accepted', 'rejected', 'pending'));
  end if;
end $$;