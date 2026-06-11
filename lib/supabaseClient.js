import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidUrl = typeof url === 'string' && /^https:\/\/[^\s]+\.supabase\.co\/?$/.test(url.trim());
const hasAnon = typeof anon === 'string' && anon.trim().length > 20;

export const hasSupabase = Boolean(isValidUrl && hasAnon);
export const supabase = hasSupabase ? createClient(url.trim().replace(/\/$/, ''), anon.trim()) : null;
