-- ============================================================
-- AI LEARNING PLATFORM — SUPABASE SCHEMA v1
-- Run this in Supabase SQL Editor (single paste).
-- Covers: profiles (adult + child), courses, lessons,
-- progress, streaks, quiz funnel, subscriptions (Pesapal-ready),
-- payments, certificates.
-- ============================================================

-- ---------- ENUMS ----------
create type audience_type as enum ('adult', 'kids');
create type age_band as enum ('8-12', '13-17');
create type plan_interval as enum ('biweekly', 'monthly', 'one_off');
create type subscription_status as enum ('pending', 'active', 'expired', 'cancelled');
create type payment_status as enum ('pending', 'completed', 'failed', 'refunded');
create type lesson_block_type as enum ('concept', 'example', 'practice', 'quiz');

-- ---------- PROFILES ----------
-- Supabase auth.users handles login. profiles extends it.
-- Child profiles hang off a parent profile (no auth account of their own).
create table profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  parent_profile_id uuid references profiles(id) on delete cascade,
  is_child boolean not null default false,
  display_name text not null,
  age_band age_band,                    -- only for child profiles
  phone text,                           -- adults only, for M-Pesa + WhatsApp reminders
  whatsapp_opt_in boolean default false,
  country text default 'KE',
  created_at timestamptz not null default now(),
  -- a child profile must have a parent; an adult must have an auth account
  constraint child_has_parent check (
    (is_child and parent_profile_id is not null and auth_user_id is null)
    or (not is_child and auth_user_id is not null)
  )
);

create index idx_profiles_auth on profiles(auth_user_id);
create index idx_profiles_parent on profiles(parent_profile_id);

-- ---------- QUIZ FUNNEL (pre-signup personalization quiz) ----------
create table funnel_responses (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,             -- anonymous session before signup
  profile_id uuid references profiles(id), -- linked after signup
  answers jsonb not null,               -- {"goal": "side_income", "time_per_day": "10min", ...}
  recommended_track uuid,               -- set after quiz scoring
  utm_source text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create index idx_funnel_session on funnel_responses(session_id);

-- ---------- COURSE CONTENT ----------
create table tracks (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,            -- 'chatgpt-for-work'
  title text not null,
  description text,
  audience audience_type not null default 'adult',
  age_band age_band,                    -- null for adult tracks
  cover_image_url text,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table modules (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references tracks(id) on delete cascade,
  title text not null,
  sort_order int not null default 0
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  sort_order int not null default 0,
  estimated_minutes int default 7,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Lesson content as ordered blocks. Content lives as data, not code.
-- concept/example: {"screens": [{"text": "...", "image_url": null}, ...]}
-- practice: {"instructions": "...", "task_context": "...", "system_prompt": "...", "kid_safe": true}
-- quiz: {"questions": [{"type": "mcq", "question": "...", "options": [...], "correct": 1, "explanation": "..."}]}
create table lesson_blocks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  block_type lesson_block_type not null,
  sort_order int not null default 0,
  content jsonb not null
);

create index idx_blocks_lesson on lesson_blocks(lesson_id, sort_order);

-- ---------- PROGRESS & STREAKS ----------
create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  completed_at timestamptz,
  quiz_score int,                        -- percentage
  started_at timestamptz not null default now(),
  unique (profile_id, lesson_id)
);

create index idx_progress_profile on lesson_progress(profile_id);

create table streaks (
  profile_id uuid primary key references profiles(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_activity_date date
);

-- Log of AI practice attempts (also useful for cost monitoring)
create table practice_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  lesson_block_id uuid not null references lesson_blocks(id) on delete cascade,
  user_input text not null,
  ai_feedback text,
  created_at timestamptz not null default now()
);

-- ---------- PLANS, SUBSCRIPTIONS, PAYMENTS ----------
create table plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,             -- 'adult-biweekly', 'adult-monthly', 'kids-holiday-camp'
  title text not null,
  audience audience_type not null,
  interval plan_interval not null,
  price_kes numeric(10,2) not null,
  duration_days int not null,            -- 14, 30, or camp length for one_off
  max_child_profiles int default 0,      -- >0 for plans that include kids access
  is_active boolean not null default true
);

-- Expiry-based access model: access is valid while now() < expires_at.
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade, -- always the adult/parent
  plan_id uuid not null references plans(id),
  status subscription_status not null default 'pending',
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_subs_profile on subscriptions(profile_id);
create index idx_subs_expiry on subscriptions(expires_at) where status = 'active';

