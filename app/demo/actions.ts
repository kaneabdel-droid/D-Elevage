'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { withRetry } from '@/utils/supabase/retry'
import { redirect } from 'next/navigation'

// Compte de démonstration public pour D-ÉLEVAGE.
const DEMO_EMAIL = process.env.DEMO_ELEVAGE_EMAIL || process.env.DEMO_USER_EMAIL || 'kaneabdou@yahoo.fr'
const DEMO_PASSWORD = process.env.DEMO_ELEVAGE_PASSWORD || 'DemoElevage2026!'

export async function loginDemo() {
  const supabase = await createClient()

  // 1. Essai prioritaire via Admin Magiclink OTP
  let adminSuccess = false
  try {
    const admin = createAdminClient()
    const { data, error } = await withRetry(() =>
      admin.auth.admin.generateLink({ type: 'magiclink', email: DEMO_EMAIL })
    ).catch((e) => ({ data: null, error: e }))

    if (!error && data?.properties?.hashed_token) {
      const { error: verifyError } = await withRetry(() =>
        supabase.auth.verifyOtp({
          token_hash: data.properties.hashed_token,
          type: 'magiclink',
        })
      ).catch((e) => ({ error: e }))

      if (!verifyError) {
        adminSuccess = true
      }
    }
  } catch (adminErr) {
    console.warn('Admin generateLink indisponible, bascule sur connexion directe démo:', adminErr)
  }

  if (adminSuccess) {
    redirect('/dashboard')
  }

  // 2. Repli résilient garanti via le compte démo public
  const { error: passwordError } = await withRetry(() =>
    supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })
  ).catch((e) => ({ error: e }))

  if (!passwordError) {
    redirect('/dashboard')
  }

  console.error('Erreur finale connexion démo D-Elevage:', passwordError)
  redirect('/demo?demo_error=1')
}
