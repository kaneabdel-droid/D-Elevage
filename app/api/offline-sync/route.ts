import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { getTenantContext } from '@/utils/supabase/tenant'
import { revalidatePath } from 'next/cache'

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'd-ferme-sync', timestamp: Date.now() })
}

export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantContext()
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Session non authentifiée ou expirée' }, { status: 401 })
    }

    const body = await req.json()
    const { actionType, payload } = body

    let adminClient: any
    try {
      adminClient = createAdminClient()
    } catch {
      adminClient = await createClient()
    }

    if (actionType === 'suivi_quotidien') {
      const { bande_id, date_suivi, mortalite, pontes_oeufs, aliment_kg, eau_litres, observations } = payload

      const { data, error } = await adminClient
        .from('suivis_quotidiens')
        .insert({
          entreprise_id: tenant.entrepriseId,
          bande_id: bande_id || null,
          date_suivi: date_suivi || new Date().toISOString().split('T')[0],
          mortalite: Number(mortalite) || 0,
          pontes_oeufs: Number(pontes_oeufs) || 0,
          aliment_kg: Number(aliment_kg) || 0,
          eau_litres: Number(eau_litres) || 0,
          observations: observations || null,
        })
        .select()
        .single()

      if (error) throw error

      revalidatePath('/elevage/suivi')
      revalidatePath('/dashboard')
      return NextResponse.json({ success: true, id: data.id })
    }

    if (actionType === 'vente_ferme' || actionType === 'creer_vente') {
      const { client_nom, client_id, total, montant, type_produit, details } = payload

      const montantTotal = Number(total || montant || 0)

      const { data, error } = await adminClient
        .from('ventes')
        .insert({
          entreprise_id: tenant.entrepriseId,
          client_id: client_id || null,
          montant_total: montantTotal,
          statut: 'payee',
          date_vente: new Date().toISOString().split('T')[0],
        })
        .select()
        .single()

      if (error) throw error

      // Enregistrement caisse
      try {
        await adminClient.from('transactions').insert({
          entreprise_id: tenant.entrepriseId,
          type_transaction: 'entree',
          montant: montantTotal,
          motif: `Vente Ferme (${type_produit || 'Produits'}) [Sync Hors-Ligne]`,
          date_transaction: new Date().toISOString().split('T')[0],
        })
      } catch (tresoErr) {
        console.warn('Sync treso ignorée:', tresoErr)
      }

      revalidatePath('/ventes')
      revalidatePath('/dashboard')
      return NextResponse.json({ success: true, id: data.id })
    }

    if (actionType === 'depense_ferme' || actionType === 'creer_depense') {
      const { motif, montant, categorie } = payload

      const { data, error } = await adminClient
        .from('depenses')
        .insert({
          entreprise_id: tenant.entrepriseId,
          motif: motif || 'Dépense ferme',
          montant: Number(montant) || 0,
          categorie: categorie || 'intrants',
          date_depense: new Date().toISOString().split('T')[0],
        })
        .select()
        .single()

      if (error) throw error

      revalidatePath('/tresorerie')
      revalidatePath('/dashboard')
      return NextResponse.json({ success: true, id: data.id })
    }

    return NextResponse.json({ success: false, error: `Action inconnue: ${actionType}` }, { status: 400 })
  } catch (error: any) {
    console.error('Erreur sync offline ferme:', error)
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}
