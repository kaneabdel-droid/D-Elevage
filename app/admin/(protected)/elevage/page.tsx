import { createAdminClient } from '@/utils/supabase/admin'
import { Building2, Clock, Wallet, TrendingUp, Bird, Beef } from 'lucide-react'

export default async function AdminDElevageDashboardPage() {
  const supabase = createAdminClient()

  let entreprises: any[] = []
  let bandesActives = 0
  let animauxActifs = 0
  let paiementsDuMois: any[] = []

  try {
    const { data: entData } = await supabase.from('entreprises').select('id, nom, subscription_tier, essai_expire_le, compte_verrouille')
    entreprises = entData || []

    const { count: bCount } = await supabase.from('bandes').select('*', { count: 'exact', head: true }).eq('statut', 'en_cours')
    bandesActives = bCount || 0

    const { count: aCount } = await supabase.from('animaux').select('*', { count: 'exact', head: true }).in('etat_sante', ['sain', 'en_soins', 'en_latence'])
    animauxActifs = aCount || 0

    const debutMois = new Date()
    debutMois.setDate(1)
    debutMois.setHours(0, 0, 0, 0)

    const { data: pData } = await supabase
      .from('abonnement_paiements')
      .select('montant, devise, provider')
      .eq('statut', 'completed')
      .gte('updated_at', debutMois.toISOString())
    paiementsDuMois = pData || []
  } catch (e) {
    console.error('Erreur requêtes dashboard admin d-elevage:', e)
  }

  const revenuDuMois = paiementsDuMois.reduce((sum, p) => sum + (Number(p.montant) || 0), 0)

  const parForfait = ['standard', 'medium', 'premium'].map((niveau) => ({
    niveau,
    count: entreprises.filter((e) => e.subscription_tier === niveau).length,
  }))

  const cards = [
    { label: 'Exploitations au total', value: entreprises.length, icon: Building2 },
    { label: 'Bandes avicoles actives', value: bandesActives, icon: Bird },
    { label: 'Bovins / Animaux actifs', value: animauxActifs, icon: Beef },
    { label: 'Revenu abonnements du mois (FCFA)', value: revenuDuMois.toLocaleString('fr-FR'), icon: TrendingUp },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading mb-6">Tableau de bord D-ÉLEVAGE (SuperAdmin)</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-background rounded-xl p-5 border border-surface-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-foreground-muted">{label}</span>
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold font-heading">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-background rounded-xl border border-surface-border p-6 mb-8">
        <h2 className="text-lg font-bold font-heading mb-4">Répartition des abonnements</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {parForfait.map(({ niveau, count }) => (
            <div key={niveau} className="p-4 rounded-lg bg-surface border border-surface-border">
              <p className="text-xs text-foreground-muted uppercase tracking-wider font-semibold">Forfait {niveau}</p>
              <p className="text-2xl font-bold font-heading mt-1">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
