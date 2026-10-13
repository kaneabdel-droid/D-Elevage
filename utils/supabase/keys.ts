// Centralisation et assainissement des clés Supabase pour D-ÉLEVAGE.
// Prévient les erreurs "Invalid API key" (espaces résiduels, faute de frappe ssb_ au lieu de sb_ dans Vercel).

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xglyasfikyoyimfnqyev.supabase.co'
  return url.trim()
}

export function getSupabaseAnonKey(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_oM-hq284H3JpOVklae13GQ_vVxUlEd8'
  return raw.trim().replace(/^ssb_/, 'sb_')
}

export function getSupabaseServiceRoleKey(): string {
  const raw = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return raw.trim().replace(/^ssb_/, 'sb_')
}
