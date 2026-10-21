import { createClient } from '@supabase/supabase-js'

declare const __PORTAL_ENV__: Record<string, string> | undefined
const env = typeof __PORTAL_ENV__ === 'undefined' ? {} : __PORTAL_ENV__
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY
export const hasSupabase = Boolean(url && key)
export const supabase = createClient(url || 'https://example.supabase.co', key || 'demo-key', {
  auth: { persistSession: hasSupabase, autoRefreshToken: hasSupabase }
})
