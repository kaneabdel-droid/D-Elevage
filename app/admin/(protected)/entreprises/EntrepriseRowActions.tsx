'use client'

import { useState, useTransition } from 'react'
import { changerForfait, prolongerEssai, verrouillerCompte, deverrouillerCompte } from './actions'

export default function EntrepriseRowActions({
  entrepriseId,
  tier,
  isVerrouille
}: {
  entrepriseId: string
  tier: string
  isVerrouille: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  const handleForfait = (newTier: string) => {
    startTransition(async () => {
      const res = await changerForfait(entrepriseId, newTier)
      if (res.error) setMsg(res.error)
      else setMsg('Forfait mis à jour')
    })
  }

  const handleProlonger = (jours: number) => {
    startTransition(async () => {
      const res = await prolongerEssai(entrepriseId, jours)
      if (res.error) setMsg(res.error)
      else setMsg(`Essai prolongé de ${jours}j`)
    })
  }

  const handleVerrouillage = () => {
    startTransition(async () => {
      const res = isVerrouille 
        ? await deverrouillerCompte(entrepriseId) 
        : await verrouillerCompte(entrepriseId)
      if (res.error) setMsg(res.error)
      else setMsg(isVerrouille ? 'Déverrouillé' : 'Verrouillé')
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={tier}
        disabled={isPending}
        onChange={(e) => handleForfait(e.target.value)}
        className="text-xs bg-surface border border-surface-border rounded px-2 py-1"
      >
        <option value="standard">Standard</option>
        <option value="medium">Medium</option>
        <option value="premium">Premium</option>
      </select>

      <button
        onClick={() => handleProlonger(14)}
        disabled={isPending}
        className="text-xs bg-surface border border-surface-border px-2 py-1 rounded hover:bg-surface-border"
        title="Prolonger l'essai de 14 jours"
      >
        +14j
      </button>

      <button
        onClick={handleVerrouillage}
        disabled={isPending}
        className={`text-xs px-2 py-1 rounded font-medium ${
          isVerrouille ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'
        }`}
      >
        {isVerrouille ? 'Déverrouiller' : 'Verrouiller'}
      </button>

      {msg && <span className="text-[11px] text-foreground-muted">{msg}</span>}
    </div>
  )
}
