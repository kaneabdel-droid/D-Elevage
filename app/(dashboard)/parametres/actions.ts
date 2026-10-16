'use server'

import { createClient } from '@/utils/supabase/server'
import { getTenantContext } from '@/utils/supabase/tenant'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function mettreAJourParametres(formData: FormData) {
  const tenant = await getTenantContext()
  if (!tenant) return { error: 'Non authentifié' }

  const supabase = await createClient()

  const nom = (formData.get('nom') as string || '').trim()
  const telephone = (formData.get('telephone') as string || '').trim()
  const email = (formData.get('email') as string || '').trim()
  const adresse = (formData.get('adresse') as string || '').trim()
  const devise = (formData.get('devise') as string || 'FCFA').trim()

  if (!nom) {
    return { error: 'Le nom de l’exploitation est obligatoire' }
  }

  // Types d'activités sélectionnés
  const typesActivite = formData.getAll('types_activite') as string[]
  const finalTypes = typesActivite.length > 0 ? typesActivite : ['volaille']

  // Disposition du menu (sidebar ou horizontal)
  const menuLayout = (formData.get('menu_layout') as string) || 'sidebar'
  if (menuLayout === 'horizontal' || menuLayout === 'sidebar') {
    const cookieStore = await cookies()
    cookieStore.set('menu_layout', menuLayout, {
      path: '/',
      maxAge: 31536000, // 1 an
    })
  }

  try {
    const { error } = await supabase
      .from('entreprises')
      .update({
        nom,
        telephone,
        email,
        adresse,
        devise,
        types_activite: finalTypes,
        updated_at: new Date().toISOString()
      })
      .eq('id', tenant.entrepriseId)

    if (error) {
      console.warn('Erreur mise à jour entreprises DB:', error.message)
    }
  } catch (err: any) {
    console.warn('Exception mise à jour entreprises:', err?.message)
  }

  revalidatePath('/', 'layout')
  revalidatePath('/parametres')
  revalidatePath('/dashboard')
  return { success: true }
}
