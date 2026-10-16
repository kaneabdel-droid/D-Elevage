import { createClient } from '@/utils/supabase/server'
import { getTenantContext, ACTIVITES_PAR_DEFAUT } from '@/utils/supabase/tenant'
import { 
  Bird, 
  Beef, 
  ShieldAlert, 
  TrendingUp, 
  ArrowRight, 
  AlertTriangle, 
  HeartPulse,
  Sprout,
  Milk,
  Wheat,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { 
  DEMO_BANDES, 
  DEMO_FINANCES, 
  DEMO_PARCELLES, 
  DEMO_RECOLTES 
} from '@/lib/demo-data'

export const metadata = {
  title: 'Tableau de bord — D-Agroferme',
}

export default async function DashboardPage() {
  const tenant = await getTenantContext()
  const supabase = await createClient()

  const typesActivite = tenant?.typesActivite || ACTIVITES_PAR_DEFAUT
  const isPremium = tenant?.subscriptionTier === 'premium'

  const aVolaille = typesActivite.includes('volaille')
  const aRuminants = typesActivite.includes('ruminants')
  const aLait = typesActivite.includes('lait')
  const aVegetal = typesActivite.includes('production_vegetale')

  // Requêtes pour agréger la vue globale agro-pastorale
  let totalBandesActives: number | null = null
  let totalAnimauxActifs: number | null = null
  let alertesLatenceCount: number | null = null
  let totalParcellesCount: number | null = null
  let bandesRecentes: any[] | null = null
  let financesRecentes: any[] | null = null
  let parcellesRecentes: any[] | null = null

  try {
    const promises: PromiseLike<any>[] = [
      supabase.from('bandes').select('*', { count: 'exact', head: true }).eq('statut', 'en_cours'),
      supabase.from('animaux').select('*', { count: 'exact', head: true }).in('etat_sante', ['sain', 'en_soins', 'en_latence']),
      supabase.from('bandes').select('*', { count: 'exact', head: true }).eq('statut', 'en_latence'),
      supabase.from('bandes').select('id, code_bande, espece_code, effectif_actuel, statut, date_entree').order('created_at', { ascending: false }).limit(4),
      supabase.from('finances_elevage').select('id, type_operation, montant_total, date_operation, description').order('date_operation', { ascending: false }).limit(4)
    ]

    if (aVegetal) {
      promises.push(supabase.from('parcelles_vegetales').select('*', { count: 'exact', head: true }))
      promises.push(supabase.from('parcelles_vegetales').select('id, nom, culture_actuelle, variete, surface_ha, statut').order('created_at', { ascending: false }).limit(4))
    }

    const results = await Promise.all(promises)
    totalBandesActives = results[0]?.count ?? null
    totalAnimauxActifs = results[1]?.count ?? null
    alertesLatenceCount = results[2]?.count ?? null
    bandesRecentes = results[3]?.data ?? null
    financesRecentes = results[4]?.data ?? null

    if (aVegetal) {
      totalParcellesCount = results[5]?.count ?? null
      parcellesRecentes = results[6]?.data ?? null
    }
  } catch {
    // Si les tables sont en cours d'initialisation, bascule démo transparente
  }

  const isDemo = !tenant || tenant.entrepriseId === '00000000-0000-0000-0000-000000000001'

  // Données dynamiques ou données de démo enrichies
  const displayTotalBandes = (totalBandesActives && totalBandesActives > 0) ? totalBandesActives : (isDemo ? 3 : 0)
  const displayTotalAnimaux = (totalAnimauxActifs && totalAnimauxActifs > 0) ? totalAnimauxActifs : (isDemo ? 6 : 0)
  const displayAlertesLatence = (alertesLatenceCount !== null && alertesLatenceCount > 0) ? alertesLatenceCount : (isDemo ? 1 : 0)
  const displayTotalParcelles = (totalParcellesCount && totalParcellesCount > 0) ? totalParcellesCount : (isDemo ? DEMO_PARCELLES.length : 0)

  const displayBandesRecentes = (bandesRecentes && bandesRecentes.length > 0) ? bandesRecentes : (isDemo ? DEMO_BANDES : [])
  const displayFinancesRecentes = (financesRecentes && financesRecentes.length > 0) ? financesRecentes : (isDemo ? DEMO_FINANCES : [])
  const displayParcellesRecentes = (parcellesRecentes && parcellesRecentes.length > 0) ? parcellesRecentes : (isDemo ? DEMO_PARCELLES : [])

  // Construction des KPI filtrés selon les activités de l'exploitation
  const stats: any[] = []

  if (aVolaille) {
    stats.push({
      name: 'Volailles & Bandes Actives',
      value: displayTotalBandes,
      icon: Bird,
      desc: isDemo ? '4 252 sujets en croissance' : 'Poulets de chair & pondeuses',
      color: 'text-primary',
      bg: 'bg-primary/10',
      href: '/elevage/bandes'
    })
  }

  if (aRuminants) {
    stats.push({
      name: 'Cheptel Bovins / Ruminants',
      value: displayTotalAnimaux,
      icon: Beef,
      desc: isDemo ? 'Vaches laitières, Ladoum & Caprins' : 'Suivi individuel par boucle',
      color: 'text-secondary',
      bg: 'bg-secondary/10',
      href: '/elevage/animaux'
    })
  }

  if (aVegetal) {
    stats.push({
      name: 'Cultures & Parcelles',
      value: displayTotalParcelles,
      icon: Sprout,
      desc: isDemo ? '13.5 ha (Maraîchage & Fourrage)' : 'Suivi parcellaire & récoltes',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      href: '/vegetal'
    })
  }

  if (aLait) {
    stats.push({
      name: 'Collecte Laitière',
      value: '240 L/j',
      icon: Milk,
      desc: 'Production quotidienne de traite',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10',
      href: '/elevage/suivi'
    })
  }

  stats.push({
    name: 'Santé & Latence Sanitaire',
    value: displayAlertesLatence,
    icon: ShieldAlert,
    desc: displayAlertesLatence > 0 ? 'Délai de retrait actif' : 'Aucun sujet sous restriction',
    color: displayAlertesLatence > 0 ? 'text-danger' : 'text-success',
    bg: displayAlertesLatence > 0 ? 'bg-danger/10' : 'bg-success/10',
    href: '/elevage/sanitaire'
  })

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
            Tableau de Bord — D-Agroferme
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Pilotage agro-pastoral intégré de votre exploitation : cheptel, cultures et finances.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {aVolaille && (
            <Link
              href="/elevage/bandes"
              className="px-3.5 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-hover shadow-xs transition-all flex items-center gap-1.5"
            >
              <Bird className="w-4 h-4" />
              <span>Bandes</span>
            </Link>
          )}
          {aVegetal && (
            <Link
              href="/vegetal"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-xs transition-all flex items-center gap-1.5"
            >
              <Sprout className="w-4 h-4" />
              <span>Volet Végétal</span>
            </Link>
          )}
          <Link
            href="/elevage/suivi"
            className="px-3.5 py-2 rounded-xl border border-surface-border bg-surface text-foreground font-semibold text-xs hover:border-primary transition-all flex items-center gap-1.5"
          >
            <span>Suivi Quotidien</span>
          </Link>
        </div>
      </div>

      {/* Alerte Sanitaire Si Nécessaire */}
      {displayAlertesLatence > 0 && (
        <div className="p-4 rounded-xl border border-danger/30 bg-danger/5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-danger">Alerte de Sécurité Sanitaire : Délais de Latence Actifs ({displayAlertesLatence})</h4>
            <p className="text-xs text-foreground-muted mt-0.5">
              Des animaux sont sous délai de retrait médical. La consommation et la vente de leur lait ou viande sont consignées pour protéger la santé des consommateurs.
            </p>
          </div>
          <Link href="/elevage/sanitaire" className="text-xs font-semibold text-danger underline hover:text-danger/80 shrink-0">
            Voir le détail
          </Link>
        </div>
      )}

      {/* Cartes KPI dynamiques selon les activités configurées */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${stats.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        {stats.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col justify-between rounded-2xl bg-surface border border-surface-border p-5 shadow-xs hover:border-primary hover:shadow-md transition-all group min-w-0"
          >
            <div className="flex items-start justify-between gap-3 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-foreground-muted truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="text-2xl sm:text-3xl font-bold font-heading text-foreground mt-2 tracking-tight">
                  {item.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${item.bg} ${item.color} shrink-0`}>
                <item.icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </div>
            </div>
            <div className="text-xs text-foreground-muted mt-4 border-t border-surface-border/50 pt-2.5 flex items-center justify-between gap-2 min-w-0">
              <span className="truncate">{item.desc}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary rtl:-scale-x-100" />
            </div>
          </Link>
        ))}
      </div>

      {/* Sections d'activités récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bandes ou Parcelles selon activité */}
        {aVegetal ? (
          <div className="rounded-2xl bg-surface border border-surface-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-500" />
                Cultures Végétales & Parcelles
              </h3>
              <Link href="/vegetal" className="text-xs font-semibold text-primary hover:underline">
                Tout voir
              </Link>
            </div>
            {displayParcellesRecentes && displayParcellesRecentes.length > 0 ? (
              <div className="divide-y divide-surface-border">
                {displayParcellesRecentes.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{p.nom}</p>
                      <p className="text-xs text-foreground-muted">
                        {p.culture_actuelle} {p.variete ? `(${p.variete})` : ''} &bull; {p.surface_ha} ha
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 capitalize">
                        {p.statut.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-foreground-muted">
                Aucune parcelle enregistrée.
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-surface border border-surface-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-heading text-foreground">Bandes d'Élevage en Cours</h3>
              <Link href="/elevage/bandes" className="text-xs font-semibold text-primary hover:underline">
                Tout voir
              </Link>
            </div>
            {displayBandesRecentes && displayBandesRecentes.length > 0 ? (
              <div className="divide-y divide-surface-border">
                {displayBandesRecentes.map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{b.code_bande}</p>
                      <p className="text-xs text-foreground-muted">
                        {b.espece_code === 'volaille_chair' ? 'Poulets de chair' : b.espece_code === 'volaille_ponte' ? 'Poules pondeuses' : b.espece_code} &bull; Entrée le {b.date_entree}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{b.effectif_actuel} sujets</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        b.statut === 'en_latence' 
                          ? 'bg-danger/10 text-danger' 
                          : 'bg-success/10 text-success'
                      }`}>
                        {b.statut === 'en_latence' ? 'Latence Médicale' : 'En croissance'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-foreground-muted">
                Aucune bande active enregistrée.
              </div>
            )}
          </div>
        )}

        {/* Mouvements financiers récents */}
        <div className="rounded-2xl bg-surface border border-surface-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-heading text-foreground">Dernières Opérations Financières</h3>
            <Link href="/elevage/finances" className="text-xs font-semibold text-primary hover:underline">
              Tout voir
            </Link>
          </div>
          {displayFinancesRecentes && displayFinancesRecentes.length > 0 ? (
            <div className="divide-y divide-surface-border">
              {displayFinancesRecentes.map((f) => {
                const isVente = f.type_operation.startsWith('vente')
                return (
                  <div key={f.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-foreground capitalize">
                        {f.type_operation.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-foreground-muted">{f.description || f.date_operation}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isVente ? 'text-success' : 'text-danger'}`}>
                        {isVente ? '+' : '-'}{Number(f.montant_total).toLocaleString('fr-FR')} {tenant?.devise || 'FCFA'}
                      </p>
                      <p className="text-xs text-foreground-muted">{f.date_operation}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-foreground-muted">
              Aucune opération financière enregistrée pour le moment.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
