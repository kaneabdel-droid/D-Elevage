import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getTenantContext } from '@/utils/supabase/tenant'
import ParametresForm from './ParametresForm'

export default async function ParametresPage() {
  const tenant = await getTenantContext()
  if (!tenant) redirect('/login')

  const supabase = await createClient()

  const { data: entreprise } = await supabase
    .from('entreprises')
    .select('nom, adresse, telephone, email, devise')
    .eq('id', tenant.entrepriseId)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Paramètres de l'Exploitation</h1>
        <p className="text-sm text-foreground-muted mt-1">
          Configurez l'identité de votre ferme, vos contacts et vos préférences d'affichage.
        </p>
      </div>

      <ParametresForm
        entreprise={{
          nom: entreprise?.nom ?? '',
          adresse: entreprise?.adresse ?? '',
          telephone: entreprise?.telephone ?? '',
          email: entreprise?.email ?? '',
          devise: entreprise?.devise ?? 'FCFA',
        }}
      />
    </div>
  )
}
