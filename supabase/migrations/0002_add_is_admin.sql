-- Phase 5: admin role flag.
-- Run in the Supabase SQL Editor.
-- Admin data access happens server-side via the service role; this flag
-- only marks which accounts may use /admin. No new RLS policies needed.

alter table profiles add column if not exists is_admin boolean not null default false;

-- Grant admin to a specific account after signup:
-- update profiles set is_admin = true
-- where auth_user_id = (select id from auth.users where email = 'you@example.com');