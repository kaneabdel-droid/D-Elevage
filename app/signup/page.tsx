import LanguageSelector from '@/components/LanguageSelector'
import ClientSignupForm from './ClientSignupForm'
import { getDictionary, getLocale } from '@/dictionaries'
import { pageSuivante } from '@/lib/suite'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Sprout, ShieldCheck } from 'lucide-react'

export default async function SignupPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ message?: string; plan?: string; next?: string; action?: string }> 
}) {
  const params = await searchParams
  const locale = await getLocale()
  const dict = await getDictionary(locale)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const rawPlan = params?.plan ?? 'medium'
  const plan = ['standard', 'medium', 'premium'].includes(rawPlan) ? rawPlan : 'medium'
  const next = pageSuivante(params?.next) ?? ''

  // Si l'utilisateur est déjà connecté et souhaite s'abonner, l'orienter directement vers le paiement
  if (user) {
    if (plan) {
      redirect(`/checkout?plan=${encodeURIComponent(plan)}`)
    }
    redirect('/abonnement')
  }

  return (
    <div className="flex min-h-screen flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-background relative">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector currentLang={locale} />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold font-heading text-primary">D-AGROFERME</span>
        </Link>
        <h1 className="text-3xl font-bold font-heading tracking-tight text-foreground sm:text-4xl">
          Inscription & Abonnement Exploitation
        </h1>
        <p className="mt-2 text-sm sm:text-base text-foreground-muted max-w-lg mx-auto">
          Identifiez votre exploitation agricole et votre responsable pour démarrer votre abonnement ou votre période d&apos;essai.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>14 jours d&apos;essai gratuit inclus • Sans engagement</span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {params?.message && (
          <div className="text-sm text-center bg-danger/10 text-danger border border-danger/20 p-3.5 rounded-xl mb-6">
            {params.message}
          </div>
        )}

        <div className="bg-surface border border-surface-border p-6 sm:p-8 rounded-3xl shadow-sm">
          <ClientSignupForm dict={dict} plan={plan} next={next} locale={locale} />
        </div>

        <p className="mt-8 text-center text-sm text-foreground-muted">
          {dict.auth?.signup?.has_account ?? 'Vous avez déjà un compte ?'}{' '}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : plan ? `/login?next=${encodeURIComponent(`/checkout?plan=${plan}`)}` : '/login'}
            className="font-semibold text-primary hover:text-primary-hover underline underline-offset-4"
          >
            {dict.auth?.signup?.login ?? 'Connectez-vous'}
          </Link>
        </p>
      </div>
    </div>
  )
}
