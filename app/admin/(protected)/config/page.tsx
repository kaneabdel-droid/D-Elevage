import { CheckCircle2, XCircle } from 'lucide-react'

export default function AdminConfigPage() {
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
    <div>
      <h1 className="text-2xl font-bold font-heading mb-6">Configuration Plateforme & Intégrations</h1>

      <div className="bg-background rounded-xl border border-surface-border p-6 max-w-2xl">
        <div className="space-y-4">
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
    </div>
  )
}
