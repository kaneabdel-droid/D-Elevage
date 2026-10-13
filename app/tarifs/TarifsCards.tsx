'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { FORFAITS_ELEVAGE } from '@/lib/abonnements/tiers'

export default function TarifsCards() {
  const [periode, setPeriode] = useState<'annuel' | 'mensuel'>('annuel')

  return (
    <div className="space-y-12">
      {/* Toggle Annuel / Mensuel */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-surface border border-surface-border shadow-sm">
          <button
            type="button"
            onClick={() => setPeriode('annuel')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              periode === 'annuel'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Facturation Annuelle
            <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
              periode === 'annuel' ? 'bg-white/20 text-white' : 'bg-success/15 text-success'
            }`}>
              2 mois offerts
            </span>
          </button>
          <button
            type="button"
            onClick={() => setPeriode('mensuel')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              periode === 'mensuel'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Facturation Mensuelle
          </button>
        </div>
      </div>

      {/* Grille des 3 forfaits */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        {/* Standard */}
        <div className="rounded-3xl border border-surface-border p-8 bg-surface flex flex-col hover:shadow-xl transition-shadow justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Standard</h3>
            <p className="text-xs text-foreground-muted mb-6 leading-relaxed">
              {FORFAITS_ELEVAGE.standard.description}
            </p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-foreground">
                {periode === 'annuel'
                  ? FORFAITS_ELEVAGE.standard.prixAnnuelFcfa.toLocaleString('fr-FR').replace(/\s/g, '.')
                  : FORFAITS_ELEVAGE.standard.prixMensuelFcfa.toLocaleString('fr-FR').replace(/\s/g, '.')}
              </span>
              <span className="text-foreground-muted font-medium text-sm">
                {' '}FCFA / {periode === 'annuel' ? 'an' : 'mois'}
              </span>
              {periode === 'annuel' && (
                <p className="text-xs text-success font-semibold mt-1.5">
                  Soit {(FORFAITS_ELEVAGE.standard.prixAnnuelFcfa / 12).toFixed(0)} FCFA / mois
                </p>
              )}
            </div>
            <ul className="space-y-3 mb-8">
              {FORFAITS_ELEVAGE.standard.modulesInclus.map((m, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground-muted">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href={`/checkout?plan=standard&periode=${periode}`}
            className="w-full rounded-xl bg-background border-2 border-primary text-primary px-4 py-3 font-bold text-center hover:bg-primary hover:text-white transition-colors"
          >
            Choisir Standard
          </Link>
        </div>

        {/* Medium (Recommandé) */}
        <div className="rounded-3xl border-2 border-primary p-8 bg-primary/5 flex flex-col relative transform md:-translate-y-4 shadow-2xl justify-between">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-md shadow-primary/30">
            <Sparkles className="w-3.5 h-3.5" /> Recommandé
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2 text-primary">Médium</h3>
            <p className="text-xs text-foreground-muted mb-6 leading-relaxed">
              {FORFAITS_ELEVAGE.medium.description}
            </p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-primary">
                {periode === 'annuel'
                  ? FORFAITS_ELEVAGE.medium.prixAnnuelFcfa.toLocaleString('fr-FR').replace(/\s/g, '.')
                  : FORFAITS_ELEVAGE.medium.prixMensuelFcfa.toLocaleString('fr-FR').replace(/\s/g, '.')}
              </span>
              <span className="text-foreground-muted font-medium text-sm">
                {' '}FCFA / {periode === 'annuel' ? 'an' : 'mois'}
              </span>
              {periode === 'annuel' && (
                <p className="text-xs text-success font-semibold mt-1.5">
                  Soit {(FORFAITS_ELEVAGE.medium.prixAnnuelFcfa / 12).toFixed(0)} FCFA / mois (20 000 FCFA économisés)
                </p>
              )}
            </div>
            <ul className="space-y-3 mb-8">
              {FORFAITS_ELEVAGE.medium.modulesInclus.map((m, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground-muted">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href={`/checkout?plan=medium&periode=${periode}`}
            className="w-full rounded-xl bg-primary text-white px-4 py-3.5 font-bold text-center hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all hover:scale-[1.02]"
          >
            Choisir Médium
          </Link>
        </div>

        {/* Premium */}
        <div className="rounded-3xl border border-surface-border p-8 bg-surface flex flex-col hover:shadow-xl transition-shadow justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Prémium</h3>
            <p className="text-xs text-foreground-muted mb-6 leading-relaxed">
              {FORFAITS_ELEVAGE.premium.description}
            </p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-foreground">
                {periode === 'annuel'
                  ? FORFAITS_ELEVAGE.premium.prixAnnuelFcfa.toLocaleString('fr-FR').replace(/\s/g, '.')
                  : FORFAITS_ELEVAGE.premium.prixMensuelFcfa.toLocaleString('fr-FR').replace(/\s/g, '.')}
              </span>
              <span className="text-foreground-muted font-medium text-sm">
                {' '}FCFA / {periode === 'annuel' ? 'an' : 'mois'}
              </span>
              {periode === 'annuel' && (
                <p className="text-xs text-success font-semibold mt-1.5">
                  Soit {(FORFAITS_ELEVAGE.premium.prixAnnuelFcfa / 12).toFixed(0)} FCFA / mois (30 000 FCFA économisés)
                </p>
              )}
            </div>
            <ul className="space-y-3 mb-8">
              {FORFAITS_ELEVAGE.premium.modulesInclus.map((m, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground-muted">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href={`/checkout?plan=premium&periode=${periode}`}
            className="w-full rounded-xl bg-background border-2 border-primary text-primary px-4 py-3 font-bold text-center hover:bg-primary hover:text-white transition-colors"
          >
            Choisir Prémium
          </Link>
        </div>
      </div>
    </div>
  )
}
