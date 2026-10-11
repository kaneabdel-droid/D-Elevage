'use client'

import { useState } from 'react'
import { mettreAJourParametres } from './actions'
import { Settings, CheckCircle2 } from 'lucide-react'

export default function ParametresForm({
  entreprise
}: {
  entreprise: {
    nom: string
    telephone: string
    email: string
    adresse: string
    devise: string
  }
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const res = await mettreAJourParametres(formData)

    setLoading(false)
    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-surface-border shadow-sm max-w-2xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-border">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-heading text-foreground">Informations Générales de l'Exploitation</h2>
          <p className="text-xs text-foreground-muted">Coordonnées utilisées sur les factures et reçus de vente</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> Paramètres mis à jour avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Nom de la Ferme / Exploitation *</label>
          <input
            type="text"
            name="nom"
            defaultValue={entreprise.nom}
            required
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Téléphone de Contact</label>
            <input
              type="tel"
              name="telephone"
              defaultValue={entreprise.telephone}
              placeholder="+221 77 000 00 00"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Adresse Email</label>
            <input
              type="email"
              name="email"
              defaultValue={entreprise.email}
              placeholder="ferme@example.com"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Localisation / Adresse de la Ferme</label>
          <input
            type="text"
            name="adresse"
            defaultValue={entreprise.adresse}
            placeholder="Région, Ville, Commune ou Village"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Devise Monétaire Principale</label>
          <select
            name="devise"
            defaultValue={entreprise.devise}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="FCFA">FCFA (Franc CFA - UEMOA / CEMAC)</option>
            <option value="GNF">GNF (Franc Guinéen)</option>
            <option value="USD">USD ($ Dollar US)</option>
            <option value="EUR">EUR (€ Euro)</option>
          </select>
        </div>

        <div className="pt-4 border-t border-surface-border flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-sm disabled:opacity-50 transition-all"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}
