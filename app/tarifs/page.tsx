import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import LanguageSelector from '@/components/LanguageSelector'
import { getDictionary, getLocale } from '@/dictionaries'
import { FORFAITS_ELEVAGE } from '@/lib/abonnements/tiers'

export const metadata = {
  title: 'Tarifs & Forfaits — D-ÉLEVAGE',
  description: 'Des forfaits d’abonnement simples et transparents pour exploitations d’élevage avicole, bovin, ovin et porcin.',
}

export default async function TarifsDelevagePage() {
  const locale = await getLocale()
  const dict = await getDictionary(locale)

  return (
    <div className="bg-background min-h-screen font-sans text-foreground">
      <main>
        <section className="py-16 lg:py-20 bg-gradient-to-br from-surface to-background relative border-b border-surface-border">
          <div className="absolute top-4 right-4">
            <LanguageSelector currentLang={locale} />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
            <Link href="/" className="text-sm font-medium text-foreground-muted hover:text-primary flex items-center justify-center gap-2 mb-6">
              <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold font-heading tracking-tight mb-6">
              Tarifs <span className="text-primary">D-ÉLEVAGE</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground-muted leading-relaxed">
              Des forfaits transparents adaptés à la taille et aux ambitions de votre ferme. Essai gratuit de 14 jours, sans engagement.
            </p>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Standard */}
              <div className="rounded-3xl border border-surface-border p-8 bg-surface flex flex-col hover:shadow-xl transition-shadow justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Standard</h3>
                  <p className="text-xs text-foreground-muted mb-4">{FORFAITS_ELEVAGE.standard.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold">{FORFAITS_ELEVAGE.standard.prixMensuelFcfa.toLocaleString('fr-FR')}</span>
                    <span className="text-foreground-muted font-medium"> FCFA / mois</span>
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
                <Link href="/checkout?plan=standard" className="w-full rounded-xl bg-background border-2 border-primary text-primary px-4 py-3 font-bold text-center hover:bg-primary hover:text-white transition-colors">
                  Choisir Standard
                </Link>
              </div>

              {/* Medium */}
              <div className="rounded-3xl border-2 border-primary p-8 bg-primary/5 flex flex-col relative transform md:-translate-y-4 shadow-2xl justify-between">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  Recommandé
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-primary">Médium</h3>
                  <p className="text-xs text-foreground-muted mb-4">{FORFAITS_ELEVAGE.medium.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-primary">{FORFAITS_ELEVAGE.medium.prixMensuelFcfa.toLocaleString('fr-FR')}</span>
                    <span className="text-foreground-muted font-medium"> FCFA / mois</span>
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
                <Link href="/checkout?plan=medium" className="w-full rounded-xl bg-primary text-white px-4 py-3 font-bold text-center hover:bg-primary-hover shadow-lg shadow-primary/30 transition-colors">
                  Choisir Médium
                </Link>
              </div>

              {/* Premium */}
              <div className="rounded-3xl border border-surface-border p-8 bg-surface flex flex-col hover:shadow-xl transition-shadow justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Prémium</h3>
                  <p className="text-xs text-foreground-muted mb-4">{FORFAITS_ELEVAGE.premium.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold">{FORFAITS_ELEVAGE.premium.prixMensuelFcfa.toLocaleString('fr-FR')}</span>
                    <span className="text-foreground-muted font-medium"> FCFA / mois</span>
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
                <Link href="/checkout?plan=premium" className="w-full rounded-xl bg-background border-2 border-primary text-primary px-4 py-3 font-bold text-center hover:bg-primary hover:text-white transition-colors">
                  Choisir Prémium
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-surface-border text-center text-sm text-foreground-muted">
          &copy; {new Date().getFullYear()} D-ÉLEVAGE — Demba Solution. Tous droits réservés.
        </footer>
      </main>
    </div>
  )
}
