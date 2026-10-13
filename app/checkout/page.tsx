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

  // Visiteur sans compte : inscription d'abord, sans passer par le formulaire de paiement
  if (!user) {
    redirect(`/signup?plan=${encodeURIComponent(plan)}`)
  }

  let currentTier = 'standard'
  let enDollars = false
  if (user) {
    const { data: userData } = await supabase
      .from('utilisateurs')
      .select('entreprises(subscription_tier, devise), gies(subscription_tier, devise)')
      .eq('id', user.id)
      .single()

    const entreprise = Array.isArray(userData?.entreprises)
      ? userData.entreprises[0]
      : (userData?.entreprises || (Array.isArray(userData?.gies) ? userData.gies[0] : userData?.gies))

    if (entreprise) {
      currentTier = entreprise.subscription_tier || 'standard'
      enDollars = entreprise.devise === 'AUCUNE' || entreprise.devise === 'USD'
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
      dict={dict}
      locale={locale}
    />
  )
}
