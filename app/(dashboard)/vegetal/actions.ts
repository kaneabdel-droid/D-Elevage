'use server'

import { createClient } from '@/utils/supabase/server'
import { getTenantContext } from '@/utils/supabase/tenant'
import { revalidatePath } from 'next/cache'

export async function ajouterParcelle(formData: FormData) {
  const tenant = await getTenantContext()
  if (!tenant) return { error: 'Non authentifié' }
  if (tenant.subscriptionTier !== 'premium') {
    return { error: 'Le volet végétal est réservé à la formule Prémium.' }
  }

  const supabase = await createClient()

  const nom = (formData.get('nom') as string || '').trim()
  const surface_ha = parseFloat(formData.get('surface_ha') as string || '1')
  const type_culture = (formData.get('type_culture') as string || 'maraichere').trim()
  const culture_actuelle = (formData.get('culture_actuelle') as string || '').trim()
  const variete = (formData.get('variete') as string || '').trim()
  const systeme_irrigation = (formData.get('systeme_irrigation') as string || 'goutte_a_goutte').trim()
  const statut = (formData.get('statut') as string || 'en_culture').trim()
  const date_semis = (formData.get('date_semis') as string || '') || null
  const date_recolte_prevue = (formData.get('date_recolte_prevue') as string || '') || null
  const rendement_estime = parseFloat(formData.get('rendement_estime') as string || '0')
  const notes = (formData.get('notes') as string || '').trim()

  if (!nom || !culture_actuelle) {
    return { error: 'Veuillez renseigner le nom de la parcelle et la culture actuelle.' }
  }

  try {
    const { error } = await supabase.from('parcelles_vegetales').insert({
      entreprise_id: tenant.entrepriseId,
      nom,
      surface_ha,
      type_culture,
      culture_actuelle,
      variete,
      systeme_irrigation,
      statut,
      date_semis,
      date_recolte_prevue,
      rendement_estime,
      notes,
    })

    if (error) {
      console.warn('Erreur insert parcelles_vegetales:', error.message)
      return { error: error.message }
    }
  } catch (err: any) {
    console.warn('Exception insert parcelle:', err?.message)
    return { error: err?.message || 'Erreur lors de la création de la parcelle.' }
  }

  revalidatePath('/vegetal')
  return { success: true }
}

export async function ajouterRecolte(formData: FormData) {
  const tenant = await getTenantContext()
  if (!tenant) return { error: 'Non authentifié' }
  if (tenant.subscriptionTier !== 'premium') {
    return { error: 'Le volet végétal est réservé à la formule Prémium.' }
  }

  const supabase = await createClient()

  const parcelle_id = (formData.get('parcelle_id') as string || '') || null
  const culture = (formData.get('culture') as string || '').trim()
  const variete = (formData.get('variete') as string || '').trim()
  const date_recolte = (formData.get('date_recolte') as string || new Date().toISOString().split('T')[0])
  const quantite = parseFloat(formData.get('quantite') as string || '0')
  const unite = (formData.get('unite') as string || 'kg').trim()
  const qualite = (formData.get('qualite') as string || 'premier_choix').trim()
  const destination = (formData.get('destination') as string || 'stock').trim()
  const cout_recolte = parseFloat(formData.get('cout_recolte') as string || '0')
  const observations = (formData.get('observations') as string || '').trim()

  if (!culture || quantite <= 0) {
    return { error: 'Veuillez préciser la culture et une quantité récoltée supérieure à 0.' }
  }

  try {
    const { error } = await supabase.from('recoltes_vegetales').insert({
      entreprise_id: tenant.entrepriseId,
      parcelle_id,
      culture,
      variete,
      date_recolte,
      quantite,
      unite,
      qualite,
      destination,
      cout_recolte,
      observations,
    })

    if (error) {
      console.warn('Erreur insert recoltes_vegetales:', error.message)
      return { error: error.message }
    }

    // Si la destination est 'stock', créer ou incrémenter le stock correspondant
    if (destination === 'stock') {
      const typeElement = culture.toLowerCase().includes('luzerne') || culture.toLowerCase().includes('fourrage') || unite === 'bottes'
        ? 'fourrage_stocke'
        : 'produit_recolte'

      const nomStock = `${culture} ${variete ? `(${variete})` : ''}`.trim()

      const { data: existant } = await supabase
        .from('stocks_vegetaux')
        .select('id, quantite_disponible')
        .eq('entreprise_id', tenant.entrepriseId)
        .eq('nom_produit', nomStock)
        .maybeSingle()

      if (existant) {
        await supabase
          .from('stocks_vegetaux')
          .update({
            quantite_disponible: Number(existant.quantite_disponible) + quantite,
            date_derniere_entree: date_recolte,
            updated_at: new Date().toISOString()
          })
          .eq('id', existant.id)
      } else {
        await supabase.from('stocks_vegetaux').insert({
          entreprise_id: tenant.entrepriseId,
          type_element: typeElement,
          nom_produit: nomStock,
          variete,
          quantite_disponible: quantite,
          unite,
          seuil_alerte: 10,
          lieu_stockage: 'Magasin Central Récoltes',
          date_derniere_entree: date_recolte,
        })
      }
    }
  } catch (err: any) {
    console.warn('Exception insert recolte:', err?.message)
    return { error: err?.message || 'Erreur lors de l’enregistrement de la récolte.' }
  }

  revalidatePath('/vegetal')
  return { success: true }
}

