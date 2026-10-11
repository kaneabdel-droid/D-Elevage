'use server'

import { createClient } from '@/utils/supabase/server'
import { getTenantContext } from '@/utils/supabase/tenant'
import { revalidatePath } from 'next/cache'

export async function creerBatiment(formData: FormData) {
  const tenant = await getTenantContext()
  if (!tenant) return { error: 'Non authentifié' }

  const supabase = await createClient()

  const nom = formData.get('nom') as string
  const type_batiment = formData.get('type_batiment') as string || 'poulailler'
  const capacite_max = parseInt(formData.get('capacite_max') as string || '1000', 10)

  if (!nom) {
    return { error: 'Le nom du bâtiment ou de l’enclos est obligatoire' }
  }

  const { error } = await supabase.from('batiments').insert({
    entreprise_id: tenant.entrepriseId,
    nom,
    type_batiment,
    capacite_max
  })

  if (error) return { error: error.message }

  revalidatePath('/elevage/batiments')
  revalidatePath('/elevage/bandes')
  revalidatePath('/elevage/animaux')
  return { success: true }
}
