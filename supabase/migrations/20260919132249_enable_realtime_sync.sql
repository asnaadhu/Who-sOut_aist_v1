-- Enable Supabase Realtime on the core tables so that any insert/update/delete
-- is pushed instantly to every connected client.
ALTER TABLE team_members REPLICA IDENTITY FULL;
ALTER TABLE time_off_requests REPLICA IDENTITY FULL;
ALTER TABLE public_holidays REPLICA IDENTITY FULL;

-- Add tables to the realtime publication (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'team_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'time_off_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE time_off_requests;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'public_holidays'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public_holidays;
  END IF;
END $$;
