-- Migration: Fix anonymous access to share tokens
-- Anonymous users need to be able to read share tokens to validate them

-- Allow anonymous users to read share tokens (for validation)
CREATE POLICY "Anonymous can read valid shares" ON public_shares
  FOR SELECT USING (expires_at > NOW());
