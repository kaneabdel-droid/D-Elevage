import Link from 'next/link'
import { ArrowLeft, ArrowRight, Bird, ShieldCheck, Activity, Scale, Sparkles } from 'lucide-react'
import LanguageSelector from '@/components/LanguageSelector'
import { getDictionary, getLocale } from '@/dictionaries'
import { loginDemo } from './actions'

export const metadata = {
  title: 'Démo en direct — D-ÉLEVAGE',
  description: 'Testez l’application de gestion d’élevage sans inscription ni mot de passe.',
}

export default async function DemoElevagePage({
  searchParams,
}: {
  searchParams?: Promise<{ demo_error?: string }>
}) {
  const locale = await getLocale()
  const params = await searchParams
  const demoError = params?.demo_error === '1'

  const fonctionnalitesDemo = [
    {
      icon: Bird,
      titre: 'Bandes Avicoles (Poussins)',
      desc: 'Suivi de la taille du lot, mortalité journalière, courbes de poids et calcul automatique de viabilité.',
    },
    {
      icon: Scale,
      titre: 'Cheptel Individuel (Bovins, Ovins)',
      desc: 'Identification par numéro de boucle, suivi généalogique, lactation et historique des pesées.',
    },
    {
      icon: ShieldCheck,
      titre: 'Sécurité Sanitaire & Latence',
      desc: 'Alertes de temps d’attente des médicaments et vaccins avec verrouillage automatique anti-vente.',
    },
    {
      icon: Activity,
      titre: 'Finances & Rentabilité',
      desc: 'Encaissement des ventes d’œufs, lait et viandes, suivi des charges d’aliments et marge nette par bande.',
    },
  ]

  return (
    <div className="bg-background min-h-screen font-sans text-foreground flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-surface-border bg-surface/80 backdrop-blur sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground-muted hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSelector currentLang={locale} />
            <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
              Connexion
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Demo */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-4 h-4" /> Démonstration interactive instantanée
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading tracking-tight mb-6">
          Découvrez <span className="text-primary">D-ÉLEVAGE</span> en direct
        </h1>
        <p className="text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Accédez en un seul clic à l’exploitation de démonstration pour explorer les fonctionnalités, saisir des pesées et tester les alertes sanitaires en conditions réelles.
        </p>

        {demoError && (
          <div className="mb-8 p-4 rounded-xl bg-danger/10 text-danger border border-danger/20 max-w-md mx-auto text-sm font-medium">
            Impossible d&apos;accéder automatiquement à la démo pour l&apos;instant. Veuillez vous connecter ou créer un compte d&apos;essai gratuit.
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <form action={loginDemo}>
            <button
              type="submit"
              className="px-8 py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/25 hover:bg-primary-hover hover:scale-105 transition-all flex items-center gap-3 cursor-pointer"
            >
              Accéder à la démo maintenant <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          <Link
            href="/tarifs"
            className="px-6 py-4 rounded-xl border border-surface-border bg-surface font-semibold text-foreground hover:border-primary transition-colors text-base"
          >
            Voir les forfaits & tarifs
          </Link>
        </div>

        <p className="text-xs text-foreground-muted mb-16">
          * Environnement bac à sable partagé. Aucune carte bancaire requise. Les données peuvent être réinitialisées périodiquement.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {fonctionnalitesDemo.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} className="p-6 rounded-2xl bg-surface border border-surface-border flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg mb-1">{f.titre}</h3>
                  <p className="text-sm text-foreground-muted leading-relaxed">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-surface py-8 text-center text-xs text-foreground-muted">
        <p>© {new Date().getFullYear()} D-ÉLEVAGE — Demba Solution. Tous droits réservés.</p>
      </footer>
    </div>
  )
}
