'use server'

import { createClient } from '@/utils/supabase/server'
import { getTenantContext } from '@/utils/supabase/tenant'
import { revalidatePath } from 'next/cache'

export async function enregistrerTraitement(formData: FormData) {
  const tenant = await getTenantContext()
  if (!tenant) return { error: 'Non authentifié' }

  const supabase = await createClient()

  const bande_id = (formData.get('bande_id') as string) || null
  const animal_id = (formData.get('animal_id') as string) || null
  const intrant_id = formData.get('intrant_id') as string
  const date_administration = formData.get('date_administration') as string || new Date().toISOString().split('T')[0]
  const quantite_administree = parseFloat(formData.get('quantite_administree') as string || '1')
  const dose_par_sujet = formData.get('dose_par_sujet') as string || ''
  const motif = formData.get('motif') as string
  const duree_latence_jours = parseInt(formData.get('duree_latence_jours') as string || '0', 10)
  const administre_par = formData.get('administre_par') as string || ''
  const notes = formData.get('notes') as string || ''

  if (!intrant_id || !motif || isNaN(quantite_administree)) {
    return { error: 'Veuillez remplir tous les champs obligatoires' }
  }

  // Calcul date de fin de latence
  const dateAdminObj = new Date(date_administration)
  const dateFinLatenceObj = new Date(dateAdminObj)
  dateFinLatenceObj.setDate(dateFinLatenceObj.getDate() + duree_latence_jours)
  const date_fin_latence = dateFinLatenceObj.toISOString().split('T')[0]

  const { error } = await supabase.from('traitements_medicaux').insert({
    entreprise_id: tenant.entrepriseId,
    bande_id,
    animal_id,
    intrant_id,
    date_administration,
    quantite_administree,
    dose_par_sujet,
    motif,
    duree_latence_jours,
    date_fin_latence,
    administre_par,
    notes
  })

  if (error) return { error: error.message }

  // Déduire le stock d'intrant si la fonction est disponible
  try {
    await supabase.rpc('decr_stock_intrant', {
      p_intrant_id: intrant_id,
      p_quantite: quantite_administree
    })
  } catch {
    // ignore
  }

  revalidatePath('/elevage/sanitaire')
  revalidatePath('/elevage/bandes')
  revalidatePath('/dashboard')
  return { success: true }
}
