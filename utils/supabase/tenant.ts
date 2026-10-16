import { cache } from 'react'
import { createClient } from './server'
import { isAdminEmail } from '@/lib/admin/auth'

export type PermissionMap = Record<string, string>

export const ACTIVITES_PAR_DEFAUT = ['volaille', 'ruminants', 'lait', 'production_vegetale']

export type TenantContext = {
  userId: string
  entrepriseId: string
  role: string
  permissions: PermissionMap | null
  entrepriseNom: string
  subscriptionTier: string
  devise: string
  typesActivite: string[]
}

export const getTenantContext = cache(async (): Promise<TenantContext | null> => {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let data: any = null
  try {
    const res = await supabase
      .from('utilisateurs')
      .select('entreprise_id, role, permissions, entreprises(nom, subscription_tier, devise, types_activite)')
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
          .select('id, nom, subscription_tier, devise, types_activite')
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
            typesActivite: Array.isArray(ent.types_activite) && ent.types_activite.length > 0 ? ent.types_activite : ACTIVITES_PAR_DEFAUT,
          }
        }
      } catch {}

      return {
        userId: user.id,
        entrepriseId: '00000000-0000-0000-0000-000000000001',
        role: 'admin',
        permissions: { production: 'write', sanitaire: 'write', stocks: 'write', finances: 'write' },
        entrepriseNom: 'Exploitation Démo Sahel (D-Agroferme)',
        subscriptionTier: 'premium',
        devise: 'FCFA',
        typesActivite: ACTIVITES_PAR_DEFAUT,
      }
    }

    const demoEmail = process.env.DEMO_ELEVAGE_EMAIL || 'kaneabdou@yahoo.fr'
    if (user.email === demoEmail || user.email?.includes('demo') || user.email === 'kaneabdou@yahoo.fr') {
      return {
        userId: user.id,
        entrepriseId: '00000000-0000-0000-0000-000000000001',
        role: 'admin',
        permissions: { production: 'write', sanitaire: 'write', stocks: 'write', finances: 'write' },
        entrepriseNom: 'Exploitation Démo Sahel (D-Agroferme)',
        subscriptionTier: 'premium',
        devise: 'FCFA',
        typesActivite: ACTIVITES_PAR_DEFAUT,
      }
    }

    // Si l'utilisateur est authentifié mais n'a pas encore de ligne utilisateurs,
    // vérifier s'il existe une entreprise liée à son email dans entreprises
    try {
      const { data: entByEmail } = await supabase
        .from('entreprises')
        .select('id, nom, subscription_tier, devise, types_activite')
        .eq('email', user.email)
        .maybeSingle()

      if (entByEmail) {
        return {
          userId: user.id,
          entrepriseId: entByEmail.id,
          role: 'admin',
          permissions: { production: 'write', sanitaire: 'write', stocks: 'write', finances: 'write' },
          entrepriseNom: entByEmail.nom || 'Mon Agroferme',
          subscriptionTier: entByEmail.subscription_tier || 'standard',
          devise: entByEmail.devise || 'FCFA',
          typesActivite: Array.isArray(entByEmail.types_activite) && entByEmail.types_activite.length > 0 ? entByEmail.types_activite : ACTIVITES_PAR_DEFAUT,
        }
      }
    } catch {}

    return null
  }

  const entreprise = Array.isArray(data.entreprises) ? data.entreprises[0] : data.entreprises
  const typesActivite = Array.isArray(entreprise?.types_activite) && entreprise.types_activite.length > 0 
    ? entreprise.types_activite 
    : ACTIVITES_PAR_DEFAUT

  return {
    userId: user.id,
    entrepriseId: data.entreprise_id,
    role: data.role,
    permissions: (data.permissions as PermissionMap | null) ?? null,
    entrepriseNom: entreprise?.nom || 'Mon Agroferme',
    subscriptionTier: entreprise?.subscription_tier || 'standard',
    devise: entreprise?.devise || 'FCFA',
    typesActivite,
  }
})
