

# Stripe Subscription Integration Improvement Plan

## Current State Summary

The existing setup has:
- `create-checkout` edge function (uses inline `price_data` instead of a fixed Stripe Price ID)
- `check-usage` edge function (queries Stripe API live on every call to determine tier)
- `customer-portal` edge function (works)
- `stripe-webhook` edge function (saves to `user_subscriptions` table but is not used by the frontend)
- `user_subscriptions` table (has `stripe_customer_id`, `stripe_subscription_id`, `status`, `current_period_end`)
- `AuthContext` calls `check-usage` which queries Stripe API directly every time

The main problems: the webhook writes to `user_subscriptions` but `check-usage` ignores it and queries Stripe directly; missing fields like `stripe_price_id`, `plan`, `cancel_at_period_end`; no plan badge in header; no billing settings page; `create-checkout` uses `price_data` instead of a fixed price ID.

---

## Phase 1: Database Schema Extension

Add missing columns to `user_subscriptions`:

- `stripe_price_id` (text, nullable)
- `plan` (text, default `'free'`)
- `cancel_at_period_end` (boolean, default `false`)

Create `webhook_events` table for idempotent event handling:
- `id` (text, primary key -- Stripe event ID)
- `processed_at` (timestamptz, default now())

RLS: `webhook_events` -- service role only (no user access needed).

---

## Phase 2: Improve Webhook (Source of Truth)

Update `supabase/functions/stripe-webhook/index.ts`:

- Add handling for `customer.subscription.created` and `invoice.paid`
- Store processed event IDs in `webhook_events` for idempotency
- Compute `plan`: if status is `active` or `trialing` then `'pro'`, else `'free'`
- Save `stripe_price_id`, `cancel_at_period_end`, and `plan` to `user_subscriptions`
- Look up user by email from `stripe.customers.retrieve(customerId)` when not available from checkout session

---

## Phase 3: Rewrite `check-usage` to Use Database

Update `supabase/functions/check-usage/index.ts`:

- Instead of querying Stripe API on every call, read from `user_subscriptions` table
- Return additional fields: `plan`, `subscription_status`, `current_period_end`, `cancel_at_period_end`
- Keep the admin check and credit logic as-is
- Fall back to `free` if no subscription record exists

This makes the function faster and makes webhooks the true source of truth.

---

## Phase 4: Fix `create-checkout` to Use Real Price ID

Update `supabase/functions/create-checkout/index.ts`:

- Replace inline `price_data` with a fixed Stripe Price ID (will use the existing product `prod_TJQgOZ9ghkOhCA` referenced in `check-usage`)
- Set `success_url` to include a `?session_id={CHECKOUT_SESSION_ID}` param for post-checkout refresh
- Set `cancel_url` to `/premium`

---

## Phase 5: Update `customer-portal` Return URL

Change `return_url` from `${origin}/` to `${origin}/settings/billing`.

---

## Phase 6: Extend AuthContext

Update `src/contexts/AuthContext.tsx`:

- Expand `UsageInfo` interface with: `plan`, `subscriptionStatus`, `currentPeriodEnd`, `cancelAtPeriodEnd`
- Add periodic refresh (every 60 seconds) when user is logged in
- Auto-refresh on window focus (for post-checkout return)
- Map the new fields from the `check-usage` response

---

## Phase 7: Plan Badge in Header

Update `src/components/Header.tsx`:

- Add a small badge next to the user icon showing:
  - **PRO** (cyan/highlighted) when plan is `pro`
  - **FREE** (subtle/gray) when plan is `free`
  - "Pro - ends {date}" when `cancel_at_period_end` is true
  - "Payment issue" when status is `past_due`
- Show on both desktop and mobile navigation

---

## Phase 8: Settings/Billing Page

Create `src/pages/SettingsBilling.tsx`:

- Current plan display (FREE or PRO with visual distinction)
- Subscription status badge
- Renewal/expiry date
- Buttons:
  - FREE users: "Upgrade to Pro" (calls `create-checkout`)
  - PRO users: "Manage Subscription" (calls `customer-portal`)
- Styled consistently with the existing Beymflow dark theme

Add route `/settings/billing` in `App.tsx`.

---

## Phase 9: Payment Success Page Enhancement

Update or verify `src/pages/PaymentSuccess.tsx`:

- On mount, call `refreshUsage()` to immediately sync the plan
- Add polling (every 3 seconds for 30 seconds) until plan shows as `pro`
- Show success message and redirect to `/flow` or `/settings/billing`

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/pages/SettingsBilling.tsx` | Billing settings page |

### Files to Modify
| File | Changes |
|------|---------|
| `supabase/functions/stripe-webhook/index.ts` | Idempotency, new events, plan field, price ID storage |
| `supabase/functions/check-usage/index.ts` | Read from DB instead of Stripe API |
| `supabase/functions/create-checkout/index.ts` | Use real price ID instead of price_data |
| `supabase/functions/customer-portal/index.ts` | Update return URL |
| `src/contexts/AuthContext.tsx` | Extended usage info, periodic refresh |
| `src/components/Header.tsx` | Plan badge |
| `src/App.tsx` | Add `/settings/billing` route |
| `src/pages/PaymentSuccess.tsx` | Polling for plan activation |

### Database Migration
- ALTER `user_subscriptions`: add `stripe_price_id`, `plan`, `cancel_at_period_end`
- CREATE `webhook_events` table with RLS (service role only)

