-- Add DELETE policy to prevent users from deleting their usage records
-- This prevents users from resetting their generation limits by deleting records

CREATE POLICY "Users cannot delete usage" ON public.user_usage FOR DELETE TO authenticated USING (false);


