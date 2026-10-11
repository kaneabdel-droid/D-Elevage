import { createClient } from '@/utils/supabase/server'
import { getTenantContext } from '@/utils/supabase/tenant'
import { Bird, ShieldAlert, CheckCircle2, Calendar, Scale, Layers } from 'lucide-react'
import CreerBandeModal from './CreerBandeModal'

export default async function BandesPage() {
  const tenant = await getTenantContext()
  const supabase = await createClient()

  const [
    { data: bandes },
    { data: batiments },
    { data: especes }
  ] = await Promise.all([
    supabase
      .from('bandes')
      .select('*, batiments(nom)')
      .order('date_entree', { ascending: false }),
    supabase.from('batiments').select('id, nom').order('nom'),
    supabase.from('especes_elevage').select('code, nom').order('nom')
  ])

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Bandes & Volailles en Cohortes
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Gérez vos cycles de production avicole, porcine et lots d'engraissement.
          </p>
        </div>
        <CreerBandeModal
          batiments={batiments || []}
          especes={especes || []}
        />
      </div>

      {/* Grille des bandes */}
      {bandes && bandes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bandes.map((b) => {
            const perteSujets = b.effectif_initial - b.effectif_actuel
            const tauxMortalite = b.effectif_initial > 0 
              ? ((perteSujets / b.effectif_initial) * 100).toFixed(1) 
              : '0'

            return (
              <div
                key={b.id}
                className={`rounded-2xl bg-surface border p-6 shadow-sm transition-all flex flex-col justify-between ${
                  b.statut === 'en_latence' 
                    ? 'border-danger/40 bg-danger/5' 
                    : 'border-surface-border hover:border-primary'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold font-heading text-lg text-foreground">
                      {b.code_bande}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        b.statut === 'en_latence'
                          ? 'bg-danger/20 text-danger'
                          : b.statut === 'en_cours'
                          ? 'bg-success/15 text-success'
                          : 'bg-black/10 text-foreground-muted'
                      }`}
                    >
                      {b.statut === 'en_latence'
                        ? 'En Latence Médicale'
                        : b.statut === 'en_cours'
                        ? 'En croissance'
                        : 'Clôturée'}
                    </span>
                  </div>

                  <p className="text-xs text-foreground-muted mb-4 capitalize">
                    {b.espece_code.replace(/_/g, ' ')} &bull; {b.batiments?.nom || 'Sans enclos'}
                  </p>

                  <div className="space-y-2 text-sm border-t border-surface-border/50 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground-muted text-xs">Effectif actuel :</span>
                      <span className="font-bold text-foreground">
                        {b.effectif_actuel} / {b.effectif_initial} sujets
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-foreground-muted text-xs">Taux de mortalité :</span>
                      <span className={`font-semibold text-xs ${Number(tauxMortalite) > 5 ? 'text-danger' : 'text-success'}`}>
                        {tauxMortalite}% ({perteSujets} pertes)
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-foreground-muted text-xs">Poids moyen mesuré :</span>
                      <span className="font-semibold text-foreground text-xs">
                        {b.poids_moyen_actuel_kg ? `${b.poids_moyen_actuel_kg} kg` : 'Non renseigné'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-foreground-muted text-xs">Date d'entrée :</span>
                      <span className="text-foreground-muted text-xs">
                        {b.date_entree}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-surface-border flex items-center justify-between text-xs">
                  <span className="text-foreground-muted">
                    Coût poussin: {Number(b.cout_achat_sujet).toLocaleString('fr-FR')} {tenant?.devise || 'FCFA'}
                  </span>
                  <a
                    href={`/elevage/bandes/${b.id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    Détail & Suivi &rarr;
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-surface border border-surface-border p-12 text-center">
          <Bird className="w-12 h-12 text-foreground-muted/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground">Aucune bande enregistrée</h3>
          <p className="text-sm text-foreground-muted max-w-md mx-auto mt-1 mb-6">
            Créez votre première bande de poussins ou de volailles pour démarrer le suivi des mortalités, pesées et rentabilité.
          </p>
          <CreerBandeModal
            batiments={batiments || []}
            especes={especes || []}
          />
        </div>
      )}
    </div>
  )
}
