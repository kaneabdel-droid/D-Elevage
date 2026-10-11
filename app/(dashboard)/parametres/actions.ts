'use server'

import { createClient } from '@/utils/supabase/server'
import { getTenantContext } from '@/utils/supabase/tenant'
import { revalidatePath } from 'next/cache'

export async function mettreAJourParametres(formData: FormData) {
  const tenant = await getTenantContext()
  if (!tenant) return { error: 'Non authentifié' }

  const supabase = await createClient()

  const nom = formData.get('nom') as string
  const telephone = formData.get('telephone') as string || ''
  const email = formData.get('email') as string || ''
  const adresse = formData.get('adresse') as string || ''
  const devise = formData.get('devise') as string || 'FCFA'

  if (!nom) {
    return { error: 'Le nom de l’exploitation est obligatoire' }
  }

  const { error } = await supabase
    .from('entreprises')
    .update({
      nom,
      telephone,
      email,
      adresse,
      devise,
      updated_at: new Date().toISOString()
    })
    .eq('id', tenant.entrepriseId)

  if (error) return { error: error.message }

  revalidatePath('/parametres')
  revalidatePath('/dashboard')
  return { success: true }
}
