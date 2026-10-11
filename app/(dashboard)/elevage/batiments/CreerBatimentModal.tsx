'use client'

import { useState } from 'react'
import { Plus, X, Warehouse } from 'lucide-react'
import { creerBatiment } from './actions'

export default function CreerBatimentModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const res = await creerBatiment(formData)

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
        <Plus className="w-4 h-4" /> Nouvel Enclos / Bâtiment
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 text-foreground-muted hover:text-foreground rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Warehouse className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading text-foreground">Ajouter un Bâtiment / Enclos</h3>
                <p className="text-xs text-foreground-muted">Poulailler, étable, bergerie, porcherie ou parc</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Nom / Désignation *</label>
                <input
                  type="text"
                  name="nom"
                  required
                  placeholder="ex: Poulailler N°1 (Chair)"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Type de Structure</label>
                <select
                  name="type_batiment"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="poulailler">Poulailler (Avicole)</option>
                  <option value="etable">Étable (Bovins)</option>
                  <option value="bergerie">Bergerie (Ovins / Caprins)</option>
                  <option value="porcherie">Porcherie (Porcins)</option>
                  <option value="parc">Parc ouvert / Enclos de pâturage</option>
                  <option value="quarantaine">Local de Quarantaine / Infirmerie</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Capacité Maximale (Têtes / Sujets)</label>
                <input
                  type="number"
                  name="capacite_max"
                  defaultValue="1000"
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
                  className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer le bâtiment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
