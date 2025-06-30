-- Migration: Add sharing functionality
-- This adds the sharing tables and RLS policies for share links

-- Create table for storing share tokens
CREATE TABLE IF NOT EXISTS public_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_token TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_public_shares_token ON public_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_public_shares_expires ON public_shares(expires_at);
CREATE INDEX IF NOT EXISTS idx_public_shares_user_id ON public_shares(user_id);

-- Enable RLS on shares table
ALTER TABLE public_shares ENABLE ROW LEVEL SECURITY;

-- Users can create their own share links
CREATE POLICY "Users can create own shares" ON public_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own share links
CREATE POLICY "Users can view own shares" ON public_shares
  FOR SELECT USING (auth.uid() = user_id);

-- Users can delete their own share links
CREATE POLICY "Users can delete own shares" ON public_shares
  FOR DELETE USING (auth.uid() = user_id);

-- RPC function to set share token for session
CREATE OR REPLACE FUNCTION set_share_token(token text) 
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.share_token', token, true);
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Add RLS policy for shared access to sleep records
CREATE POLICY "Allow shared access via token" ON sleep_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public_shares 
      WHERE public_shares.share_token = current_setting('app.share_token', true)
      AND public_shares.user_id = sleep_records.user_id
      AND public_shares.expires_at > NOW()
    )
  );
