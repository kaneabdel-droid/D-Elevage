import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xglyasfikyoyimfnqyev.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_oM-hq284H3JpOVklae13GQ_vVxUlEd8'

  return createBrowserClient(url, anonKey)
}
