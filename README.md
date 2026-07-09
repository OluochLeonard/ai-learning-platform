# AI Learning Platform

Subscription-based AI-skills learning platform for the Kenyan and East African market. Microlearning lessons, quizzes, streaks, and certificates, with a quiz funnel driving paid signups. Adults plus a parent-gated kids' zone. Installable as a PWA.

Working name: "PLATFORM" (brand name pending; it appears only in UI strings, metadata, and the certificate template).

**Live:** https://ai-learning-platform-gamma-ruby.vercel.app

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase: Postgres + Auth + Storage (certificates bucket)
- Vercel hosting, auto-deploys from `main`
- Payments: stub provider behind a `PaymentProvider` interface (Pesapal drops in later, see below)
- AI practice feedback: Anthropic API (`claude-sonnet-4-6`), server-side only

## Environment variables

Set in `.env.local` (never committed) and in Vercel project settings:

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role secret. Server-only, bypasses RLS |
| `ANTHROPIC_API_KEY` | AI practice feedback. Absent = graceful mocked feedback |
| `NEXT_PUBLIC_SITE_URL` | Optional. Canonical site URL for sitemap/robots/certificates; defaults to the Vercel domain |
| `PESAPAL_*` | Not used yet; reserved for the Pesapal integration |

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## Database

- `schema.sql` is the base schema, applied once via the Supabase SQL Editor.
- Later changes live in `supabase/migrations/` and are applied the same way, in filename order:
  - `0001_fix_profiles_rls_recursion.sql`
  - `0002_add_is_admin.sql`
- Access model is expiry-based: `subscriptions.status = 'active'` and `expires_at > now()`, checked via the `has_active_access(profile_id)` SQL function. All subscription/payment/certificate writes happen server-side with the service role.

## Adding content

Two ways:

1. **Admin panel** (preferred): grant yourself admin with `node scripts/make-admin.mjs you@example.com`, then open `/admin`. Create tracks, modules, and lessons; build blocks with the form editors (concept/example screens, quiz questions, practice config with the kids template) or the raw JSON fallback. Publish toggles control visibility. Learners see kids tracks only on child profiles matching the track's age band.
2. **Seed script**: `node scripts/seed-tracks.mjs` seeds the starter mini-tracks (idempotent by slug). Use it as a reference for the `lesson_blocks.content` shapes, which are documented in `types/content.ts`.

Kids-lesson practice blocks must include a `template` containing `___` (the child fills only that slot; enforced server-side by track audience).

## Payments: swapping the stub for Pesapal

Everything payment-related sits behind one interface in `lib/payments/provider.ts`:

```ts
interface PaymentProvider {
  name: string;
  createPayment(input: { planId, profileId }): Promise<CreatePaymentResult>;
  handleIPN(payload: unknown): Promise<IpnResult>;
}
```

The current `StubProvider` (`lib/payments/stub.ts`) creates the pending `subscriptions` + `payments` rows and shows a fake M-Pesa screen with a test-mode "Simulate successful payment" button. Both the stub and a real IPN drive the same completion path: `completePayment(merchantReference, rawIpn)` in `lib/payments/complete.ts`, which is idempotent, marks the payment completed, and activates or extends the subscription.

To integrate Pesapal:

1. Implement `PaymentProvider` in `lib/payments/pesapal.ts`: `createPayment` calls Pesapal SubmitOrderRequest (store `order_tracking_id` on the payment row) and returns `{ kind: "redirect", redirectUrl }` to Pesapal's payment page; `handleIPN` validates the notification, checks the transaction status with Pesapal, and calls `completePayment`.
2. Switch the factory in `lib/payments/index.ts` to return the Pesapal provider when `PESAPAL_CONSUMER_KEY` is set.
3. Register the IPN URL with Pesapal: `POST /api/payments/ipn` (already deployed and provider-agnostic).
4. Delete the simulate button path (`app/checkout/pay/[paymentId]/actions.ts`); it already refuses to run when the provider is not the stub.

Until then, note that the simulate button grants real access with no charge, so do not market the site before the swap.

## Deploy flow

Push to `main` on `OluochLeonard/ai-learning-platform` and Vercel builds and deploys automatically. Migrations are manual: run any new file in `supabase/migrations/` in the Supabase SQL Editor as part of the release. Verify on the live URL, not just localhost.

## Operational scripts

| Script | Purpose |
| --- | --- |
| `scripts/seed-tracks.mjs` | Seed starter content (idempotent) |
| `scripts/make-admin.mjs <email>` | Grant the admin flag to an account |