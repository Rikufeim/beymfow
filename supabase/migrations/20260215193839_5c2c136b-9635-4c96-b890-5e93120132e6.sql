
CREATE OR REPLACE FUNCTION public.deduct_credits(
  _user_id uuid,
  _cost integer,
  _free_limit integer DEFAULT 3
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_used integer;
  last_reset timestamptz;
  now_ts timestamptz := now();
  now_helsinki text;
  last_helsinki text;
BEGIN
  -- Get current usage with row lock
  SELECT generations_used, daily_credits_reset_at
  INTO current_used, last_reset
  FROM user_usage
  WHERE user_id = _user_id
  FOR UPDATE;

  -- If no row exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_usage (user_id, generations_used, daily_credits_reset_at)
    VALUES (_user_id, 0, now_ts);
    current_used := 0;
    last_reset := now_ts;
  END IF;

  -- Daily reset check (Helsinki timezone)
  now_helsinki := to_char(now_ts AT TIME ZONE 'Europe/Helsinki', 'YYYY-MM-DD');
  last_helsinki := to_char(last_reset AT TIME ZONE 'Europe/Helsinki', 'YYYY-MM-DD');

  IF now_helsinki <> last_helsinki THEN
    current_used := 0;
    UPDATE user_usage
    SET generations_used = 0, daily_credits_reset_at = now_ts
    WHERE user_id = _user_id;
  END IF;

  -- Check if enough credits
  IF current_used + _cost > _free_limit THEN
    RETURN false;
  END IF;

  -- Atomically deduct
  UPDATE user_usage
  SET generations_used = current_used + _cost
  WHERE user_id = _user_id;

  RETURN true;
END;
$$;
