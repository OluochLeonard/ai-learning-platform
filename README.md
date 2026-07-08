# AI Learning Platform

Subscription-based AI-skills learning platform for the Kenyan and East African market. Microlearning lessons, quizzes, streaks, and certificates, with a quiz funnel driving paid signups. Adults plus a parent-gated kids' zone.

Working name: "PLATFORM" (brand name pending; it appears only in UI strings and metadata).

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase: Postgres + Auth (schema in `schema.sql`, fixes in `supabase/migrations/`)
- Vercel hosting, auto-deploys from `main`
- Payments: Pesapal (pending) behind a stub `PaymentProvider` interface
- AI practice feedback: Anthropic API, server-side only

## Environment variables

Set these in `.env.local` (never committed) and in Vercel project settings:

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role secret. Server-only, bypasses RLS |
| `ANTHROPIC_API_KEY` | Added in Phase 3 (lesson practice feedback) |
| `PESAPAL_*` | Added when Pesapal integration lands |

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## Database

`schema.sql` is the base schema, applied via the Supabase SQL Editor. Later changes live in `supabase/migrations/` and are applied the same way, in filename order.

## Build plan

Phased build plan in `build-plan.md`. Phase 1 (scaffold, auth, profiles, app shell) is complete.
