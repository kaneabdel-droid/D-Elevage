import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getTenantContext } from '@/utils/supabase/tenant'
import { getDictionary, getLocale } from '@/dictionaries'
import Link from 'next/link'
import { 
  Sprout, 
  Crown, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Wheat, 
  Apple, 
  Store,
  Layers,
  ShieldCheck
} from 'lucide-react'
import VegetalClient from './VegetalClient'
import { 
  DEMO_PARCELLES, 
  DEMO_RECOLTES, 
  DEMO_STOCKS_VEGETAUX, 
  DEMO_VENTES_VEGETALES 
} from '@/lib/demo-data'

export const metadata = {
  title: 'Volet Végétal — D-Agroferme',
  description: 'Gestion des cultures maraîchères, fruitières, fourragères, suivi des récoltes, stocks et ventes végétales.',
}

export default async function VegetalPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const tenant = await getTenantContext()
  if (!tenant) redirect('/login')

  const params = await searchParams
  const activeTab = params?.tab || 'parcelles'

  const locale = await getLocale()
  const dict = await getDictionary(locale)
  const isPremium = tenant.subscriptionTier === 'premium'

  // Si l'exploitation n'est pas en formule Premium, on affiche la présentation de déblocage Premium
  if (!isPremium) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto py-4">
        {/* En-tête avec badge lock */}
        <div className="bg-gradient-to-br from-amber-500/10 via-surface to-background border border-amber-500/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold w-fit border border-amber-500/30 mb-6">
            <Crown className="w-4 h-4" />
            <span>Exclusivité Formule Prémium</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-foreground max-w-2xl">
            Débloquez le <span className="text-primary">Volet Végétal</span> & la Synergie Agro-Pastorale
          </h1>

          <p className="mt-4 text-base sm:text-lg text-foreground-muted max-w-2xl leading-relaxed">
            Passez à la gestion intégrée : suivez vos productions maraîchères, fruitières et fourragères, 
            contrôlez vos récoltes, vos stocks de semences et récoltes, et alimentez votre cheptel en circuit court.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/abonnement"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Passer à la Formule Prémium (15 000 FCFA/mois)</span>
              <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
            </Link>

            <Link
              href="/dashboard"
              className="px-5 py-3.5 rounded-xl border border-surface-border text-foreground text-sm font-semibold hover:bg-surface transition-colors"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>

        {/* Grille des fonctionnalités exclusives */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface border border-surface-border shadow-xs">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 w-fit mb-4">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Cultures & Variétés</h3>
            <p className="mt-2 text-xs text-foreground-muted leading-relaxed">
              Suivi parcellaire haute précision : maraîchage (tomate, oignon, piment), arboriculture fruitière (mangue, papaye, agrumes), et cultures céréalières.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surface-border shadow-xs">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit mb-4">
              <Wheat className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Fourrage & Autoconsommation</h3>
            <p className="mt-2 text-xs text-foreground-muted leading-relaxed">
              Production de luzerne, maralfalfa et maïs fourrager. Nourrissez directement votre cheptel laitier et d’engraissement en maîtrisant vos coûts d’aliment.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surface-border shadow-xs">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit mb-4">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Stocks & Ventes Végétales</h3>
            <p className="mt-2 text-xs text-foreground-muted leading-relaxed">
              Enregistrement des récoltes par qualité (1er choix, 2ème choix), gestion des stocks au magasin et émission de factures/reçus de vente.
            </p>
          </div>
        </div>

        {/* Aperçu en direct des données démo */}
        <div className="p-6 rounded-2xl bg-surface/50 border border-surface-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Aperçu des parcelles configurées en formule Prémium
            </h4>
            <span className="text-xs text-foreground-muted">Mode démonstration</span>
          </div>

          <div className="divide-y divide-surface-border text-xs">
            {DEMO_PARCELLES.slice(0, 3).map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{p.nom}</p>
                  <p className="text-foreground-muted">{p.culture_actuelle} • Variété {p.variete} ({p.surface_ha} ha)</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {p.statut.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Utilisateur Prémium : chargement des données depuis Supabase ou fallback démo
  const supabase = await createClient()

  let parcelles = []
  let recoltes = []
  let stocks = []
  let ventes = []

  try {
    const [pRes, rRes, sRes, vRes] = await Promise.all([
      supabase.from('parcelles_vegetales').select('*').order('created_at', { ascending: false }),
      supabase.from('recoltes_vegetales').select('*, parcelles_vegetales(nom)').order('date_recolte', { ascending: false }),
      supabase.from('stocks_vegetaux').select('*').order('date_derniere_entree', { ascending: false }),
      supabase.from('ventes_vegetales').select('*').order('date_vente', { ascending: false }),
    ])

    parcelles = pRes.data && pRes.data.length > 0 ? pRes.data : DEMO_PARCELLES
    recoltes = rRes.data && rRes.data.length > 0 ? rRes.data : DEMO_RECOLTES
    stocks = sRes.data && sRes.data.length > 0 ? sRes.data : DEMO_STOCKS_VEGETAUX
    ventes = vRes.data && vRes.data.length > 0 ? vRes.data : DEMO_VENTES_VEGETALES
  } catch (err) {
    parcelles = DEMO_PARCELLES
    recoltes = DEMO_RECOLTES
    stocks = DEMO_STOCKS_VEGETAUX
    ventes = DEMO_VENTES_VEGETALES
  }

  return (
    <VegetalClient
      initialTab={activeTab}
      parcelles={parcelles}
      recoltes={recoltes}
      stocks={stocks}
      ventes={ventes}
      devise={tenant.devise}
      dict={dict}
      locale={locale}
    />
  )
}
