import { createAdminClient } from '@/utils/supabase/admin'

export default async function AdminPaiementsPage() {
  const supabase = createAdminClient()

  let paiements: any[] = []
  try {
    const { data } = await supabase
      .from('abonnement_paiements')
      .select('id, montant, devise, statut, provider, moyen_paiement, created_at, entreprises(nom)')
      .order('created_at', { ascending: false })
      .limit(50)
    paiements = data || []
  } catch (e) {
    console.error('Erreur chargement paiements admin d-elevage:', e)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading mb-6">Paiements d'Abonnement D-ÉLEVAGE</h1>

      <div className="bg-background rounded-xl border border-surface-border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-foreground-muted text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Exploitation</th>
              <th className="px-4 py-3 font-medium">Montant</th>
              <th className="px-4 py-3 font-medium">Fournisseur</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {paiements.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground-muted">
                  Aucun paiement d'abonnement enregistré pour le moment.
                </td>
              </tr>
            ) : (
              paiements.map((p) => {
                const ent = Array.isArray(p.entreprises) ? p.entreprises[0] : p.entreprises
                return (
                  <tr key={p.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3 text-foreground-muted">
                      {new Date(p.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {ent?.nom || 'Exploitation'}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {Number(p.montant).toLocaleString('fr-FR')} {p.devise || 'FCFA'}
                    </td>
                    <td className="px-4 py-3 uppercase text-xs">
                      {p.provider} ({p.moyen_paiement || 'mobile'})
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        p.statut === 'completed'
                          ? 'bg-success/10 text-success'
                          : p.statut === 'pending'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-danger/10 text-danger'
                      }`}>
                        {p.statut}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
