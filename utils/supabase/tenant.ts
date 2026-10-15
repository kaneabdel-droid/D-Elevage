import { cache } from 'react'
import { createClient } from './server'
import { isAdminEmail } from '@/lib/admin/auth'

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

  let data: any = null
  try {
    const res = await supabase
      .from('utilisateurs')
      .select('entreprise_id, role, permissions, entreprises(nom, subscription_tier, devise)')
      .eq('id', user.id)
      .maybeSingle()
    data = res.data
  } catch {
    data = null
  }

  if (!data) {
    // Si c'est un SuperAdmin, on lui donne accès complet au dashboard avec la première exploitation existante ou la démo
    if (isAdminEmail(user.email)) {
      try {
        const { data: ent } = await supabase
          .from('entreprises')
          .select('id, nom, subscription_tier, devise')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (ent) {
          return {
            userId: user.id,
            entrepriseId: ent.id,
            role: 'admin',
            permissions: { production: 'write', sanitaire: 'write', stocks: 'write', finances: 'write' },
            entrepriseNom: ent.nom || 'Exploitation Principale',
            subscriptionTier: ent.subscription_tier || 'premium',
            devise: ent.devise || 'FCFA',
          }
        }
      } catch {}

      return {
        userId: user.id,
        entrepriseId: '00000000-0000-0000-0000-000000000001',
        role: 'admin',
        permissions: { production: 'write', sanitaire: 'write', stocks: 'write', finances: 'write' },
        entrepriseNom: 'Exploitation Démo Sahel (D-Élevage)',
        subscriptionTier: 'premium',
        devise: 'FCFA',
      }
    }

    const demoEmail = process.env.DEMO_ELEVAGE_EMAIL || 'kaneabdou@yahoo.fr'
    if (user.email === demoEmail || user.email?.includes('demo') || user.email === 'kaneabdou@yahoo.fr') {
      return {
        userId: user.id,
        entrepriseId: '00000000-0000-0000-0000-000000000001',
        role: 'admin',
        permissions: { production: 'write', sanitaire: 'write', stocks: 'write', finances: 'write' },
        entrepriseNom: 'Exploitation Démo Sahel (D-Élevage)',
        subscriptionTier: 'premium',
        devise: 'FCFA',
      }
    }

    // Si l'utilisateur est authentifié mais n'a pas encore de ligne utilisateurs (ex: nouvelle inscription récente),
    // vérifier s'il existe une entreprise liée à son email dans entreprises
    try {
      const { data: entByEmail } = await supabase
        .from('entreprises')
        .select('id, nom, subscription_tier, devise')
        .eq('email', user.email)
        .maybeSingle()

      if (entByEmail) {
        return {
          userId: user.id,
          entrepriseId: entByEmail.id,
          role: 'admin',
          permissions: { production: 'write', sanitaire: 'write', stocks: 'write', finances: 'write' },
          entrepriseNom: entByEmail.nom || 'Mon Élevage',
          subscriptionTier: entByEmail.subscription_tier || 'standard',
          devise: entByEmail.devise || 'FCFA',
        }
      }
    } catch {}

    return null
  }

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
