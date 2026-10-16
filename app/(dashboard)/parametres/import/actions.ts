'use server'

import { createClient } from '@/utils/supabase/server'
import { getTenantContext } from '@/utils/supabase/tenant'
import { revalidatePath } from 'next/cache'

export async function importerDonneesElevage(typeId: string, records: any[]) {
  const tenant = await getTenantContext()
  if (!tenant?.entrepriseId) return { succes: 0, erreurs: records.length, details: ['Session ou exploitation introuvable.'] }

  const supabase = await createClient()
  const entrepriseId = tenant.entrepriseId

  let succes = 0
  let erreurs = 0
  const details: string[] = []

  if (typeId === 'bandes') {
    for (const item of records) {
      try {
        const codeBande = (item.code_bande || item.code || '').trim()
        if (!codeBande) {
          erreurs++
          details.push('Ligne ignorée : code de bande manquant')
          continue
        }
        const especeCode = (item.espece_code || item.espece || 'volaille_chair').trim()
        const effectifInitial = parseInt(item.effectif_initial || item.effectif || '100', 10) || 100
        const effectifActuel = parseInt(item.effectif_actuel || item.effectif || String(effectifInitial), 10) || effectifInitial
        const dateEntree = item.date_entree || new Date().toISOString().split('T')[0]
        const poidsMoyenKg = parseFloat(String(item.poids_moyen_kg || item.poids || '0').replace(',', '.')) || null
        const coutAchatSujet = parseFloat(String(item.cout_achat_sujet || item.cout || '0').replace(',', '.')) || 0
        const statut = (item.statut || 'en_cours').trim()

        const { error } = await supabase.from('bandes').upsert({
          entreprise_id: entrepriseId,
          code_bande: codeBande,
          espece_code: especeCode,
          effectif_initial: effectifInitial,
          effectif_actuel: effectifActuel,
          poids_moyen_actuel_kg: poidsMoyenKg,
          cout_achat_sujet: coutAchatSujet,
          date_entree: dateEntree,
          statut: statut,
        }, { onConflict: 'entreprise_id, code_bande' })

        if (error) throw error
        succes++
      } catch (e: any) {
        erreurs++
        details.push(`Erreur bande "${item.code_bande}" : ${e.message}`)
      }
    }
    revalidatePath('/elevage/bandes')
  } else if (typeId === 'animaux') {
    for (const item of records) {
      try {
        const numeroBoucle = (item.numero_boucle || item.boucle || item.identification || '').trim()
        if (!numeroBoucle) {
          erreurs++
          details.push('Ligne ignorée : numéro de boucle manquant')
          continue
        }
        const nomOuSurnom = (item.nom_ou_surnom || item.nom || '').trim() || null
        const especeCode = (item.espece_code || item.espece || 'bovin_viande').trim()
        const sexe = (item.sexe || 'F').trim().toUpperCase() === 'M' ? 'M' : 'F'
        const dateNaissance = item.date_naissance || null
        const dateEntree = item.date_entree || new Date().toISOString().split('T')[0]
        const poidsActuelKg = parseFloat(String(item.poids_actuel_kg || item.poids || '0').replace(',', '.')) || null
        const origine = (item.origine || 'ne_sur_ferme').trim()

        const { error } = await supabase.from('animaux').upsert({
          entreprise_id: entrepriseId,
          numero_boucle: numeroBoucle,
          nom_ou_surnom: nomOuSurnom,
          espece_code: especeCode,
          sexe,
          date_naissance: dateNaissance,
          date_entree: dateEntree,
          poids_actuel_kg: poidsActuelKg,
          origine
        }, { onConflict: 'entreprise_id, numero_boucle' })

        if (error) throw error
        succes++
      } catch (e: any) {
        erreurs++
        details.push(`Erreur animal "${item.numero_boucle}" : ${e.message}`)
      }
    }
    revalidatePath('/elevage/animaux')
  } else if (typeId === 'parcelles') {
    for (const item of records) {
      try {
        const nom = (item.nom || item.parcelle || '').trim()
        if (!nom) {
          erreurs++
          details.push('Ligne ignorée : nom de parcelle manquant')
          continue
        }
        const surfaceHa = parseFloat(String(item.surface_ha || item.surface || '1').replace(',', '.')) || 1.0
        const typeCulture = (item.type_culture || 'maraichere').trim()
        const cultureActuelle = (item.culture_actuelle || item.culture || 'Maraîchage').trim()
        const variete = (item.variete || '').trim() || null
        const dateSemis = item.date_semis || null
        const dateRecoltePrevue = item.date_recolte_prevue || null
        const rendementEstime = parseFloat(String(item.rendement_estime || '0').replace(',', '.')) || null
        const systemeIrrigation = (item.systeme_irrigation || 'goutte_a_goutte').trim()

        const { error } = await supabase.from('parcelles_vegetales').insert({
          entreprise_id: entrepriseId,
          nom,
          surface_ha: surfaceHa,
          type_culture: typeCulture,
          culture_actuelle: cultureActuelle,
          variete,
          date_semis: dateSemis,
          date_recolte_prevue: dateRecoltePrevue,
          rendement_estime: rendementEstime,
          systeme_irrigation: systemeIrrigation,
          statut: 'en_culture'
        })

        if (error) throw error
        succes++
      } catch (e: any) {
        erreurs++
        details.push(`Erreur parcelle "${item.nom}" : ${e.message}`)
      }
    }
    revalidatePath('/vegetal')
  } else if (typeId === 'aliments') {
    for (const item of records) {
      try {
        const nom = (item.nom || item.aliment || '').trim()
        if (!nom) {
          erreurs++
          continue
        }
        const typeAliment = (item.type_aliment || 'aliment').trim()
        const quantiteKg = parseFloat(String(item.quantite_kg || item.quantite || '0').replace(',', '.')) || 0
        const seuilAlerteKg = parseFloat(String(item.seuil_alerte_kg || '0').replace(',', '.')) || 0
        const prixUnitaireKg = parseFloat(String(item.prix_unitaire_kg || item.prix || '0').replace(',', '.')) || 0

        const { error } = await supabase.from('aliments_intrants').insert({
          entreprise_id: entrepriseId,
          nom,
          type_aliment: typeAliment,
          quantite_kg: quantiteKg,
          seuil_alerte_kg: seuilAlerteKg,
          prix_unitaire_kg: prixUnitaireKg
        })

        if (error) throw error
        succes++
      } catch (e: any) {
        erreurs++
        details.push(`Erreur aliment "${item.nom}" : ${e.message}`)
      }
    }
    revalidatePath('/elevage/stocks')
  }

  return { succes, erreurs, details }
}