export async function ajusterStockVegetal(formData: FormData) {
  const tenant = await getTenantContext()
  if (!tenant) return { error: 'Non authentifié' }
  if (tenant.subscriptionTier !== 'premium') {
    return { error: 'Le volet végétal est réservé à la formule Prémium.' }
  }

  const supabase = await createClient()

  const nom_produit = (formData.get('nom_produit') as string || '').trim()
  const variete = (formData.get('variete') as string || '').trim()
  const type_element = (formData.get('type_element') as string || 'produit_recolte').trim()
  const quantite_disponible = parseFloat(formData.get('quantite_disponible') as string || '0')
  const unite = (formData.get('unite') as string || 'kg').trim()
  const seuil_alerte = parseFloat(formData.get('seuil_alerte') as string || '10')
  const lieu_stockage = (formData.get('lieu_stockage') as string || 'Hangar').trim()
  const prix_unitaire_estime = parseFloat(formData.get('prix_unitaire_estime') as string || '0')

  if (!nom_produit) {
    return { error: 'Veuillez saisir le nom du produit.' }
  }

  try {
    const { error } = await supabase.from('stocks_vegetaux').insert({
      entreprise_id: tenant.entrepriseId,
      nom_produit,
      variete,
      type_element,
      quantite_disponible,
      unite,
      seuil_alerte,
      lieu_stockage,
      prix_unitaire_estime,
      date_derniere_entree: new Date().toISOString().split('T')[0],
    })

    if (error) {
      console.warn('Erreur insert stocks_vegetaux:', error.message)
      return { error: error.message }
    }
  } catch (err: any) {
    console.warn('Exception insert stock:', err?.message)
    return { error: err?.message || 'Erreur lors de l’enregistrement du stock.' }
  }

  revalidatePath('/vegetal')
  return { success: true }
}

export async function ajouterVenteVegetale(formData: FormData) {
  const tenant = await getTenantContext()
  if (!tenant) return { error: 'Non authentifié' }
  if (tenant.subscriptionTier !== 'premium') {
    return { error: 'Le volet végétal est réservé à la formule Prémium.' }
  }

  const supabase = await createClient()

  const stock_vegetal_id = (formData.get('stock_vegetal_id') as string || '') || null
  const culture = (formData.get('culture') as string || '').trim()
  const variete = (formData.get('variete') as string || '').trim()
  const client_nom = (formData.get('client_nom') as string || '').trim()
  const client_contact = (formData.get('client_contact') as string || '').trim()
  const quantite = parseFloat(formData.get('quantite') as string || '0')
  const unite = (formData.get('unite') as string || 'kg').trim()
  const prix_unitaire = parseFloat(formData.get('prix_unitaire') as string || '0')
  const montant_total = quantite * prix_unitaire
  const moyen_paiement = (formData.get('moyen_paiement') as string || 'especes').trim()
  const statut_paiement = (formData.get('statut_paiement') as string || 'regle').trim()
  const montant_regle = statut_paiement === 'regle' ? montant_total : parseFloat(formData.get('montant_regle') as string || '0')
  const notes = (formData.get('notes') as string || '').trim()

  if (!culture || !client_nom || quantite <= 0 || prix_unitaire <= 0) {
    return { error: 'Veuillez remplir le client, la culture, la quantité et le prix unitaire.' }
  }

  try {
    const { error } = await supabase.from('ventes_vegetales').insert({
      entreprise_id: tenant.entrepriseId,
      stock_vegetal_id,
      culture,
      variete,
      client_nom,
      client_contact,
      quantite,
      unite,
      prix_unitaire,
      montant_total,
      date_vente: new Date().toISOString().split('T')[0],
      moyen_paiement,
      statut_paiement,
      montant_regle,
      notes,
    })

    if (error) {
      console.warn('Erreur insert ventes_vegetales:', error.message)
      return { error: error.message }
    }

    // Déduire du stock si un stock est lié
    if (stock_vegetal_id) {
      const { data: stockRow } = await supabase
        .from('stocks_vegetaux')
        .select('id, quantite_disponible')
        .eq('id', stock_vegetal_id)
        .maybeSingle()

      if (stockRow) {
        await supabase
          .from('stocks_vegetaux')
          .update({
            quantite_disponible: Math.max(0, Number(stockRow.quantite_disponible) - quantite),
            updated_at: new Date().toISOString()
          })
          .eq('id', stock_vegetal_id)
      }
    }
  } catch (err: any) {
    console.warn('Exception insert vente vegetale:', err?.message)
    return { error: err?.message || 'Erreur lors de l’enregistrement de la vente.' }
  }

  revalidatePath('/vegetal')
  return { success: true }
}
