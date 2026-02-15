
-- Add missing columns to user_subscriptions
ALTER TABLE public.user_subscriptions 
  ADD COLUMN IF NOT EXISTS stripe_price_id text,
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false;

-- Create webhook_events table for idempotent event handling
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id text PRIMARY KEY,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on webhook_events
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access webhook_events (no user policies needed)
-- No SELECT/INSERT/UPDATE/DELETE policies for authenticated users
