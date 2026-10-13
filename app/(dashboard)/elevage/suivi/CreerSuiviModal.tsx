'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, X, Activity, Egg, Milk, Scale } from 'lucide-react'
import { enregistrerSuiviQuotidien } from './actions'

export default function CreerSuiviModal({
  bandes,
  animaux,
  aliments
}: {
  bandes: Array<{ id: string; code_bande: string; effectif_actuel: number }>
  animaux: Array<{ id: string; numero_boucle: string; nom_ou_surnom: string | null }>
  aliments: Array<{ id: string; nom: string; unite: string }>
}) {
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [cibleType, setCibleType] = useState<'bande' | 'animal'>('bande')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams?.get('nouveau') === '1') {
      setOpen(true)
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const res = await enregistrerSuiviQuotidien(formData)

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
        <Plus className="w-4 h-4" /> Saisir un Relevé Quotidien
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 text-foreground-muted hover:text-foreground rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading text-foreground">Relevé Quotidien de Production</h3>
                <p className="text-xs text-foreground-muted">Alimentation, mortalités, ponte, lait et pesées</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Choix Cible : Bande ou Animal */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Cible du Relevé *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="cible_type"
                      checked={cibleType === 'bande'}
                      onChange={() => setCibleType('bande')}
                      className="text-primary focus:ring-primary"
                    />
                    Bande / Lot de Volailles
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="cible_type"
                      checked={cibleType === 'animal'}
                      onChange={() => setCibleType('animal')}
                      className="text-primary focus:ring-primary"
                    />
                    Bovin / Animal Individuel
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {cibleType === 'bande' ? (
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Sélectionner la Bande *</label>
                    <select
                      name="bande_id"
                      required
                      className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">-- Choisir une bande --</option>
                      {bandes.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.code_bande} ({b.effectif_actuel} sujets)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Sélectionner l'Animal *</label>
                    <select
                      name="animal_id"
                      required
                      className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">-- Choisir une boucle --</option>
                      {animaux.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.numero_boucle} {a.nom_ou_surnom ? `(${a.nom_ou_surnom})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Date du Relevé *</label>
                  <input
                    type="date"
                    name="date_suivi"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Mortalités & Cause */}
              <div className="p-3.5 rounded-xl border border-surface-border bg-background/50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-danger flex items-center gap-1.5">
                  Mortalités / Pertes du Jour
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Nombre de Sujets Perdus</label>
                    <input
                      type="number"
                      name="mortalites"
                      min="0"
                      defaultValue="0"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-surface focus:outline-none focus:ring-2 focus:ring-danger/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Cause suspectée</label>
                    <input
                      type="text"
                      name="cause_mortalite"
                      placeholder="ex: Chaleur, étouffement, diarrhée..."
                      className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-surface focus:outline-none focus:ring-2 focus:ring-danger/20"
                    />
                  </div>
                </div>
              </div>

              {/* Alimentation & Pesée */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Aliment Distribué</label>
                  <select
                    name="aliment_intrant_id"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">-- Aucun --</option>
                    {aliments.map((al) => (
                      <option key={al.id} value={al.id}>
                        {al.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Quantité (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="aliment_quantite_kg"
                    defaultValue="0"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Pesée Moyenne (kg)</label>
                  <input
                    type="number"
                    step="0.005"
                    name="poids_moyen_mesure_kg"
                    placeholder="ex: 1.850"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Ponte & Lait si applicable */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Œufs Récoltés</label>
                  <input
                    type="number"
                    name="oeufs_recoltes"
                    defaultValue="0"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Œufs Cassés / Déclassés</label>
                  <input
                    type="number"
                    name="oeufs_casses"
                    defaultValue="0"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Lait Trait (Litres)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="lait_recolte_litres"
                    defaultValue="0"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Observations / Comportement</label>
                <textarea
                  name="observations"
                  rows={2}
                  placeholder="Comportement vif, litière propre..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
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
                  className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer le relevé'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
