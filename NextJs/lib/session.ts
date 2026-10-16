'use client';

import { supabaseAnon } from '@/lib/supabase';

// Authorization header for calling our API routes as the signed-in contractor.
// Supabase keeps the session (and refreshes it); localStorage copies are only UI hints.
export async function authHeaders(): Promise<Record<string, string>> {
  if (!supabaseAnon) return {};
  const { data } = await supabaseAnon.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
