#!/usr/bin/env node
/**
 * Agent CLI d'importation de données existantes pour D-AGROFERME / D-ELEVAGE
 * 
 * Usage :
 *   node scripts/importer-donnees.mjs --entreprise="Ferme du Saloum" --type=bandes --fichier=./bandes.csv
 *   node scripts/importer-donnees.mjs --entreprise="Ferme du Saloum" --type=animaux --fichier=./animaux.csv
 *   node scripts/importer-donnees.mjs --entreprise="Ferme du Saloum" --type=parcelles --fichier=./parcelles.csv
 *   node scripts/importer-donnees.mjs --modele=bandes
 *   node scripts/importer-donnees.mjs --modele=animaux
 *   node scripts/importer-donnees.mjs --modele=parcelles
 *   node scripts/importer-donnees.mjs --modele=aliments
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, '..')

function chargerEnv() {
  const envPath = path.join(appRoot, '.env.local')
  if (fs.existsSync(envPath)) {
    const lignes = fs.readFileSync(envPath, 'utf8').split('\n')
    for (const ligne of lignes) {
      const idx = ligne.indexOf('=')
      if (idx > 0 && !ligne.trim().startsWith('#')) {
        const k = ligne.slice(0, idx).trim()
        const v = ligne.slice(idx + 1).trim()
        if (!process.env[k]) process.env[k] = v
      }
    }
  }
}
chargerEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Erreur : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const MODELES = {
  bandes: `code_bande;espece_code;effectif_initial;effectif_actuel;poids_moyen_kg;cout_achat_sujet;date_entree;statut
BND-VOL-2026-01;volaille_chair;1000;980;1.85;500;2026-03-01;en_cours
BND-PON-2026-02;volaille_ponte;500;495;1.60;2500;2026-01-15;en_cours
BND-PORC-2026-01;porcin;50;50;45.0;15000;2026-02-10;en_cours`,

  animaux: `numero_boucle;nom_ou_surnom;espece_code;sexe;date_naissance;date_entree;poids_actuel_kg;origine
SN-BOV-001;Reine Blanche;bovin_lait;F;2023-04-12;2024-01-10;420.5;ne_sur_ferme
SN-BOV-002;Taureau Goliath;bovin_viande;M;2022-09-05;2023-06-15;610.0;achat_marche
SN-OV-105;Ladoum Champion;ovin_caprin;M;2024-01-20;2024-02-01;85.0;ne_sur_ferme
SN-CAP-042;Chèvre Rousse;ovin_caprin;F;2023-11-10;2024-03-05;35.0;autre`,

  parcelles: `nom;surface_ha;type_culture;culture_actuelle;variete;date_semis;date_recolte_prevue;rendement_estime;systeme_irrigation
Parcelle Maraîchère Nord;2.5;maraichere;Oignon;Goudami;2026-01-15;2026-05-15;25.0;goutte_a_goutte
Parcelle Piment & Tomate;1.2;maraichere;Tomate;Mongal F1;2026-02-01;2026-06-10;18.0;goutte_a_goutte
Verger Manguiers & Agrumes;4.0;fruitiere;Mangue;Kent;2022-06-01;;30.0;goutte_a_goutte
Parcelle Fourrage Sud;3.0;fourragere;Luzerne & Maralfalfa;;2025-10-10;;40.0;aspersion`,

  aliments: `nom;type_aliment;quantite_kg;seuil_alerte_kg;prix_unitaire_kg
Aliment Démarrage Poussin;aliment;2500;300;320
Aliment Finition Poulet;aliment;4000;500;310
Aliment Concentré Vaches Laitières;aliment;1800;200;280
Foin de Luzerne / Maralfalfa;fourrage;5000;800;120
Complexe Vitaminique Avicole;veterinaire;80;10;4500`
}

function parserCSV(contenu) {
  const texte = contenu.replace(/^\uFEFF/, '').trim()
  if (!texte) return []
  const delim = texte.indexOf(';') !== -1 ? ';' : ','
  const lignes = texte.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lignes.length < 2) return []

  const enTetes = lignes[0].split(delim).map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase())
  const resultats = []

  for (let i = 1; i < lignes.length; i++) {
    const rawCols = lignes[i].split(delim)
    const obj = {}
    enTetes.forEach((h, idx) => {
      const val = (rawCols[idx] ?? '').trim().replace(/^["']|["']$/g, '')
      obj[h] = val
    })
    resultats.push(obj)
  }
  return resultats
}

const args = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const [k, v] = arg.replace(/^--/, '').split('=')
    return [k, v ?? true]
  })
)

if (args.modele) {
  const type = String(args.modele).toLowerCase()
  if (!MODELES[type]) {
    console.error(`Modèle inconnu "${type}". Disponibles : ${Object.keys(MODELES).join(', ')}`)
    process.exit(1)
  }
  const nomFichier = `modele_import_agroferme_${type}.csv`
  fs.writeFileSync(nomFichier, MODELES[type], 'utf8')
  console.log(`✓ Fichier modèle généré avec succès : ${nomFichier}`)
  process.exit(0)
}

async function executerImport() {
  const entrepriseCible = args.entreprise
  const type = (args.type || 'bandes').toLowerCase()
  const cheminFichier = args.fichier

  if (!entrepriseCible || !cheminFichier) {
    console.log(`
Agent CLI d'Importation — D-AGROFERME / D-ELEVAGE
------------------------------------------------
Usage :
  node scripts/importer-donnees.mjs --entreprise="<ID_OU_NOM>" --type=<bandes|animaux|parcelles|aliments> --fichier=<chemin.csv>
  node scripts/importer-donnees.mjs --modele=<bandes|animaux|parcelles|aliments>
    `)
    process.exit(1)
  }

  if (!fs.existsSync(cheminFichier)) {
    console.error(`Fichier introuvable : ${cheminFichier}`)
    process.exit(1)
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entrepriseCible)
  let requete = supabase.from('entreprises').select('id, nom')
  if (isUuid) {
    requete = requete.eq('id', entrepriseCible)
  } else {
    requete = requete.ilike('nom', `%${entrepriseCible}%`)
  }
  const { data: ents, error: errEnt } = await requete
  if (errEnt || !ents || ents.length === 0) {
    console.error(`Aucune exploitation/ferme trouvée pour "${entrepriseCible}"`)
    process.exit(1)
  }
  const ent = ents[0]

  console.log(`Ferme/Exploitation identifiée : ${ent.nom} (${ent.id})`)
  console.log(`Type d'import : ${type}`)

  const contenu = fs.readFileSync(cheminFichier, 'utf8')
  const records = cheminFichier.endsWith('.json') ? JSON.parse(contenu) : parserCSV(contenu)
  console.log(`Nombre de lignes détectées : ${records.length}`)

  let succes = 0
  let erreurs = 0

  if (type === 'bandes') {
    for (const item of records) {
      try {
        const codeBande = (item.code_bande || item.code || '').trim()
        if (!codeBande) {
          erreurs++
          continue
        }
        const especeCode = (item.espece_code || item.espece || 'volaille_chair').trim()
        const effectifInitial = parseInt(item.effectif_initial || item.effectif || '100', 10) || 100
        const effectifActuel = parseInt(item.effectif_actuel || item.effectif || String(effectifInitial), 10) || effectifInitial
        const dateEntree = item.date_entree || new Date().toISOString().split('T')[0]
        const poidsMoyenKg = parseFloat(String(item.poids_moyen_kg || item.poids || '0').replace(',', '.')) || null
        const coutAchatSujet = parseFloat(String(item.cout_achat_sujet || item.cout || '0').replace(',', '.')) || 0
        const statut = (item.statut || 'en_cours').trim()

        const { error } = await supabase.from('bandes').upsert({
          entreprise_id: ent.id,
          code_bande: codeBande,
          espece_code: especeCode,
          effectif_initial: effectifInitial,
          effectif_actuel: effectifActuel,
          poids_moyen_actuel_kg: poidsMoyenKg,
          cout_achat_sujet: coutAchatSujet,
          date_entree: dateEntree,
          statut: statut,
        }, { onConflict: 'entreprise_id, code_bande' })

        if (error) throw error
        succes++
      } catch (e) {
        console.error(`Erreur bande "${item.code_bande}" :`, e.message)
        erreurs++
      }
    }
  } else if (type === 'animaux') {
    for (const item of records) {
      try {
        const numeroBoucle = (item.numero_boucle || item.boucle || item.identification || '').trim()
        if (!numeroBoucle) {
          erreurs++
          continue
        }
        const nomOuSurnom = (item.nom_ou_surnom || item.nom || '').trim() || null
        const especeCode = (item.espece_code || item.espece || 'bovin_viande').trim()
        const sexe = (item.sexe || 'F').trim().toUpperCase() === 'M' ? 'M' : 'F'
        const dateNaissance = item.date_naissance || null
        const dateEntree = item.date_entree || new Date().toISOString().split('T')[0]
        const poidsActuelKg = parseFloat(String(item.poids_actuel_kg || item.poids || '0').replace(',', '.')) || null
        const origine = (item.origine || 'ne_sur_ferme').trim()

        const { error } = await supabase.from('animaux').upsert({
          entreprise_id: ent.id,
          numero_boucle: numeroBoucle,
          nom_ou_surnom: nomOuSurnom,
          espece_code: especeCode,
          sexe,
          date_naissance: dateNaissance,
          date_entree: dateEntree,
          poids_actuel_kg: poidsActuelKg,
          origine
        }, { onConflict: 'entreprise_id, numero_boucle' })

        if (error) throw error
        succes++
      } catch (e) {
        console.error(`Erreur animal "${item.numero_boucle}" :`, e.message)
        erreurs++
      }
    }
  } else if (type === 'parcelles') {
    for (const item of records) {
      try {
        const nom = (item.nom || item.parcelle || '').trim()
        if (!nom) {
          erreurs++
          continue
        }
        const surfaceHa = parseFloat(String(item.surface_ha || item.surface || '1').replace(',', '.')) || 1.0
        const typeCulture = (item.type_culture || 'maraichere').trim()
        const cultureActuelle = (item.culture_actuelle || item.culture || 'Culture maraîchère').trim()
        const variete = (item.variete || '').trim() || null
        const dateSemis = item.date_semis || null
        const dateRecoltePrevue = item.date_recolte_prevue || null
        const rendementEstime = parseFloat(String(item.rendement_estime || '0').replace(',', '.')) || null
        const systemeIrrigation = (item.systeme_irrigation || 'goutte_a_goutte').trim()

        const { error } = await supabase.from('parcelles_vegetales').insert({
          entreprise_id: ent.id,
          nom,
          surface_ha: surfaceHa,
          type_culture: typeCulture,
          culture_actuelle: cultureActuelle,
          variete,
          date_semis: dateSemis,
          date_recolte_prevue: dateRecoltePrevue,
          rendement_estime: rendementEstime,
          systeme_irrigation: systemeIrrigation,
          statut: 'en_culture'
        })

        if (error) throw error
        succes++
      } catch (e) {
        console.error(`Erreur parcelle "${item.nom}" :`, e.message)
        erreurs++
      }
    }
  } else if (type === 'aliments') {
    for (const item of records) {
      try {
        const nom = (item.nom || item.aliment || '').trim()
        if (!nom) {
          erreurs++
          continue
        }
        const typeAliment = (item.type_aliment || 'aliment').trim()
        const quantiteKg = parseFloat(String(item.quantite_kg || item.quantite || '0').replace(',', '.')) || 0
        const seuilAlerteKg = parseFloat(String(item.seuil_alerte_kg || '0').replace(',', '.')) || 0
        const prixUnitaireKg = parseFloat(String(item.prix_unitaire_kg || item.prix || '0').replace(',', '.')) || 0

        const { error } = await supabase.from('aliments_intrants').insert({
          entreprise_id: ent.id,
          nom,
          type_aliment: typeAliment,
          quantite_kg: quantiteKg,
          seuil_alerte_kg: seuilAlerteKg,
          prix_unitaire_kg: prixUnitaireKg
        })

        if (error) throw error
        succes++
      } catch (e) {
        console.error(`Erreur aliment/intrant "${item.nom}" :`, e.message)
        erreurs++
      }
    }
  }

  console.log(`\nImportation terminée pour ${ent.nom} :`)
  console.log(`✓ Lignes importées avec succès : ${succes}`)
  if (erreurs > 0) console.log(`✗ Échecs ou ignorées : ${erreurs}`)
}

executerImport()
