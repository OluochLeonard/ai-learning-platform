# AI LEARNING PLATFORM — CLAUDE CODE BUILD PLAN
# Run phases in order. Complete and verify each phase before starting the next.
# Working name: "PLATFORM" (replace with brand name project-wide once confirmed — it only appears in UI strings and metadata, never in logic).

## CONTEXT (read first)

You are building a subscription-based AI-skills learning platform for the Kenyan and East African market. Think "Duolingo for AI tools": microlearning lessons, quizzes, streaks, certificates, with a quiz funnel driving paid signups.

**Audiences:** adults (main), plus a parent-gated kids' zone (age bands 8-12 and 13-17). Kids never have their own auth accounts — child profiles hang off a parent account.

**Stack (already provisioned, do not change):**
- Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- Supabase: Postgres + Auth (schema already applied — see `schema.sql` in repo root; read it before writing any query)
- Hosting: Vercel (auto-deploys from `main`)
- Payments: Pesapal — NOT integrated yet (client company registration pending). Build the full payment flow against a stub provider behind an interface, so Pesapal drops in later without refactoring.
- AI practice feedback: Anthropic API (claude-sonnet-4-6) via server-side route only.

**Env vars available:** NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY. (ANTHROPIC_API_KEY and PESAPAL_* added in later phases.)

**Access model:** expiry-based. A subscription row with status='active' and expires_at > now() grants access. Use the SQL helper `has_active_access(profile_id)`. No client-side trust: gate all lesson content server-side.

**Conventions:**
- Mobile-first. Assume 380px viewport as the primary design target; desktop is the enhancement.
- Data-light: no heavy images/video in lessons; system fonts or one variable font max.
- Service role key ONLY in server code (route handlers / server actions). Never in client components.
- All Supabase writes for subscriptions/payments/certificates happen server-side.
- Copy style: conversational, punchy, no em dashes anywhere in UI copy.
- Keep components small; content renders from lesson_blocks JSONB — no hardcoded lesson content in code.

---

## PHASE 1 — SCAFFOLD + AUTH + PROFILES

