'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { pageSuivante, suitePaiement } from '@/lib/suite'
import { AUTRE_PAYS, PAYS_PAR_DEFAUT, trouverPays } from '@/lib/pays'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const rawPlan = (formData.get('plan') as string) || 'medium'
  const plan = ['standard', 'medium', 'premium'].includes(rawPlan) ? rawPlan : 'medium'

  // Identité de l'exploitation / entreprise
  const gieNom = ((formData.get('gie_nom') as string) || (formData.get('nom_exploitation') as string) || '').trim()
  const nomComplet = ((formData.get('nom_complet') as string) || '').trim()
  const telephone = ((formData.get('telephone') as string) || '').trim()
  const adresse = ((formData.get('adresse') as string) || '').trim()

  // Types d'activités (volaille, ruminants, lait, production_vegetale)
  const typesActiviteRaw = formData.getAll('types_activite') as string[]
  const typesActivite = typesActiviteRaw.length > 0 
    ? typesActiviteRaw 
    : ['volaille', 'ruminants', 'lait', 'production_vegetale']

  // Page suite (redirection vers paiement ou dashboard)
  const suite = pageSuivante(formData.get('next')) ?? suitePaiement(plan)

  // Validation pays
  const codePays = (formData.get('pays') as string) || PAYS_PAR_DEFAUT
  const pays = trouverPays(codePays)
  const paysNom = ((formData.get('pays_nom') as string) || '').trim()

  if (!gieNom) {
    return redirect('/signup?message=' + encodeURIComponent("Veuillez indiquer le nom de votre exploitation ou entreprise"))
  }

  if (!nomComplet) {
    return redirect('/signup?message=' + encodeURIComponent("Veuillez indiquer le nom du responsable ou gestionnaire"))
  }

  if (!telephone) {
    return redirect('/signup?message=' + encodeURIComponent("Veuillez indiquer un numéro de téléphone ou WhatsApp pour le suivi"))
  }

  if (!pays && codePays !== AUTRE_PAYS) {
    return redirect('/signup?message=' + encodeURIComponent('Pays invalide'))
  }
  if (codePays === AUTRE_PAYS && !paysNom) {
    return redirect('/signup?message=' + encodeURIComponent('Indiquez le nom de votre pays') + (suite ? '&next=' + encodeURIComponent(suite) : ''))
  }

  const email = (formData.get('email') as string || '').trim().toLowerCase()
  const password = formData.get('password') as string

  const deviseCalculée = pays ? pays.devise : (codePays === AUTRE_PAYS ? 'USD' : 'FCFA')

  const data = {
    email,
    password,
    options: {
      data: {
        gie_nom: gieNom,
        nom_entreprise: gieNom,
        nom_complet: nomComplet,
        telephone,
        adresse,
        plan,
        pays: codePays,
        pays_nom: pays ? pays.nom : paysNom,
        devise: deviseCalculée,
        types_activite: typesActivite,
      },
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(suite ?? '/login')}`,
    }
  }

  const { data: inscription, error } = await supabase.auth.signUp(data)

  if (error) {
    return redirect('/signup?message=' + encodeURIComponent(error.message))
  }

  // Provisioning direct via le client admin pour garantir que l'entreprise et l'utilisateur
  // existent en base même si le trigger SQL n'a pas encore tourné ou avant la confirmation email
  if (inscription?.user) {
    try {
      const admin = createAdminClient()
      
      // 1. Chercher si une entreprise existe déjà avec cet email
      const { data: existingEnt } = await admin
        .from('entreprises')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      let entrepriseId: string | null = existingEnt?.id ?? null

      if (existingEnt) {
        await admin.from('entreprises').update({
          nom: gieNom,
          code_pays: codePays,
          telephone,
          adresse,
          devise: deviseCalculée,
          subscription_tier: plan,
          types_activite: typesActivite,
          updated_at: new Date().toISOString(),
        }).eq('id', existingEnt.id)
      } else {
        const { data: newEnt, error: insertEntError } = await admin
          .from('entreprises')
          .insert({
            nom: gieNom,
            code_pays: codePays,
            telephone,
            email,
            adresse,
            devise: deviseCalculée,
            subscription_tier: plan,
            types_activite: typesActivite,
            essai_expire_le: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select('id')
          .single()

        if (!insertEntError && newEnt) {
          entrepriseId = newEnt.id
        }
      }

      if (entrepriseId) {
        await admin.from('utilisateurs').upsert({
          id: inscription.user.id,
          entreprise_id: entrepriseId,
          nom_complet: nomComplet,
          role: 'admin',
          permissions: { production: 'write', sanitaire: 'write', stocks: 'write', finances: 'write' },
          actif: true,
        })
      }
    } catch (provisionErr) {
      console.warn('Note: Auto-provisioning admin fallback:', provisionErr)
    }
  }

  // Confirmation d'email désactivée : session ouverte, redirection directe vers le paiement ou dashboard
  if (inscription.session && suite) {
    return redirect(suite)
  }

  // Sinon, on invite à confirmer par email pour finaliser l'abonnement
  const message = suite
    ? "Compte d'exploitation créé avec succès ! Vérifiez votre boîte mail : le lien de confirmation vous mènera directement au paiement sécurisé de votre abonnement."
    : "Compte d'exploitation créé avec succès ! Un lien de confirmation a été envoyé à votre adresse e-mail. Cliquez sur ce lien pour vous connecter."
  return redirect('/login?message=' + encodeURIComponent(message) + (suite ? '&next=' + encodeURIComponent(suite) : ''))
}
