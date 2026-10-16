'use client'

import { useState } from 'react'
import { Eye, EyeOff, Building2, User, Phone, MapPin, CheckCircle2, Sparkles, Sprout, Bird, Beef, Milk } from 'lucide-react'
import { signup } from '@/app/signup/actions'
import { AUTRE_PAYS, PAYS, PAYS_PAR_DEFAUT } from '@/lib/pays'
import { FORFAITS_ELEVAGE, type TierElevage } from '@/lib/abonnements/tiers'

/** Pays triés selon leur nom dans la langue de l'interface */
function paysTries(locale: string) {
  let noms: Intl.DisplayNames | null = null
  try {
    noms = new Intl.DisplayNames([locale], { type: 'region' })
  } catch {}
  return PAYS.map((p) => ({ code: p.code, nom: noms?.of(p.code) ?? p.nom })).sort((a, b) => a.nom.localeCompare(b.nom, locale))
}

export default function ClientSignupForm({ 
  dict, 
  plan, 
  next, 
  locale 
}: { 
  dict: any
  plan: string
  next?: string
  locale: string 
}) {
  const initialPlan = (['standard', 'medium', 'premium'].includes(plan) ? plan : 'medium') as TierElevage
  const [selectedPlan, setSelectedPlan] = useState<TierElevage>(initialPlan)
  const [showPassword, setShowPassword] = useState(false)
  const [pays, setPays] = useState(PAYS_PAR_DEFAUT)

  // Activités cochées par défaut
  const [activites, setActivites] = useState<{ [key: string]: boolean }>({
    volaille: true,
    ruminants: true,
    lait: true,
    production_vegetale: initialPlan === 'premium',
  })

  const toggleActivite = (key: string) => {
    setActivites((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handlePlanChange = (newPlan: TierElevage) => {
    setSelectedPlan(newPlan)
    if (newPlan === 'premium') {
      setActivites((prev) => ({ ...prev, production_vegetale: true }))
    }
  }

  const champ = 'block w-full rounded-xl border border-surface-border bg-background py-2.5 px-3.5 text-foreground placeholder:text-foreground-muted/60 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm'

  return (
    <form className="space-y-8" action={signup}>
      <input type="hidden" name="plan" value={selectedPlan} />
      {next && <input type="hidden" name="next" value={next} />}

      {/* --- SÉLECTEUR DE FORFAIT D'ABONNEMENT --- */}
      <div>
        <label className="block text-sm font-bold text-foreground mb-3 flex items-center justify-between">
          <span>Formule d&apos;abonnement souhaitée</span>
          <span className="text-xs font-normal text-foreground-muted">Modifiable à tout moment</span>
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Standard */}
          <div
            onClick={() => handlePlanChange('standard')}
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative flex flex-col justify-between ${
              selectedPlan === 'standard'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-surface-border bg-background hover:border-surface-border/80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-foreground">Standard</span>
                {selectedPlan === 'standard' && <CheckCircle2 className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-xs text-foreground-muted mb-2">Atelier d&apos;élevage de base</p>
            </div>
            <div>
              <span className="text-lg font-extrabold text-foreground">5 000</span>
              <span className="text-[11px] text-foreground-muted"> FCFA/mois</span>
            </div>
          </div>

          {/* Médium */}
          <div
            onClick={() => handlePlanChange('medium')}
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative flex flex-col justify-between ${
              selectedPlan === 'medium'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-surface-border bg-background hover:border-surface-border/80'
            }`}
          >
            <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Recommandé
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-primary">Médium</span>
                {selectedPlan === 'medium' && <CheckCircle2 className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-xs text-foreground-muted mb-2">Ferme en développement</p>
            </div>
            <div>
              <span className="text-lg font-extrabold text-primary">10 000</span>
              <span className="text-[11px] text-foreground-muted"> FCFA/mois</span>
            </div>
          </div>

          {/* Prémium */}
          <div
            onClick={() => handlePlanChange('premium')}
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative flex flex-col justify-between ${
              selectedPlan === 'premium'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-surface-border bg-background hover:border-surface-border/80'
            }`}
          >
            <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-secondary/80 text-white text-[10px] font-bold uppercase tracking-wider">
              Agro-Pastoral
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-foreground">Prémium</span>
                {selectedPlan === 'premium' && <CheckCircle2 className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-xs text-foreground-muted mb-2">Élevage + Volet végétal</p>
            </div>
            <div>
              <span className="text-lg font-extrabold text-foreground">15 000</span>
              <span className="text-[11px] text-foreground-muted"> FCFA/mois</span>
            </div>
          </div>
        </div>

        <p className="mt-2 text-xs text-foreground-muted">
          Inclus dans <span className="font-semibold text-foreground">{FORFAITS_ELEVAGE[selectedPlan]?.nom}</span> : {FORFAITS_ELEVAGE[selectedPlan]?.description}.
        </p>
      </div>

      {/* --- SECTION 1 : IDENTIFICATION DE L'ENTREPRISE / EXPLOITATION --- */}
      <div className="pt-6 border-t border-surface-border space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">1. Identification de l&apos;Entreprise / Exploitation</h2>
            <p className="text-xs text-foreground-muted">Informations légales et géographiques de votre ferme</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="gie_nom" className="block text-xs font-semibold text-foreground mb-1.5">
              Nom de l&apos;exploitation / Entreprise agricole <span className="text-danger">*</span>
            </label>
            <input
              id="gie_nom"
              name="gie_nom"
              type="text"
              required
              placeholder="ex: Agroferme du Walo, Élevage Moderne Sahel..."
              className={champ}
            />
          </div>

          <div>
            <label htmlFor="pays" className="block text-xs font-semibold text-foreground mb-1.5">
              Pays d&apos;implantation <span className="text-danger">*</span>
            </label>
            <select
              id="pays"
              name="pays"
              value={pays}
              onChange={(e) => setPays(e.target.value)}
              className={champ}
            >
              {paysTries(locale).map((p) => (
                <option key={p.code} value={p.code}>{p.nom}</option>
              ))}
              <option value={AUTRE_PAYS}>{dict.auth?.signup?.other_country ?? 'Autre pays'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="adresse" className="block text-xs font-semibold text-foreground mb-1.5">
              Ville / Région de la ferme
            </label>
            <div className="relative">
              <input
                id="adresse"
                name="adresse"
                type="text"
                placeholder="ex: Saint-Louis, Thiès, Bamako..."
                className={champ}
              />
              <MapPin className="w-4 h-4 text-foreground-muted absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {pays === AUTRE_PAYS && (
          <div>
            <label htmlFor="pays_nom" className="block text-xs font-semibold text-foreground mb-1.5">
              Nom de votre pays <span className="text-danger">*</span>
            </label>
            <input
              id="pays_nom"
              name="pays_nom"
              type="text"
              required
              placeholder="ex: Canada, Suisse..."
              className={champ}
            />
            <p className="mt-1 text-xs text-foreground-muted">
              Hors des pays listés, l’abonnement se règle par carte bancaire en dollars US.
            </p>
          </div>
        )}

        {/* Filières / Activités de l'entreprise */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-foreground mb-2">
            Filières & Activités de l&apos;exploitation (sélectionnez vos filières actives) :
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              activites.volaille ? 'border-primary bg-primary/5' : 'border-surface-border bg-background'
            }`}>
              <input
                type="checkbox"
                name="types_activite"
                value="volaille"
                checked={activites.volaille}
                onChange={() => toggleActivite('volaille')}
                className="rounded border-surface-border text-primary focus:ring-primary w-4 h-4"
              />
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <Bird className="w-4 h-4 text-primary shrink-0" />
                <span>Aviculture (Chair, Ponte, Poussins)</span>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              activites.ruminants ? 'border-primary bg-primary/5' : 'border-surface-border bg-background'
            }`}>
              <input
                type="checkbox"
                name="types_activite"
                value="ruminants"
                checked={activites.ruminants}
                onChange={() => toggleActivite('ruminants')}
                className="rounded border-surface-border text-primary focus:ring-primary w-4 h-4"
              />
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <Beef className="w-4 h-4 text-primary shrink-0" />
                <span>Ruminants & Bovins (Engraissement & Viande)</span>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              activites.lait ? 'border-primary bg-primary/5' : 'border-surface-border bg-background'
            }`}>
              <input
                type="checkbox"
                name="types_activite"
                value="lait"
                checked={activites.lait}
                onChange={() => toggleActivite('lait')}
                className="rounded border-surface-border text-primary focus:ring-primary w-4 h-4"
              />
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <Milk className="w-4 h-4 text-primary shrink-0" />
                <span>Production Laitière & Traite</span>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              activites.production_vegetale ? 'border-primary bg-primary/5' : 'border-surface-border bg-background'
            }`}>
              <input
                type="checkbox"
                name="types_activite"
                value="production_vegetale"
                checked={activites.production_vegetale}
                onChange={() => toggleActivite('production_vegetale')}
                className="rounded border-surface-border text-primary focus:ring-primary w-4 h-4"
              />
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <Sprout className="w-4 h-4 text-primary shrink-0" />
                <span>Volet Végétal (Maraîchage, Fruits, Fourrages)</span>
              </div>
            </label>
          </div>
          <p className="mt-1.5 text-[11px] text-foreground-muted">
            Le système n&apos;affichera dans vos menus que les modules correspondant à vos filières sélectionnées.
          </p>
        </div>
      </div>

      {/* --- SECTION 2 : IDENTIFICATION DU RESPONSABLE (QUI PAIE) --- */}
      <div className="pt-6 border-t border-surface-border space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">2. Responsable & Contact Payeur (Qui paie)</h2>
            <p className="text-xs text-foreground-muted">
              Identité de la personne qui gère et souscrit l&apos;abonnement pour l&apos;exploitation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nom_complet" className="block text-xs font-semibold text-foreground mb-1.5">
              Nom et prénom du responsable / payeur <span className="text-danger">*</span>
            </label>
            <input
              id="nom_complet"
              name="nom_complet"
              type="text"
              required
              placeholder="ex: Amadou Sow"
              className={champ}
            />
          </div>

          <div>
            <label htmlFor="telephone" className="block text-xs font-semibold text-foreground mb-1.5">
              Numéro de téléphone / WhatsApp <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                id="telephone"
                name="telephone"
                type="tel"
                required
                placeholder="ex: +221 77 123 45 67"
                className={champ}
              />
              <Phone className="w-4 h-4 text-foreground-muted absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-foreground mb-1.5">
              Adresse e-mail professionnelle ou personnelle <span className="text-danger">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="ex: contact@agroferme.com"
              className={champ}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-foreground mb-1.5">
              Mot de passe sécurisé <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="Au moins 6 caractères"
                className={`${champ} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground-muted hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 text-xs text-foreground-muted space-y-1">
          <p className="font-medium text-foreground">
            ✓ Facturation & Paiements transparents
          </p>
          <p>
            Ces identifiants d&apos;exploitation et de contact permettent à notre équipe et au système d&apos;imputer correctement vos règlements (Wave, Orange Money, Carte ou Virement) au compte de votre entreprise.
          </p>
        </div>
      </div>

      {/* --- BOUTON DE SOUMISSION --- */}
      <div className="pt-2">
        <button
          type="submit"
          className="flex w-full justify-center items-center gap-2 rounded-xl bg-primary py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all hover:scale-[1.01]"
        >
          Valider l&apos;identification et démarrer mon essai gratuit
        </button>

        <p className="text-center text-[11px] text-foreground-muted mt-2.5">
          Aucun paiement préalable n&apos;est prélevé aujourd&apos;hui. Vous bénéficiez de 14 jours pour explorer toutes les fonctionnalités.
        </p>
      </div>
    </form>
  )
}
