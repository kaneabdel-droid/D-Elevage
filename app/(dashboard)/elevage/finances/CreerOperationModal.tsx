'use client'

import { useState } from 'react'
import { Plus, X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { enregistrerOperation } from './actions'

export default function CreerOperationModal({
  bandes,
  animaux
}: {
  bandes: Array<{ id: string; code_bande: string; statut: string }>
  animaux: Array<{ id: string; numero_boucle: string; etat_sante: string }>
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [typeOp, setTypeOp] = useState('vente_sujets')

  const isVente = typeOp.startsWith('vente') || typeOp === 'autre_produit'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const res = await enregistrerOperation(formData)

    setLoading(false)
    if (res?.error) {
      setError(res.error)
    } else {
      setOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover shadow-sm transition-all flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> Enregistrer une Opération
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 text-foreground-muted hover:text-foreground rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2.5 rounded-xl ${isVente ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                {isVente ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading text-foreground">
                  {isVente ? 'Encaisser une Vente' : 'Enregistrer une Charge'}
                </h3>
                <p className="text-xs text-foreground-muted">Ventes d'animaux, œufs, lait, intrants ou frais vétérinaires</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Type d'Opération *</label>
                <select
                  name="type_operation"
                  value={typeOp}
                  onChange={(e) => setTypeOp(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <optgroup label="Revenus & Ventes">
                    <option value="vente_sujets">Vente d'animaux / volailles</option>
                    <option value="vente_oeufs">Vente d'œufs (plateaux / alvéoles)</option>
                    <option value="vente_lait">Vente de lait</option>
                    <option value="autre_produit">Autre produit d'élevage</option>
                  </optgroup>
                  <optgroup label="Dépenses & Charges">
                    <option value="achat_intrant">Achat d'aliment / intrant</option>
                    <option value="charge_veterinaire">Soins vétérinaires / vaccins</option>
                    <option value="achat_animaux">Achat d'animaux</option>
                    <option value="autre_charge">Autre charge d'exploitation</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Bande Associée</label>
                  <select
                    name="bande_id"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">-- Aucune --</option>
                    {bandes.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.code_bande} {b.statut === 'en_latence' ? '⚠️ (Latence active)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Ou Animal Individuel</label>
                  <select
                    name="animal_id"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">-- Aucun --</option>
                    {animaux.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.numero_boucle} {a.etat_sante === 'en_latence' ? '⚠️ (Latence active)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Montant Total (FCFA) *</label>
                  <input
                    type="number"
                    name="montant_total"
                    required
                    placeholder="ex: 75000"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Quantité</label>
                  <input
                    type="number"
                    step="0.5"
                    name="quantite"
                    defaultValue="1"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Mode de Paiement</label>
                  <select
                    name="moyen_paiement"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="especes">Espèces</option>
                    <option value="wave">Wave</option>
                    <option value="orange_money">Orange Money</option>
                    <option value="virement">Virement</option>
                    <option value="cheque">Chèque</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Client / Fournisseur</label>
                  <input
                    type="text"
                    name="tiers_nom"
                    placeholder="Nom du tiers"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Date *</label>
                  <input
                    type="date"
                    name="date_operation"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Libellé / Détails</label>
                <input
                  type="text"
                  name="description"
                  placeholder="ex: Vente de 30 poulets prêts à cuire"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl border border-surface-border text-foreground text-sm font-semibold hover:bg-black/5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50 ${
                    isVente ? 'bg-success hover:bg-success/90' : 'bg-danger hover:bg-danger/90'
                  }`}
                >
                  {loading ? 'Validation...' : isVente ? 'Valider la Vente' : 'Valider la Charge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
