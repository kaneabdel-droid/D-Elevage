import { redirect } from 'next/navigation'
import { getTenantContext, ACTIVITES_PAR_DEFAUT } from '@/utils/supabase/tenant'
import ClientLayout from './ClientLayout'
import { getDictionary, getLocale } from '@/dictionaries'
import { cookies } from 'next/headers'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tenant = await getTenantContext()

  if (!tenant) {
    redirect('/login')
  }

  const locale = await getLocale()
  const dict = await getDictionary(locale)
  const cookieStore = await cookies()
  const menuLayout = (cookieStore.get('menu_layout')?.value === 'horizontal' ? 'horizontal' : 'sidebar') as 'sidebar' | 'horizontal'

  return (
    <ClientLayout
      subscriptionTier={tenant.subscriptionTier}
      role={tenant.role}
      permissions={tenant.permissions}
      entrepriseNom={tenant.entrepriseNom}
      devise={tenant.devise}
      typesActivite={tenant.typesActivite || ACTIVITES_PAR_DEFAUT}
      menuLayout={menuLayout}
      dict={dict}
      locale={locale}
    >
      {children}
    </ClientLayout>
  )
}