-- Provider-agnostic payments with Pesapal fields ready.
create table payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references subscriptions(id),
  profile_id uuid not null references profiles(id),
  provider text not null default 'pesapal',
  merchant_reference text unique,        -- our reference sent to Pesapal
  order_tracking_id text,                -- Pesapal's ID, from SubmitOrderRequest
  amount_kes numeric(10,2) not null,
  status payment_status not null default 'pending',
  raw_ipn jsonb,                         -- store Pesapal IPN payload for audit
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index idx_payments_tracking on payments(order_tracking_id);

-- ---------- CERTIFICATES ----------
create table certificates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  track_id uuid not null references tracks(id),
  verification_code text unique not null, -- shown on cert, checked at /verify/[code]
  issued_at timestamptz not null default now(),
  pdf_url text,
  unique (profile_id, track_id)
);

-- ---------- ROW LEVEL SECURITY ----------
alter table profiles enable row level security;
alter table funnel_responses enable row level security;
alter table tracks enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table lesson_blocks enable row level security;
alter table lesson_progress enable row level security;
alter table streaks enable row level security;
alter table practice_attempts enable row level security;
alter table plans enable row level security;
alter table subscriptions enable row level security;
alter table payments enable row level security;
alter table certificates enable row level security;

-- Users see/manage their own profile + their child profiles
create policy "own profile" on profiles
  for select using (
    auth.uid() = auth_user_id
    or parent_profile_id in (select id from profiles where auth_user_id = auth.uid())
  );
create policy "update own profile" on profiles
  for update using (auth.uid() = auth_user_id);
create policy "insert own profile" on profiles
  for insert with check (
    auth.uid() = auth_user_id
    or parent_profile_id in (select id from profiles where auth_user_id = auth.uid())
  );

-- Published content is readable by everyone (marketing pages need it too)
create policy "read published tracks" on tracks for select using (is_published);
create policy "read modules" on modules for select using (true);
create policy "read published lessons" on lessons for select using (is_published);
create policy "read lesson blocks" on lesson_blocks for select using (true);
create policy "read active plans" on plans for select using (is_active);

-- Progress/streaks/practice: own rows only (incl. child profiles under you)
create policy "own progress" on lesson_progress
  for all using (
    profile_id in (
      select id from profiles
      where auth_user_id = auth.uid()
         or parent_profile_id in (select id from profiles where auth_user_id = auth.uid())
    )
  );
create policy "own streaks" on streaks
  for all using (
    profile_id in (
      select id from profiles
      where auth_user_id = auth.uid()
         or parent_profile_id in (select id from profiles where auth_user_id = auth.uid())
    )
  );
create policy "own practice" on practice_attempts
  for all using (
    profile_id in (
      select id from profiles
      where auth_user_id = auth.uid()
         or parent_profile_id in (select id from profiles where auth_user_id = auth.uid())
    )
  );

-- Subscriptions/payments: read own; writes happen server-side via service role
create policy "own subscriptions" on subscriptions
  for select using (
    profile_id in (select id from profiles where auth_user_id = auth.uid())
  );
create policy "own payments" on payments
  for select using (
    profile_id in (select id from profiles where auth_user_id = auth.uid())
  );

-- Certificates: owner reads; public verification handled via service role endpoint
create policy "own certificates" on certificates
  for select using (
    profile_id in (
      select id from profiles
      where auth_user_id = auth.uid()
         or parent_profile_id in (select id from profiles where auth_user_id = auth.uid())
    )
  );

-- Funnel: anonymous inserts allowed (pre-signup), reads server-side only
create policy "insert funnel" on funnel_responses for insert with check (true);

-- ---------- HELPER: does this profile currently have access? ----------
create or replace function has_active_access(p_profile_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from subscriptions s
    join profiles child on child.id = p_profile_id
    where s.status = 'active'
      and s.expires_at > now()
      and s.profile_id = coalesce(child.parent_profile_id, child.id)
  );
$$;

-- ---------- SEED: starter plans (adjust prices with client) ----------
insert into plans (slug, title, audience, interval, price_kes, duration_days, max_child_profiles) values
  ('adult-biweekly', 'Standard — 2 Weeks', 'adult', 'biweekly', 499, 14, 0),
  ('adult-monthly',  'Standard — Monthly', 'adult', 'monthly', 799, 30, 0),
  ('family-monthly', 'Family — Monthly',   'adult', 'monthly', 1199, 30, 3),
  ('kids-holiday-camp', 'Holiday AI Camp (One-off)', 'kids', 'one_off', 999, 21, 3);