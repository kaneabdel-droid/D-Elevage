import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getTenantContext, ACTIVITES_PAR_DEFAUT } from '@/utils/supabase/tenant'
import { getDictionary, getLocale } from '@/dictionaries'
import { cookies } from 'next/headers'
import ParametresForm from './ParametresForm'

export default async function ParametresPage() {
  const tenant = await getTenantContext()
  if (!tenant) redirect('/login')

  const locale = await getLocale()
  const dict = await getDictionary(locale)
  const cookieStore = await cookies()
  const menuLayout = (cookieStore.get('menu_layout')?.value === 'horizontal' ? 'horizontal' : 'sidebar') as 'sidebar' | 'horizontal'

  const supabase = await createClient()

  let entreprise: any = null
  try {
    const { data } = await supabase
      .from('entreprises')
      .select('nom, adresse, telephone, email, devise, types_activite')
      .eq('id', tenant.entrepriseId)
      .maybeSingle()
    entreprise = data
  } catch {}

  const typesActivite = Array.isArray(entreprise?.types_activite) && entreprise.types_activite.length > 0
    ? entreprise.types_activite
    : tenant.typesActivite || ACTIVITES_PAR_DEFAUT

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">
          {dict.parametres?.title || "Paramètres de l'Exploitation"}
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          {dict.parametres?.desc || "Configurez l'identité de votre ferme, vos types d'activité, votre devise et vos préférences de navigation."}
        </p>
      </div>

      <ParametresForm
        entreprise={{
          nom: entreprise?.nom ?? tenant.entrepriseNom ?? '',
          adresse: entreprise?.adresse ?? '',
          telephone: entreprise?.telephone ?? '',
          email: entreprise?.email ?? '',
          devise: entreprise?.devise ?? tenant.devise ?? 'FCFA',
          typesActivite,
        }}
        menuLayout={menuLayout}
        subscriptionTier={tenant.subscriptionTier}
        dict={dict}
      />
    </div>
  )
}
