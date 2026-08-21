import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anonKey);

// Only actually created when both env vars are present at build time (this is a
// static export, so they must be set wherever `next build` runs - Vercel's project
// settings, not just a local .env file). Falls back to null so callers can degrade
// to local-only behavior instead of crashing when Supabase isn't configured.
export const supabase = supabaseEnabled ? createClient(url!, anonKey!) : null;
