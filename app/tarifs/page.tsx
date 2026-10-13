import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import LanguageSelector from '@/components/LanguageSelector'
import { getDictionary, getLocale } from '@/dictionaries'
import { FORFAITS_ELEVAGE } from '@/lib/abonnements/tiers'

import TarifsCards from './TarifsCards'

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
            <TarifsCards />
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
