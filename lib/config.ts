export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function assertSupabaseConfigured() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
}
