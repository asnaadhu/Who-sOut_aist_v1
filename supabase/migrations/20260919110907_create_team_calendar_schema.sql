/*
# Create Team Calendar database schema

This migration creates the core database tables for the team leave calendar app.

## Overview
The app tracks team members, their leave requests, and public holidays.
It uses a custom TM-ID + PIN login (not Supabase Auth), so all data is
single-tenant / shared. Policies allow the anon-key frontend to read and write
all tables.

## New Tables

### 1. team_members
- `id` (text, primary key) — app-generated unique ID like "mem-asnad"
- `tm_id` (text, unique) — human-readable team member ID like "TM-001"
- `pin` (text) — 6-digit authentication PIN
- `name` (text, not null) — full name
- `email` (text) — email address
- `avatar_color` (text) — Tailwind CSS classes for avatar background/text
- `avatar_initials` (text) — 1-2 character initials shown in avatar
- `role` (text, not null) — 'admin' | 'requestor' | 'member'
- `department` (text, not null) — department name
- `job_title` (text) — position/title
- `joined_date` (date) — date the member joined
- `allowances` (jsonb) — leave allowance balances {AL, SL, DO, RR, PH, FRL}
- `created_at` (timestamptz)

### 2. time_off_requests
- `id` (text, primary key) — app-generated unique request ID
- `member_id` (text, FK → team_members.id ON DELETE CASCADE)
- `member_name` (text) — denormalized for display
- `member_avatar_color` (text) — denormalized for display
- `department` (text) — denormalized for display
- `leave_type` (text, not null) — 'DO' | 'PH' | 'AL' | 'RR' | 'SL' | 'FRL'
- `is_out_of_island` (boolean, default false)
- `start_date` (date, not null) — leave start
- `end_date` (date, not null) — leave end
- `duration_type` (text, not null) — 'full' | 'morning' | 'afternoon'
- `days_count` (integer, not null) — number of days
- `reason` (text) — reason for leave
- `status` (text, not null) — 'pending' | 'approved' | 'rejected' | 'cancelled'
- `submitted_at` (timestamptz) — when the request was submitted
- `reviewed_at` (timestamptz) — when an admin reviewed it
- `reviewed_by` (text) — name of admin who reviewed
- `review_note` (text) — admin's note on review
- `created_at` (timestamptz)

### 3. public_holidays
- `id` (text, primary key) — app-generated unique ID
- `name` (text, not null) — holiday name
- `date` (date, not null) — holiday date
- `description` (text) — optional description

## Security
- RLS enabled on all three tables.
- Policies allow anon + authenticated to perform full CRUD (the app uses the
  anon key directly with a custom login flow, so all data is shared).
- `USING (true)` / `WITH CHECK (true)` is intentional for this single-tenant app.

## Important Notes
1. The app does NOT use Supabase Auth — it has its own TM-ID + PIN login stored
   in team_members. All policies include the `anon` role.
2. time_off_requests cascades on delete when a member is removed.
3. Allowances are stored as JSONB for flexibility.
*/

-- =============================================================
-- team_members
-- =============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id              text PRIMARY KEY,
  tm_id           text UNIQUE,
  pin             text DEFAULT '123456',
  name            text NOT NULL,
  email           text DEFAULT '',
  avatar_color    text DEFAULT 'bg-neutral-800 text-white',
  avatar_initials text DEFAULT 'TM',
  role            text NOT NULL DEFAULT 'requestor',
  department      text NOT NULL DEFAULT 'General',
  job_title       text DEFAULT 'Team Member',
  joined_date     date DEFAULT CURRENT_DATE,
  allowances      jsonb NOT NULL DEFAULT '{"AL":25,"SL":14,"DO":52,"RR":14,"PH":10,"FRL":5}'::jsonb,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_members" ON team_members;
CREATE POLICY "anon_select_members" ON team_members FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_members" ON team_members;
CREATE POLICY "anon_insert_members" ON team_members FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_members" ON team_members;
CREATE POLICY "anon_update_members" ON team_members FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_members" ON team_members;
CREATE POLICY "anon_delete_members" ON team_members FOR DELETE
  TO anon, authenticated USING (true);

-- =============================================================
-- time_off_requests
-- =============================================================
CREATE TABLE IF NOT EXISTS time_off_requests (
  id                   text PRIMARY KEY,
  member_id            text NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  member_name          text DEFAULT '',
  member_avatar_color  text DEFAULT 'bg-neutral-800 text-white',
  department           text DEFAULT '',
  leave_type           text NOT NULL DEFAULT 'AL',
  is_out_of_island     boolean DEFAULT false,
  start_date           date NOT NULL,
  end_date             date NOT NULL,
  duration_type        text NOT NULL DEFAULT 'full',
  days_count           integer NOT NULL DEFAULT 1,
  reason               text DEFAULT '',
  status               text NOT NULL DEFAULT 'approved',
  submitted_at         timestamptz DEFAULT now(),
  reviewed_at          timestamptz,
  reviewed_by          text,
  review_note          text,
  created_at           timestamptz DEFAULT now()
);

ALTER TABLE time_off_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_requests" ON time_off_requests;
CREATE POLICY "anon_select_requests" ON time_off_requests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_requests" ON time_off_requests;
CREATE POLICY "anon_insert_requests" ON time_off_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_requests" ON time_off_requests;
CREATE POLICY "anon_update_requests" ON time_off_requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_requests" ON time_off_requests;
CREATE POLICY "anon_delete_requests" ON time_off_requests FOR DELETE
  TO anon, authenticated USING (true);

-- =============================================================
-- public_holidays
-- =============================================================
CREATE TABLE IF NOT EXISTS public_holidays (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  date        date NOT NULL,
  description text
);

ALTER TABLE public_holidays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_holidays" ON public_holidays;
CREATE POLICY "anon_select_holidays" ON public_holidays FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_holidays" ON public_holidays;
CREATE POLICY "anon_insert_holidays" ON public_holidays FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_holidays" ON public_holidays;
CREATE POLICY "anon_update_holidays" ON public_holidays FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_holidays" ON public_holidays;
CREATE POLICY "anon_delete_holidays" ON public_holidays FOR DELETE
  TO anon, authenticated USING (true);

-- =============================================================
-- Indexes
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_requests_member_id ON time_off_requests(member_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON time_off_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_dates ON time_off_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_members_department ON team_members(department);
CREATE INDEX IF NOT EXISTS idx_holidays_date ON public_holidays(date);