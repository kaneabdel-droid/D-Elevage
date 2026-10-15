import { createAdminClient } from '@/utils/supabase/admin'
import EntrepriseRowActions from './EntrepriseRowActions'

export default async function AdminEntreprisesPage() {
  const supabase = createAdminClient()

  let entreprises: any[] = []
  try {
    const { data } = await supabase
      .from('entreprises')
      .select('id, nom, telephone, email, subscription_tier, essai_expire_le, compte_verrouille, devise, created_at')
      .order('created_at', { ascending: false })
    entreprises = data || []
  } catch (e) {
    console.error('Erreur chargement entreprises admin:', e)
  }

  const maintenant = new Date()

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading mb-6">Exploitations D-ÉLEVAGE ({entreprises.length})</h1>

      <div className="bg-background rounded-xl border border-surface-border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-foreground-muted text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Nom de l'exploitation</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Forfait</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {entreprises.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground-muted">
                  Aucune exploitation enregistrée.
                </td>
              </tr>
            ) : (
              entreprises.map((ent) => {
                const essaiExpire = ent.essai_expire_le ? new Date(ent.essai_expire_le) < maintenant : false
                return (
                  <tr key={ent.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{ent.nom}</p>
                      <p className="text-xs text-foreground-muted">{ent.devise || 'FCFA'}</p>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      <div>{ent.email || '-'}</div>
                      <div className="text-xs">{ent.telephone || ''}</div>
                    </td>
                    <td className="px-4 py-3 capitalize">{ent.subscription_tier || 'standard'}</td>
                    <td className="px-4 py-3">
                      {ent.compte_verrouille ? (
                        <span className="text-danger font-medium">Verrouillé</span>
                      ) : essaiExpire ? (
                        <span className="text-danger font-medium">Essai expiré</span>
                      ) : ent.essai_expire_le ? (
                        <span className="text-success font-medium">
                          Essai (jusqu'au {new Date(ent.essai_expire_le).toLocaleDateString('fr-FR')})
                        </span>
                      ) : (
                        <span className="text-success font-medium">Actif</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <EntrepriseRowActions
                        entrepriseId={ent.id}
                        tier={ent.subscription_tier || 'standard'}
                        isVerrouille={!!ent.compte_verrouille}
                      />
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
