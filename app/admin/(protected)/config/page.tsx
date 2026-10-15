import { CheckCircle2, XCircle } from 'lucide-react'
import { createAdminClient } from '@/utils/supabase/admin'
import { hasBictorysKeys, hasMonerooKeys, hasChariowKeys, hasMaketouKeys } from '@/lib/payments/config'
import ChariowProduitsEditor from './ChariowProduitsEditor'
import MaketouProduitsEditor from './MaketouProduitsEditor'

export default async function AdminConfigPage() {
  const supabase = createAdminClient()

  const [
    { data: chariowData },
    { data: maketouData },
    { data: tarifsData }
  ] = await Promise.all([
    supabase.from('chariow_produits').select('montant, product_id').order('montant'),
    supabase.from('maketou_produits').select('montant, product_id').order('montant'),
    supabase.from('tarif_abonnement').select('niveau, prix_annuel, prix_mensuel').order('prix_annuel'),
  ])

  const prestataires = [
    { nom: 'Maketou (Mobile Money - Prioritaire)', ok: hasMaketouKeys },
    { nom: 'Chariow (Mobile Money - Réserve)', ok: hasChariowKeys },
    { nom: 'Bictorys (Wave, Orange Money)', ok: hasBictorysKeys },
    { nom: 'Moneroo (Carte bancaire)', ok: hasMonerooKeys },
  ]

  const configs = [
    {
      label: 'Supabase URL',
      valide: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      valeur: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configuré' : 'Manquant',
    },
    {
      label: 'Supabase Service Role Key',
      valide: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      valeur: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configuré (Secret)' : 'Manquant',
    },
    {
      label: 'Identité Partagée SuperAdmin (SSO)',
      valide: !!process.env.ADMIN_IDENTITY_SUPABASE_URL,
      valeur: process.env.ADMIN_IDENTITY_SUPABASE_URL ? 'Actif (.dembasolution.com)' : 'Manquant',
    },
    {
      label: 'Maketou API Key (Paiement Mobile Prioritaire)',
      valide: !!process.env.MAKETOU_API_KEY && !process.env.MAKETOU_API_KEY.includes('TEST_API_KEY'),
      valeur: process.env.MAKETOU_API_KEY ? 'Clé de production configurée' : 'Non configuré',
    },
    {
      label: 'Chariow API Key (Paiement de Réserve)',
      valide: !!process.env.CHARIOW_API_KEY,
      valeur: process.env.CHARIOW_API_KEY ? 'Clé de secours configurée' : 'Non configuré',
    },
    {
      label: 'Resend API Key (Emails transactionnels)',
      valide: !!process.env.RESEND_API_KEY,
      valeur: process.env.RESEND_API_KEY ? 'Configuré' : 'Non configuré',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading mb-2">Configuration Plateforme & Intégrations</h1>
        <p className="text-sm text-foreground-muted">
          Paramètres techniques, passerelles de paiement mobile et identifiants des produits facturés.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intégrations Plateforme */}
        <div className="bg-background rounded-xl border border-surface-border p-6">
          <h2 className="font-semibold text-lg mb-4 font-heading">Services & Infrastructure</h2>
          <div className="space-y-3">
            {configs.map(({ label, valide, valeur }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-foreground-muted">{valeur}</p>
                </div>
                <div>
                  {valide ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-success">
                      <CheckCircle2 className="w-4 h-4" /> Actif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-danger">
                      <XCircle className="w-4 h-4" /> Incomplet
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prestataires de paiement */}
        <div className="bg-background rounded-xl border border-surface-border p-6">
          <h2 className="font-semibold text-lg mb-2 font-heading">Passerelles de Paiement</h2>
          <p className="text-xs text-foreground-muted mb-4">
            État de détection des clés secrètes serveur pour les paiements d&apos;abonnements en ligne.
          </p>
          <ul className="space-y-3">
            {prestataires.map((p) => (
              <li key={p.nom} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                <span className="text-sm font-medium text-foreground">{p.nom}</span>
                {p.ok ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-success">
                    <CheckCircle2 className="w-4 h-4" /> Configuré
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-foreground-muted">
                    <XCircle className="w-4 h-4" /> Non configuré
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Configuration Produits Maketou */}
      <div className="bg-background rounded-xl p-6 border border-surface-border">
        <h2 className="text-lg font-semibold font-heading mb-4">Produits Maketou (Mobile Money Prioritaire)</h2>
        <MaketouProduitsEditor produits={maketouData ?? []} tarifs={tarifsData ?? []} />
      </div>

      {/* Configuration Produits Chariow */}
      <div className="bg-background rounded-xl p-6 border border-surface-border">
        <h2 className="text-lg font-semibold font-heading mb-4">Produits Chariow (Mobile Money Réserve)</h2>
        <ChariowProduitsEditor produits={chariowData ?? []} tarifs={tarifsData ?? []} />
      </div>
    </div>
  )
}