1. Scaffold Next.js (App Router, TS, Tailwind, ESLint). Set up `@supabase/ssr` clients: browser client, server client, and a service-role admin client (server-only module).
2. Auth: email+password and phone-friendly signup (email required; phone captured on profile). Pages: /signup, /login, /forgot-password. On signup, create the adult row in `profiles` (is_child=false, auth_user_id set).
3. Profile switching (Netflix-style): after login, if the account has child profiles, show a "Who's learning?" screen. Store the active profile_id in a cookie. Adults can create/edit child profiles (display_name + age_band only — no email/phone for children).
4. App shell: responsive layout, bottom tab nav on mobile (Home, Courses, Progress, Account), simple header on desktop. Placeholder brand styling: clean, modern, neutral palette (real brand later).
5. Route protection middleware: /app/** requires auth; /app/kids/** requires an active child profile selected.

**Verify:** signup → login → create child profile → switch profiles → protected routes redirect correctly.

## PHASE 2 — QUIZ FUNNEL + PAYWALL + STUB CHECKOUT

This is the revenue path. Build it end to end before any lesson content exists.

1. Landing page `/`: hero speaking to adults ("Learn AI. Earn more."-style positioning, placeholder copy), social proof section, CTA into the quiz. Separate `/kids` landing page speaking to parents (holiday camp framing).
2. Quiz funnel `/start`: 6-8 single-tap questions (goal, current AI knowledge, time per day, occupation type, income interest, device). One question per screen, progress bar, no back-button friction. Store answers in `funnel_responses` keyed by an anonymous session_id (cookie). Capture utm_source/utm_campaign from query params.
3. Results page: "Your personalized plan" — recommend a track based on answers (simple mapping logic), show projected outcomes, then the paywall.
4. Paywall: plan cards rendered from the `plans` table (biweekly / monthly / family). Clear pricing in KES, what's included, no dark patterns: renewal terms stated plainly on the card.
5. Checkout with a **PaymentProvider interface**: `createPayment(planId, profileId) → {redirectUrl | stkPrompt}` and `handleIPN(payload)`. Implement `StubProvider` now: it creates the payments row (status 'pending'), shows a fake "Pay with M-Pesa" screen with a "Simulate successful payment" button (dev only), which triggers the same server path a real IPN will: mark payment completed, create/extend subscription (started_at, expires_at = now + plan.duration_days, status 'active'), link funnel_response to profile.
6. Post-payment: onboarding moment → dashboard.
7. Renewal banner logic: when a subscription is within 3 days of expiry or expired, show a renew banner → same checkout path.

**Verify:** full journey anonymous visitor → quiz → plan selection → stub payment → active subscription → dashboard, and expiry gating (manually set expires_at in the past and confirm lockout + renew flow).

## PHASE 3 — LESSON ENGINE

1. Course catalog: /app/courses lists published tracks filtered by active profile's audience (adult profile sees adult tracks; child profile sees kids tracks matching their age_band). Track page shows modules + lessons with lock/complete states (sequential unlock within a module).
2. Lesson player at /app/lesson/[id]: renders lesson_blocks in sort_order, ONE BLOCK SCREEN AT A TIME, tap/click to continue, top progress bar. Server component fetches blocks only if `has_active_access` passes.
   - concept/example blocks: render screens array (text + optional image).
   - quiz block: MCQ, "which prompt is better", fill-in-the-blank. Instant right/wrong + one-line explanation. Score stored to lesson_progress.quiz_score. Pass mark 60% to complete the lesson.
   - practice block: textarea for the learner's prompt → POST /api/practice → server calls Anthropic API using the block's system_prompt + task_context, returns feedback + a sample result. Store attempt in practice_attempts. If ANTHROPIC_API_KEY is absent, return a graceful mocked response so the engine is testable now.
   - KIDS SAFETY: for kids-audience lessons, practice input is constrained (guided fill-in with a fixed template, max length, tight system prompt from the block config; no free-form chat). Enforce server-side by audience, not client-side.
3. Completion screen: streak update (streaks table: increment if last_activity_date was yesterday, reset if older, no-op if today), progress bar animation, next-lesson CTA.

**Verify:** seed one mini-track via SQL (2 lessons with all four block types, one adult + one kids) and complete it end to end on both profile types.

## PHASE 4 — PROGRESS, STREAKS UI + CERTIFICATES

1. /app/progress: streak flame + count, lessons completed, per-track progress bars. For parent accounts: a "Your kids" section showing each child's progress (the parent-visible dashboard).
2. Certificate generation: when all lessons in a track are complete, server generates a PDF certificate (learner name, track title, date, verification code, brand placeholder) — use @react-pdf/renderer or pdf-lib in a route handler. Store in Supabase Storage, save row in `certificates` with a short unique verification_code.
3. Public verification page /verify/[code]: shows certificate validity, learner first name, track, issue date. No auth required (fetch via service role, expose only those fields).
4. Share moment: after cert generation, a share screen with WhatsApp share link and LinkedIn add-to-profile link.

**Verify:** complete a track → PDF downloads → /verify/[code] confirms it.

## PHASE 5 — ADMIN PANEL

1. Simple role check: an `is_admin` boolean added to profiles via migration (write the SQL migration file into /supabase/migrations).
2. /admin: CRUD for tracks, modules, lessons, and lesson_blocks with a friendly block editor (add concept/example/practice/quiz blocks via forms, not raw JSON — but include a raw JSON fallback editor). Publish toggles. Plan price editing. Basic dashboards: signups, active subs, revenue (from payments), funnel conversion (funnel_responses vs completed payments).
3. All admin routes server-gated by is_admin.

**Verify:** create a new lesson entirely through the admin UI and complete it as a learner without touching code.

## PHASE 6 — PWA + POLISH + LAUNCH PREP

1. PWA: manifest, icons, service worker (next-pwa or manual) — installable, app-like standalone display. Offline fallback page (content itself stays online-only for v1).
2. SEO for marketing pages: metadata, OG images, sitemap. Lesson/app routes noindex.
3. Performance pass: target Lighthouse mobile 90+ on landing and quiz. Lazy-load below-the-fold, optimize images via next/image.
4. Empty states, error states, loading skeletons everywhere. Friendly KE-appropriate microcopy.
5. README documenting: env vars, how to add content, how the payment stub swaps for Pesapal (the interface contract), and the deploy flow.

## DEFERRED (do not build now, keep sockets clean)
- Pesapal integration (implements PaymentProvider; IPN route already shaped in Phase 2)
- WhatsApp reminders via Africa's Talking (phone + whatsapp_opt_in already captured)
- Referral program, badges beyond streaks, native mobile app