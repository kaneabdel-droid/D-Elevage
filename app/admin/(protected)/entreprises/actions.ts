'use server'

import { revalidatePath } from 'next/cache'
import { getSharedAdminUser } from '@/utils/supabase/admin-identity'
import { createAdminClient } from '@/utils/supabase/admin'
import { isAdminEmail } from '@/lib/admin/auth'

type ActionResult = { success?: true; error?: string }

async function checkAdmin(): Promise<string | null> {
  const user = await getSharedAdminUser()
  return isAdminEmail(user?.email) ? null : 'Non autorisé'
}

export async function changerForfait(entrepriseId: string, niveau: string): Promise<ActionResult> {
  const authError = await checkAdmin()
  if (authError) return { error: authError }

  const supabase = createAdminClient()
  const { error } = await supabase.from('entreprises').update({ subscription_tier: niveau }).eq('id', entrepriseId)
  if (error) return { error: error.message }

  revalidatePath('/admin/entreprises')
  revalidatePath('/admin/elevage')
  return { success: true }
}

export async function prolongerEssai(entrepriseId: string, jours: number): Promise<ActionResult> {
  const authError = await checkAdmin()
  if (authError) return { error: authError }

  const supabase = createAdminClient()
  const nouvelleDate = new Date(Date.now() + jours * 24 * 60 * 60 * 1000).toISOString()
  const { error } = await supabase.from('entreprises').update({ essai_expire_le: nouvelleDate }).eq('id', entrepriseId)
  if (error) return { error: error.message }

  revalidatePath('/admin/entreprises')
  revalidatePath('/admin/elevage')
  return { success: true }
}

export async function verrouillerCompte(entrepriseId: string): Promise<ActionResult> {
  const authError = await checkAdmin()
  if (authError) return { error: authError }

  const supabase = createAdminClient()
  const { error } = await supabase.from('entreprises').update({ compte_verrouille: true }).eq('id', entrepriseId)
  if (error) return { error: error.message }

  revalidatePath('/admin/entreprises')
  revalidatePath('/admin/elevage')
  return { success: true }
}

export async function deverrouillerCompte(entrepriseId: string): Promise<ActionResult> {
  const authError = await checkAdmin()
  if (authError) return { error: authError }

  const supabase = createAdminClient()
  const { error } = await supabase.from('entreprises').update({ compte_verrouille: false, essai_expire_le: null }).eq('id', entrepriseId)
  if (error) return { error: error.message }

  revalidatePath('/admin/entreprises')
  revalidatePath('/admin/elevage')
  return { success: true }
}
