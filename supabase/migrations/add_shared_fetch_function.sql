-- Migration: Add function to fetch shared sleep records
-- This function sets the share token and fetches records in a single transaction

-- First, create a function to validate the share token
CREATE OR REPLACE FUNCTION validate_share_token(share_token text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public_shares ps 
    WHERE ps.share_token = validate_share_token.share_token
    AND ps.expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create the main function that validates first, then fetches
CREATE OR REPLACE FUNCTION fetch_shared_sleep_records(share_token text)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  date DATE,
  date_unix BIGINT,
  uid TEXT,
  comments TEXT,
  time_got_into_bed TIME,
  time_tried_to_sleep TIME,
  time_to_fall_asleep_mins INTEGER,
  times_woke_up_count INTEGER,
  total_awake_time_mins INTEGER,
  final_awakening_time TIME,
  time_trying_to_sleep_after_final_awakening_mins INTEGER,
  time_got_out_of_bed TIME,
  sleep_quality_rating TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  -- First validate the share token exists and is not expired
  IF NOT validate_share_token(share_token) THEN
    RAISE EXCEPTION 'Invalid or expired share token';
  END IF;
  
  -- Set the share token for this session
  PERFORM set_config('app.share_token', share_token, true);
  
  -- Then return the sleep records that match the RLS policy
  RETURN QUERY
  SELECT 
    sr.id,
    sr.user_id,
    sr.date,
    sr.date_unix,
    sr.uid,
    sr.comments,
    sr.time_got_into_bed,
    sr.time_tried_to_sleep,
    sr.time_to_fall_asleep_mins,
    sr.times_woke_up_count,
    sr.total_awake_time_mins,
    sr.final_awakening_time,
    sr.time_trying_to_sleep_after_final_awakening_mins,
    sr.time_got_out_of_bed,
    sr.sleep_quality_rating,
    sr.created_at,
    sr.updated_at
  FROM sleep_records sr
  WHERE EXISTS (
    SELECT 1 FROM public_shares ps 
    WHERE ps.share_token = current_setting('app.share_token', true)
    AND ps.user_id = sr.user_id
    AND ps.expires_at > NOW()
  )
  ORDER BY sr.date ASC;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION fetch_shared_sleep_records(text) TO anon, authenticated;
