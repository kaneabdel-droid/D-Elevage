import { createClient } from '@/utils/supabase/server'
import { getTenantContext } from '@/utils/supabase/tenant'
import { 
  Bird, 
  Beef, 
  ShieldAlert, 
  TrendingUp, 
  Boxes, 
  DollarSign, 
  ArrowRight,
  AlertTriangle,
  HeartPulse
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const tenant = await getTenantContext()
  const supabase = await createClient()

  // Requêtes parallèles pour agréger la vue globale d'élevage
  const [
    { count: totalBandesActives },
    { count: totalAnimauxActifs },
    { count: alertesLatenceCount },
    { data: bandesRecentes },
    { data: financesRecentes }
  ] = await Promise.all([
    supabase.from('bandes').select('*', { count: 'exact', head: true }).eq('statut', 'en_cours'),
    supabase.from('animaux').select('*', { count: 'exact', head: true }).in('etat_sante', ['sain', 'en_soins', 'en_latence']),
    supabase.from('bandes').select('*', { count: 'exact', head: true }).eq('statut', 'en_latence'),
    supabase.from('bandes').select('id, code_bande, espece_code, effectif_actuel, statut, date_entree').order('created_at', { ascending: false }).limit(4),
    supabase.from('finances_elevage').select('id, type_operation, montant_total, date_operation, description').order('date_operation', { ascending: false }).limit(4)
  ])

  const stats = [
    { 
      name: 'Bandes Volailles Actives', 
      value: totalBandesActives || 0, 
      icon: Bird, 
      desc: 'Poulets de chair & pondeuses', 
      color: 'text-primary', 
      bg: 'bg-primary/10',
      href: '/elevage/bandes'
    },
    { 
      name: 'Cheptel Bovins / Ruminants', 
      value: totalAnimauxActifs || 0, 
      icon: Beef, 
      desc: 'Suivi individuel par boucle', 
      color: 'text-secondary', 
      bg: 'bg-secondary/10',
      href: '/elevage/animaux'
    },
    { 
      name: 'Alertes Sanitaires / Latence', 
      value: alertesLatenceCount || 0, 
      icon: ShieldAlert, 
      desc: 'Sujets en délai d’attente médical', 
      color: (alertesLatenceCount || 0) > 0 ? 'text-danger' : 'text-success', 
      bg: (alertesLatenceCount || 0) > 0 ? 'bg-danger/10' : 'bg-success/10',
      href: '/elevage/sanitaire'
    },
    { 
      name: 'Santé Globale Cheptel', 
      value: '98.5%', 
      icon: HeartPulse, 
      desc: 'Taux de conformité & viabilité', 
      color: 'text-info', 
      bg: 'bg-info/10',
      href: '/elevage/suivi'
    },
  ]

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
            Vue d'ensemble de l'Exploitation
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Suivi temps réel de la production animale, de la prophylaxie et des rendements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/elevage/bandes/nouvelle"
            className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover shadow-sm transition-all"
          >
            + Nouvelle Bande
          </Link>
          <Link
            href="/elevage/suivi/nouveau"
            className="px-4 py-2 rounded-xl border border-surface-border bg-surface text-foreground font-semibold text-sm hover:border-primary transition-all"
          >
            Saisir Suivi Quotidien
          </Link>
        </div>
      </div>

      {/* Alerte Sanitaire Si Nécessaire */}
      {(alertesLatenceCount || 0) > 0 && (
        <div className="p-4 rounded-xl border border-danger/30 bg-danger/5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-danger">Alerte de Sécurité Sanitaire : Délais de Latence Actifs</h4>
            <p className="text-xs text-foreground-muted mt-0.5">
              Des lots ou sujets sont actuellement sous traitement antibiotique ou antiparasitaire. Les ventes et abattages correspondants sont bloqués jusqu'à la fin de la période d'attente.
            </p>
          </div>
          <Link href="/elevage/sanitaire" className="text-xs font-semibold text-danger underline hover:text-danger/80">
            Voir le détail
          </Link>
        </div>
      )}

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="relative overflow-hidden rounded-2xl bg-surface border border-surface-border p-6 shadow-sm hover:border-primary transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground-muted truncate">{item.name}</p>
                <p className="text-2xl font-bold font-heading text-foreground mt-0.5">{item.value}</p>
              </div>
            </div>
            <p className="text-xs text-foreground-muted mt-4 border-t border-surface-border/50 pt-2 flex items-center justify-between">
              <span>{item.desc}</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
            </p>
          </Link>
        ))}
      </div>

      {/* Sections d'activités récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bandes récentes */}
        <div className="rounded-2xl bg-surface border border-surface-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-heading text-foreground">Bandes d'Élevage en Cours</h3>
            <Link href="/elevage/bandes" className="text-xs font-semibold text-primary hover:underline">
              Tout voir
            </Link>
          </div>
          {bandesRecentes && bandesRecentes.length > 0 ? (
            <div className="divide-y divide-surface-border">
              {bandesRecentes.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{b.code_bande}</p>
                    <p className="text-xs text-foreground-muted">Espèce: {b.espece_code} &bull; Entrée le {b.date_entree}</p>
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

        {/* Mouvements financiers récents */}
        <div className="rounded-2xl bg-surface border border-surface-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-heading text-foreground">Dernières Opérations Financières</h3>
            <Link href="/elevage/finances" className="text-xs font-semibold text-primary hover:underline">
              Tout voir
            </Link>
          </div>
          {financesRecentes && financesRecentes.length > 0 ? (
            <div className="divide-y divide-surface-border">
              {financesRecentes.map((f) => {
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
