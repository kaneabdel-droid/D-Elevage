'use server'

import { createClient } from '@/utils/supabase/server'
import { getTenantContext } from '@/utils/supabase/tenant'
import { revalidatePath } from 'next/cache'

export async function creerIntrant(formData: FormData) {
  const tenant = await getTenantContext()
  if (!tenant) return { error: 'Non authentifié' }

  const supabase = await createClient()

  const code_article = (formData.get('code_article') as string) || null
  const nom = formData.get('nom') as string
  const categorie = formData.get('categorie') as string
  const unite = formData.get('unite') as string || 'kg'
  const stock_actuel = parseFloat(formData.get('stock_actuel') as string || '0')
  const stock_minimum = parseFloat(formData.get('stock_minimum') as string || '5')
  const prix_unitaire_moyen = parseFloat(formData.get('prix_unitaire_moyen') as string || '0')
  const latence_jours_defaut = parseInt(formData.get('latence_jours_defaut') as string || '0', 10)

  if (!nom || !categorie) {
    return { error: 'Le nom et la catégorie sont obligatoires' }
  }

  const { error } = await supabase.from('intrants').insert({
    entreprise_id: tenant.entrepriseId,
    code_article,
    nom,
    categorie,
    unite,
    stock_actuel,
    stock_minimum,
    prix_unitaire_moyen,
    latence_jours_defaut
  })

  if (error) return { error: error.message }

  // Enregistrer le coût du stock initial si renseigné
  if (stock_actuel > 0 && prix_unitaire_moyen > 0) {
    await supabase.from('finances_elevage').insert({
      entreprise_id: tenant.entrepriseId,
      type_operation: 'achat_intrant',
      date_operation: new Date().toISOString().split('T')[0],
      montant_total: stock_actuel * prix_unitaire_moyen,
      quantite: stock_actuel,
      prix_unitaire: prix_unitaire_moyen,
      description: `Stock initial ${nom} (${stock_actuel} ${unite})`
    })
  }

  revalidatePath('/elevage/stocks')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function ajusterStock(formData: FormData) {
  const tenant = await getTenantContext()
  if (!tenant) return { error: 'Non authentifié' }

  const supabase = await createClient()

  const intrant_id = formData.get('intrant_id') as string
  const type_mouvement = formData.get('type_mouvement') as 'entree' | 'sortie'
  const quantite = parseFloat(formData.get('quantite') as string || '0')
  const prix_unitaire = parseFloat(formData.get('prix_unitaire') as string || '0')
  const motif = formData.get('motif') as string || ''

  if (!intrant_id || quantite <= 0) {
    return { error: 'Paramètres invalides' }
  }

  const { data: item } = await supabase.from('intrants').select('stock_actuel, nom, unite').eq('id', intrant_id).single()
  if (!item) return { error: 'Article introuvable' }

  const nouveauStock = type_mouvement === 'entree' 
    ? item.stock_actuel + quantite 
    : Math.max(0, item.stock_actuel - quantite)

  const { error } = await supabase.from('intrants').update({
    stock_actuel: nouveauStock,
    updated_at: new Date().toISOString()
  }).eq('id', intrant_id)

  if (error) return { error: error.message }

  if (type_mouvement === 'entree' && prix_unitaire > 0) {
    await supabase.from('finances_elevage').insert({
      entreprise_id: tenant.entrepriseId,
      type_operation: 'achat_intrant',
      date_operation: new Date().toISOString().split('T')[0],
      montant_total: quantite * prix_unitaire,
      quantite,
      prix_unitaire,
      description: `Approvisionnement ${item.nom}: ${motif || 'Réapprovisionnement'}`
    })
  }

  revalidatePath('/elevage/stocks')
  return { success: true }
}
