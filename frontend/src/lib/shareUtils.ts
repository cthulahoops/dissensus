import { supabase } from './supabase';

export interface ShareLink {
  id: string;
  share_token: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

// Generate a secure random token
export function generateShareToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Create a new share link
export async function createShareLink(expiryDays: number = 7): Promise<ShareLink> {
  const token = generateShareToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to create share links');
  }

  const { data, error } = await supabase
    .from('public_shares')
    .insert({
      share_token: token,
      user_id: user.id,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create share link: ${error.message}`);
  }

  return data;
}

// Get all share links for the current user
export async function getUserShareLinks(): Promise<ShareLink[]> {
  const { data, error } = await supabase
    .from('public_shares')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch share links: ${error.message}`);
  }

  return data || [];
}

// Delete a share link
export async function deleteShareLink(shareId: string): Promise<void> {
  const { error } = await supabase
    .from('public_shares')
    .delete()
    .eq('id', shareId);

  if (error) {
    throw new Error(`Failed to delete share link: ${error.message}`);
  }
}

// Set share token for the current session (for viewing shared dashboards)
export async function setShareToken(token: string): Promise<void> {
  console.log('Calling set_share_token RPC with token:', token.substring(0, 8) + '...');
  const { data, error } = await supabase.rpc('set_share_token', { token });
  
  console.log('RPC response:', { data, error });
  
  if (error) {
    throw new Error(`Failed to set share token: ${error.message}`);
  }
  
  console.log('Share token set successfully');
}

// Generate the shareable URL
export function generateShareUrl(token: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/share/${token}`;
}

// Extract token from share URL
export function extractTokenFromUrl(path: string): string | null {
  const match = path.match(/^\/share\/([a-f0-9]+)$/);
  return match ? match[1] : null;
}

// Check if current path is a share URL
export function isShareUrl(path: string): boolean {
  return /^\/share\/[a-f0-9]+$/.test(path);
}
