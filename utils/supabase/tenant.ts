import { cache } from 'react'
import { createClient } from './server'

export type PermissionMap = Record<string, string>

export type TenantContext = {
  userId: string
  entrepriseId: string
  role: string
  permissions: PermissionMap | null
  entrepriseNom: string
  subscriptionTier: string
  devise: string
}

export const getTenantContext = cache(async (): Promise<TenantContext | null> => {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('utilisateurs')
    .select('entreprise_id, role, permissions, entreprises(nom, subscription_tier, devise)')
    .eq('id', user.id)
    .single()

  if (!data) return null

  const entreprise = Array.isArray(data.entreprises) ? data.entreprises[0] : data.entreprises

  return {
    userId: user.id,
    entrepriseId: data.entreprise_id,
    role: data.role,
    permissions: (data.permissions as PermissionMap | null) ?? null,
    entrepriseNom: entreprise?.nom || 'Mon Élevage',
    subscriptionTier: entreprise?.subscription_tier || 'standard',
    devise: entreprise?.devise || 'FCFA',
  }
})
