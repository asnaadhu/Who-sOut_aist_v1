/*
# Seed initial data

Inserts the default team member (Asnad), a sample approved leave request,
and the default public holidays so the app has content on first load.
Uses ON CONFLICT DO NOTHING so re-running is safe.
*/

INSERT INTO team_members (id, tm_id, pin, name, email, avatar_color, avatar_initials, role, department, job_title, joined_date, allowances)
VALUES (
  'mem-asnad',
  'TM-001',
  '123456',
  'Asnad',
  'Asnaadhu@gmail.com',
  'bg-neutral-900 text-white',
  'AA',
  'admin',
  'Operations',
  'Lead Administrator',
  '2023-01-01',
  '{"AL":25,"SL":14,"DO":52,"RR":10,"PH":10,"FRL":5}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO time_off_requests (
  id, member_id, member_name, member_avatar_color, department,
  leave_type, is_out_of_island, start_date, end_date,
  duration_type, days_count, reason, status,
  submitted_at, reviewed_at, reviewed_by, review_note
)
VALUES (
  'req-asnad-1',
  'mem-asnad',
  'Asnad',
  'bg-neutral-900 text-white',
  'Operations',
  'AL',
  true,
  '2026-09-21',
  '2026-09-25',
  'full',
  5,
  'Annual hiking & vacation trip',
  'approved',
  '2026-09-02T10:30:00Z',
  '2026-09-03T14:15:00Z',
  'Asnad',
  'Approved annual leave.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public_holidays (id, name, date, description) VALUES
  ('hol-1', 'Labor Day', '2026-09-07', 'Federal Holiday - Office Closed'),
  ('hol-2', 'Indigenous Peoples Day', '2026-10-12', 'Federal Holiday'),
  ('hol-3', 'Veterans Day', '2026-11-11', 'Federal Holiday'),
  ('hol-4', 'Thanksgiving Day', '2026-11-26', 'National Holiday'),
  ('hol-5', 'Day After Thanksgiving', '2026-11-27', 'Company Extended Holiday')
ON CONFLICT (id) DO NOTHING;