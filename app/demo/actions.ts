'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Compte de démonstration public pour D-ÉLEVAGE.
const DEMO_EMAIL = process.env.DEMO_ELEVAGE_EMAIL || process.env.DEMO_USER_EMAIL || 'kaneabdou@yahoo.fr'

export async function loginDemo() {
  const admin = createAdminClient()

  let data: any = null
  let error: any = null

  try {
    const res = await admin.auth.admin.generateLink({ type: 'magiclink', email: DEMO_EMAIL })
    data = res.data
    error = res.error
  } catch (e: any) {
    error = e
  }

  if (error || !data?.properties?.hashed_token) {
    console.error('Erreur génération lien démo D-Elevage:', error)
    redirect('/demo?demo_error=1')
  }

  const supabase = await createClient()
  let verifyError: any = null

  try {
    const verifyRes = await supabase.auth.verifyOtp({
      token_hash: data.properties.hashed_token,
      type: 'magiclink',
    })
    verifyError = verifyRes.error
  } catch (e: any) {
    verifyError = e
  }

  if (verifyError) {
    console.error('Erreur connexion démo D-Elevage:', verifyError)
    redirect('/demo?demo_error=1')
  }

  redirect('/dashboard')
}
