'use server'

import { createClient } from '@/utils/supabase/server'
import { getTenantContext } from '@/utils/supabase/tenant'
import { revalidatePath } from 'next/cache'

export async function creerAnimal(formData: FormData) {
  const tenant = await getTenantContext()
  if (!tenant) return { error: 'Non authentifié' }

  const supabase = await createClient()

  const numero_boucle = formData.get('numero_boucle') as string
  const nom_ou_surnom = formData.get('nom_ou_surnom') as string || null
  const espece_code = formData.get('espece_code') as string
  const batiment_id = (formData.get('batiment_id') as string) || null
  const sexe = formData.get('sexe') as 'M' | 'F'
  const date_naissance = (formData.get('date_naissance') as string) || null
  const date_entree = (formData.get('date_entree') as string) || new Date().toISOString().split('T')[0]
  const origine = formData.get('origine') as string || 'ne_sur_ferme'
  const pere_boucle = (formData.get('pere_boucle') as string) || null
  const mere_boucle = (formData.get('mere_boucle') as string) || null
  const poids_actuel_kg = parseFloat(formData.get('poids_actuel_kg') as string || '0')
  const en_lactation = formData.get('en_lactation') === 'on'
  const cout_achat = parseFloat(formData.get('cout_achat') as string || '0')

  if (!numero_boucle || !espece_code || !sexe) {
    return { error: 'Le numéro de boucle, l’espèce et le sexe sont obligatoires' }
  }

  const { error } = await supabase.from('animaux').insert({
    entreprise_id: tenant.entrepriseId,
    numero_boucle,
    nom_ou_surnom,
    espece_code,
    batiment_id,
    sexe,
    date_naissance,
    date_entree,
    origine,
    pere_boucle,
    mere_boucle,
    poids_actuel_kg: poids_actuel_kg > 0 ? poids_actuel_kg : null,
    en_lactation,
    etat_sante: 'sain'
  })

  if (error) return { error: error.message }

  if (cout_achat > 0) {
    await supabase.from('finances_elevage').insert({
      entreprise_id: tenant.entrepriseId,
      type_operation: 'achat_animaux',
      date_operation: date_entree,
      montant_total: cout_achat,
      quantite: 1,
      prix_unitaire: cout_achat,
      description: `Achat sujet boucle ${numero_boucle}`
    })
  }

  revalidatePath('/elevage/animaux')
  revalidatePath('/dashboard')
  return { success: true }
}
