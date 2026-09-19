/*
# Add pin_changed column to team_members

1. Changes
- Adds `pin_changed` (boolean, default false) to `team_members`.
- When a team member first logs in with their assigned PIN, the app forces
  them to choose a new PIN. After they set it, `pin_changed` is flipped to
  true so they are never prompted again.
2. Security
- No RLS policy changes. Existing anon + authenticated CRUD policies on
  team_members already cover the new column.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'pin_changed'
  ) THEN
    ALTER TABLE team_members ADD COLUMN pin_changed boolean NOT NULL DEFAULT false;
  END IF;
END $$;