'use client'

import { useState } from 'react'
import { mettreAJourParametres } from './actions'
import { 
  Settings, 
  CheckCircle2, 
  Bird, 
  Beef, 
  Milk, 
  Sprout, 
  Layout, 
  Sidebar as SidebarIcon,
  Crown
} from 'lucide-react'

export default function ParametresForm({
  entreprise,
  menuLayout = 'sidebar',
  subscriptionTier = 'standard',
  dict
}: {
  entreprise: {
    nom: string
    telephone: string
    email: string
    adresse: string
    devise: string
    typesActivite: string[]
  }
  menuLayout?: 'sidebar' | 'horizontal'
  subscriptionTier?: string
  dict: any
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedLayout, setSelectedLayout] = useState<'sidebar' | 'horizontal'>(menuLayout)

  const isPremium = subscriptionTier === 'premium'

  const activitesList = [
    {
      id: 'volaille',
      nom: dict.parametres?.act_volaille || 'Aviculture / Volailles',
      desc: dict.parametres?.act_volaille_desc || 'Poulets de chair, poules pondeuses, canards, pintades',
      icon: Bird,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'ruminants',
      nom: dict.parametres?.act_ruminants || 'Élevage de Ruminants',
      desc: dict.parametres?.act_ruminants_desc || 'Bovins viande, ovins (Ladoum, etc.), caprins, boucles',
      icon: Beef,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'lait',
      nom: dict.parametres?.act_lait || 'Production Laitière',
      desc: dict.parametres?.act_lait_desc || 'Traites quotidiennes, vaches laitières, collecte et livraison de lait',
      icon: Milk,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'production_vegetale',
      nom: dict.parametres?.act_vegetal || 'Production Végétale',
      desc: dict.parametres?.act_vegetal_desc || 'Cultures maraîchères, fruitières, fourragères, récoltes et stocks',
      icon: Sprout,
      color: 'text-green-600 bg-green-500/10 border-green-500/20',
      isPremiumOnly: true
    },
  ]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    formData.set('menu_layout', selectedLayout)

    const res = await mettreAJourParametres(formData)

    setLoading(false)
    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      // Recharger pour appliquer immédiatement la disposition du menu si changée
      setTimeout(() => {
        window.location.reload()
      }, 700)
    }
  }

  return (
    <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-surface-border shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-border">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-heading text-foreground">
            {dict.parametres?.general_title || "Paramétrage de l'Exploitation"}
          </h2>
          <p className="text-xs text-foreground-muted">
            {dict.parametres?.general_subtitle || "Identité de la ferme, filières actives et mode d'affichage de la navigation"}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" /> 
          <span>{dict.parametres?.success || 'Paramètres mis à jour avec succès. Actualisation de l’affichage...'}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1 : Types d'activité */}
        <div>
          <div className="mb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sprout className="w-4 h-4 text-primary" />
              {dict.parametres?.activities_title || "Types d'activité de l'exploitation"}
            </h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              {dict.parametres?.activities_desc || "Le système masque automatiquement les modules non pertinents pour votre exploitation."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {activitesList.map((act) => {
              const defaultChecked = entreprise.typesActivite?.includes(act.id)
              const Icon = act.icon

              return (
                <label
                  key={act.id}
                  className={`relative flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    act.color
                  } hover:shadow-xs`}
                >
                  <input
                    type="checkbox"
                    name="types_activite"
                    value={act.id}
                    defaultChecked={defaultChecked}
                    className="mt-1 h-4 w-4 rounded border-surface-border text-primary focus:ring-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Icon className="w-4 h-4" />
                        {act.nom}
                      </span>
                      {act.isPremiumOnly && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Crown className="w-3 h-3" /> Formule Premium
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground-muted mt-0.5 leading-relaxed">
                      {act.desc}
                    </p>
                    {act.isPremiumOnly && !isPremium && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                        (Actif uniquement avec la formule Prémium)
                      </p>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* Section 2 : Disposition du menu */}
        <div>
          <div className="mb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layout className="w-4 h-4 text-primary" />
              {dict.parametres?.menu_layout_title || "Disposition du menu de navigation"}
            </h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              {dict.parametres?.menu_layout_desc || "Choisissez le format de navigation adapté à votre écran (comme sur D-Scholar et D-Pharma)."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedLayout('sidebar')}
              className={`p-4 rounded-xl border text-start flex items-start gap-3 transition-all ${
                selectedLayout === 'sidebar'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                  : 'border-surface-border bg-background hover:bg-surface'
              }`}
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                <SidebarIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Menu Latéral (Sidebar classique)</p>
                <p className="text-xs text-foreground-muted mt-0.5 leading-relaxed">
                  Barre de navigation verticale fixe sur la gauche de l’écran.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedLayout('horizontal')}
              className={`p-4 rounded-xl border text-start flex items-start gap-3 transition-all ${
                selectedLayout === 'horizontal'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                  : 'border-surface-border bg-background hover:bg-surface'
              }`}
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                <Layout className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Menu Horizontal (Barre supérieure)</p>
                <p className="text-xs text-foreground-muted mt-0.5 leading-relaxed">
                  Barre d'onglets compacte en haut avec sous-menus déroulants par catégorie.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Section 3 : Coordonnées de l'exploitation */}
        <div className="pt-6 border-t border-surface-border space-y-4">
          <h3 className="text-sm font-bold text-foreground">
            {dict.parametres?.farm_info_title || "Coordonnées de l'Exploitation"}
          </h3>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {dict.parametres?.nom || "Nom de l'Agroferme / Exploitation"} *
            </label>
            <input
              type="text"
              name="nom"
              defaultValue={entreprise.nom}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {dict.parametres?.telephone || "Téléphone de Contact"}
              </label>
              <input
                type="tel"
                name="telephone"
                defaultValue={entreprise.telephone}
                placeholder="+221 77 000 00 00"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {dict.parametres?.email || "Adresse Email"}
              </label>
              <input
                type="email"
                name="email"
                defaultValue={entreprise.email}
                placeholder="ferme@example.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {dict.parametres?.adresse || "Localisation / Adresse de la Ferme"}
            </label>
            <input
              type="text"
              name="adresse"
              defaultValue={entreprise.adresse}
              placeholder="Région, Ville, Commune ou Village"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {dict.parametres?.devise || "Devise Monétaire Principale"}
            </label>
            <select
              name="devise"
              defaultValue={entreprise.devise}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <optgroup label="Afrique de l'Ouest & Centrale">
                <option value="FCFA">FCFA (Franc CFA - UEMOA / CEMAC)</option>
                <option value="GNF">GNF (Franc Guinéen)</option>
                <option value="NGN">NGN (Naira Nigérian)</option>
                <option value="GHS">GHS (Cedi Ghanéen)</option>
              </optgroup>
              <optgroup label="Afrique du Nord & Maghreb">
                <option value="MAD">MAD (Dirham Marocain)</option>
                <option value="MRU">MRU (Ouguiya Mauritanien)</option>
                <option value="DZD">DZD (Dinar Algérien)</option>
                <option value="TND">TND (Dinar Tunisien)</option>
                <option value="EGP">EGP (Livre Égyptienne)</option>
              </optgroup>
              <optgroup label="Arabie & Moyen-Orient">
                <option value="SAR">SAR (Riyal Saoudien)</option>
                <option value="AED">AED (Dirham des Émirats)</option>
                <option value="QAR">QAR (Riyal Qatari)</option>
                <option value="KWD">KWD (Dinar Koweïtien)</option>
              </optgroup>
              <optgroup label="Asie du Sud">
                <option value="INR">INR (Roupie Indienne)</option>
                <option value="PKR">PKR (Roupie Pakistanaise)</option>
                <option value="BDT">BDT (Taka Bangladais)</option>
              </optgroup>
              <optgroup label="International">
                <option value="USD">USD ($ Dollar US)</option>
                <option value="EUR">EUR (€ Euro)</option>
                <option value="AUCUNE">Sans unité (autre devise)</option>
              </optgroup>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-surface-border flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-sm disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading 
              ? (dict.parametres?.saving || 'Enregistrement...') 
              : (dict.parametres?.save || 'Enregistrer les paramètres')
            }
          </button>
        </div>
      </form>
    </div>
  )
}
