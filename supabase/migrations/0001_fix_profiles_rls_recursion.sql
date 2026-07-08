-- ============================================================
-- Fix: infinite recursion in `profiles` RLS (Postgres error 42P17)
-- ============================================================
-- The original "own profile" / "insert own profile" policies (schema.sql)
-- query `profiles` from inside their own USING/WITH CHECK clause:
--
--   parent_profile_id in (select id from profiles where auth_user_id = auth.uid())
--
-- Evaluating that subquery re-applies the same RLS policy to every row it
-- scans, which re-evaluates the subquery again, forever. Any select against
-- `profiles` under the anon/authenticated role fails with:
--   "infinite recursion detected in policy for relation \"profiles\""
--
-- A SECURITY DEFINER helper resolves the caller's own adult profile id
-- without re-invoking RLS (it runs as the function owner, which has
-- BYPASSRLS), breaking the cycle.

create or replace function my_adult_profile_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from profiles where auth_user_id = auth.uid();
$$;

drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles
  for select using (
    auth.uid() = auth_user_id
    or parent_profile_id = my_adult_profile_id()
  );

drop policy if exists "insert own profile" on profiles;
create policy "insert own profile" on profiles
  for insert with check (
    auth.uid() = auth_user_id
    or parent_profile_id = my_adult_profile_id()
  );
