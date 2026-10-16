'use server'

import { createClient } from '@/utils/supabase/server'
import { getDictionary } from '@/dictionaries'
import { transfererAuSupport, SUJET_MAX, MESSAGE_MAX } from '@/lib/support/transferer'

export async function sendMessage(formData: FormData) {
  const dict = await getDictionary()
  const errors = dict.support?.form?.errors || {
    required: 'Veuillez remplir tous les champs.',
    too_long: 'Le sujet ou le message est trop long.',
    not_authenticated: 'Votre session a expiré. Veuillez vous reconnecter.',
    failed: 'Le message n’a pas pu être envoyé.',
  }

  const sujet = String(formData.get('sujet') || '').trim()
  const message = String(formData.get('message') || '').trim()

  if (!sujet || !message) {
    return { error: errors.required }
  }
  if (sujet.length > SUJET_MAX || message.length > MESSAGE_MAX) {
    return { error: errors.too_long }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    return { error: errors.not_authenticated }
  }

  let entrepriseId: string | null = null
  let entrepriseNom = 'Exploitation D-Agroferme'

  try {
    const { data: profil } = await supabase
      .from('utilisateurs')
      .select('entreprise_id, entreprises(nom)')
      .eq('id', user.id)
      .maybeSingle()

    if (profil?.entreprise_id) {
      entrepriseId = profil.entreprise_id
      const ent = profil.entreprises as unknown as { nom: string } | null
      if (ent?.nom) entrepriseNom = ent.nom
    }
  } catch (err) {
    console.warn('Erreur lecture profil utilisateur support:', err)
  }

  // Fallback si non trouvé
  if (!entrepriseId) {
    try {
      const { data: ent } = await supabase
        .from('entreprises')
        .select('id, nom')
        .eq('email', user.email)
        .maybeSingle()

      if (ent?.id) {
        entrepriseId = ent.id
        entrepriseNom = ent.nom || entrepriseNom
      }
    } catch {}
  }

  if (!entrepriseId) {
    entrepriseId = '00000000-0000-0000-0000-000000000001'
  }

  const emailEnvoye = await transfererAuSupport({
    produit: 'D-AGROFERME',
    email: user.email,
    organisation: entrepriseNom,
    sujet,
    message,
  })

  try {
    const { error: insertError } = await supabase.from('support_messages').insert({
      entreprise_id: entrepriseId,
      user_id: user.id,
      email: user.email,
      sujet,
      message,
      email_envoye: emailEnvoye,
    })

    if (insertError) {
      console.warn('Enregistrement message support DB échoué:', insertError.message)
    }
  } catch (err) {
    console.warn('Exception insert support_messages:', err)
  }

  return { success: true }
}
