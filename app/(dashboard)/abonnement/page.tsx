import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, CheckCircle2, Clock, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react'
import { FORFAITS_ELEVAGE, type TierElevage } from '@/lib/abonnements/tiers'

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams?: Promise<{ essai_expire?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const essaiVerrouille = params?.essai_expire === '1'

  const { data: userData } = await supabase
    .from('utilisateurs')
    .select('entreprises(nom, subscription_tier, essai_expire_le, devise)')
    .eq('id', user.id)
    .single()

  const entreprise = Array.isArray(userData?.entreprises) ? userData.entreprises[0] : userData?.entreprises
  const currentTier: TierElevage = (entreprise?.subscription_tier as TierElevage) || 'standard'
  const devise = entreprise?.devise || 'FCFA'

  const maintenant = new Date()
  const essaiExpireLe = entreprise?.essai_expire_le ? new Date(entreprise.essai_expire_le) : null
  const essaiExpire = essaiExpireLe ? essaiExpireLe < maintenant : false
  const joursRestants = essaiExpireLe && !essaiExpire
    ? Math.max(0, Math.ceil((essaiExpireLe.getTime() - maintenant.getTime()) / (1000 * 60 * 60 * 24)))
    : null

  const plans = [
    FORFAITS_ELEVAGE.standard,
    FORFAITS_ELEVAGE.medium,
    FORFAITS_ELEVAGE.premium,
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      <div>
        <h1 className="text-3xl font-bold font-heading text-foreground">Abonnement & Forfaits</h1>
        <p className="text-foreground-muted mt-1">
          Gérez votre forfait d'exploitation pour <span className="font-semibold text-foreground">{entreprise?.nom}</span>
        </p>
      </div>

      {(essaiExpire || essaiVerrouille) && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Période d'essai expirée</h4>
            <p className="text-xs text-foreground-muted mt-0.5">
              Votre période d'essai est arrivée à terme. Choisissez un forfait ci-dessous pour débloquer l'accès complet à vos données.
            </p>
          </div>
        </div>
      )}

      {!essaiExpire && joursRestants !== null && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
          <Clock className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Période d'essai en cours</h4>
            <p className="text-xs text-foreground-muted mt-0.5">
              Il vous reste <span className="font-bold text-primary">{joursRestants} jour(s)</span> d'essai gratuit sur D-Élevage.
            </p>
          </div>
        </div>
      )}

      {/* Forfait actuel */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-border shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold text-foreground-muted tracking-wider">Forfait Actif</span>
          <h2 className="text-2xl font-bold font-heading text-primary capitalize mt-1">
            {FORFAITS_ELEVAGE[currentTier]?.nom}
          </h2>
          <p className="text-sm text-foreground-muted mt-0.5">
            Quota : jusqu'à <span className="font-semibold text-foreground">{FORFAITS_ELEVAGE[currentTier]?.quotaUtilisateurs} utilisateurs</span> inclus.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold uppercase tracking-wider">
            Actif
          </span>
        </div>
      </div>

      {/* Grille des offres */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((p) => {
          const estActuel = p.id === currentTier

          return (
            <div
              key={p.id}
              className={`rounded-2xl bg-surface border p-8 shadow-sm flex flex-col justify-between relative transition-all ${
                p.id === 'medium'
                  ? 'border-2 border-primary shadow-md'
                  : 'border-surface-border hover:border-primary/50'
              }`}
            >
              {p.id === 'medium' && (
                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider">
                  Recommandé
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold font-heading text-foreground mb-1">{p.nom}</h3>
                <p className="text-xs text-foreground-muted mb-6">{p.description}</p>

                <div className="mb-6">
                  <span className="text-3xl font-bold font-heading text-foreground">
                    {p.prixMensuelFcfa.toLocaleString('fr-FR')}
                  </span>{' '}
                  <span className="text-xs text-foreground-muted">{devise} / mois</span>
                </div>

                <div className="border-t border-surface-border/50 pt-4 mb-6">
                  <p className="text-xs font-semibold text-foreground mb-3">Fonctionnalités incluses :</p>
                  <ul className="space-y-2.5 text-xs text-foreground-muted">
                    {p.modulesInclus.map((m, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                {estActuel ? (
                  <div className="w-full py-2.5 rounded-xl bg-black/5 text-foreground-muted text-center font-semibold text-xs cursor-default">
                    Forfait Actuel
                  </div>
                ) : (
                  <Link
                    href={`/checkout?plan=${p.id}`}
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      p.id === 'medium'
                        ? 'bg-primary text-white hover:bg-primary-hover shadow-sm'
                        : 'border border-primary text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    Choisir ce forfait <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
