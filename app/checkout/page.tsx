import { createClient } from '@/utils/supabase/server'
import CheckoutClient from './CheckoutClient'
import { redirect } from 'next/navigation'
import { hasBictorysKeys, hasMonerooKeys, hasChariowKeys, hasMaketouKeys } from '@/lib/payments/config'
import { getDictionary, getLocale } from '@/dictionaries'

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; upgrade?: string; period?: string; periode?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams
  const locale = await getLocale()
  const dict = await getDictionary(locale)
  
  const plan = params.plan || 'medium'
  const isUpgrade = params.upgrade === 'true'
  const initialPeriod = (params.period === 'mensuel' || params.periode === 'mensuel') ? 'mensuel' : 'annuel'

  if (isUpgrade && !user) {
    redirect('/login')
  }

  // Visiteur sans compte : inscription d'abord avec identification de l'entreprise
  if (!user) {
    redirect(`/signup?plan=${encodeURIComponent(plan)}`)
  }

  let currentTier = 'standard'
  let enDollars = false
  let entrepriseInfo = {
    nom: 'Mon Exploitation',
    responsable: '',
    telephone: '',
    email: user?.email || '',
    code_pays: 'SN',
    adresse: '',
    devise: 'FCFA',
  }

  if (user) {
    const { data: userData } = await supabase
      .from('utilisateurs')
      .select('nom_complet, entreprises(id, nom, code_pays, devise, telephone, email, adresse, subscription_tier), gies(id, nom, code_pays, devise, telephone, email, adresse, subscription_tier)')
      .eq('id', user.id)
      .maybeSingle()

    const entreprise = Array.isArray(userData?.entreprises)
      ? userData.entreprises[0]
      : (userData?.entreprises || (Array.isArray(userData?.gies) ? userData.gies[0] : userData?.gies))

    if (entreprise) {
      currentTier = entreprise.subscription_tier || 'standard'
      enDollars = entreprise.devise === 'AUCUNE' || entreprise.devise === 'USD'
      entrepriseInfo = {
        nom: entreprise.nom || (user.user_metadata?.gie_nom as string) || 'Mon Exploitation',
        responsable: userData?.nom_complet || (user.user_metadata?.nom_complet as string) || '',
        telephone: entreprise.telephone || (user.user_metadata?.telephone as string) || '',
        email: entreprise.email || user.email || '',
        code_pays: entreprise.code_pays || (user.user_metadata?.pays as string) || 'SN',
        adresse: entreprise.adresse || (user.user_metadata?.adresse as string) || '',
        devise: entreprise.devise || (user.user_metadata?.devise as string) || 'FCFA',
      }
    } else {
      // Fallback sur métadonnées auth
      entrepriseInfo = {
        nom: (user.user_metadata?.gie_nom as string) || (user.user_metadata?.nom_entreprise as string) || 'Mon Exploitation',
        responsable: (user.user_metadata?.nom_complet as string) || '',
        telephone: (user.user_metadata?.telephone as string) || '',
        email: user.email || '',
        code_pays: (user.user_metadata?.pays as string) || 'SN',
        adresse: (user.user_metadata?.adresse as string) || '',
        devise: (user.user_metadata?.devise as string) || 'FCFA',
      }
    }
  }

  return (
    <CheckoutClient
      initialPlan={plan}
      initialPeriod={initialPeriod}
      isLoggedIn={!!user}
      currentTier={currentTier}
      isUpgrade={isUpgrade}
      enDollars={enDollars}
      hasOnlinePayment={{ mobileMoney: hasBictorysKeys, carte: hasMonerooKeys, chariow: hasChariowKeys, maketou: hasMaketouKeys }}
      entrepriseInfo={entrepriseInfo}
      dict={dict}
      locale={locale}
    />
  )
}
