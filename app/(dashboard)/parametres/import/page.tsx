import React from 'react'
import type { Metadata } from 'next'
import { AssistantImport, type TypeImportOption } from '@/components/import/AssistantImport'
import { importerDonneesElevage } from './actions'

export const metadata: Metadata = {
  title: 'Importer des données existantes — D-AGROFERME',
}

const OPTIONS_ELEVAGE: TypeImportOption[] = [
  {
    id: 'bandes',
    titre: 'Bandes & Volailles / Porcs',
    description: 'Lots d’animaux (poulets de chair, pondeuses, porcs), effectifs et poids',
    icone: 'bandes',
    nomFichierModele: 'modele_import_bandes.csv',
    modeleCSV: `code_bande;espece_code;effectif_initial;effectif_actuel;poids_moyen_kg;cout_achat_sujet;date_entree;statut
BND-VOL-2026-01;volaille_chair;1000;980;1.85;500;2026-03-01;en_cours
BND-PON-2026-02;volaille_ponte;500;495;1.60;2500;2026-01-15;en_cours
BND-PORC-2026-01;porcin;50;50;45.0;15000;2026-02-10;en_cours`
  },
  {
    id: 'animaux',
    titre: 'Animaux individuels (Bovins / Ovins)',
    description: 'Cheptel identifié par boucle, race/espèce, sexe, date de naissance et poids',
    icone: 'animaux',
    nomFichierModele: 'modele_import_animaux.csv',
    modeleCSV: `numero_boucle;nom_ou_surnom;espece_code;sexe;date_naissance;date_entree;poids_actuel_kg;origine
SN-BOV-001;Reine Blanche;bovin_lait;F;2023-04-12;2024-01-10;420.5;ne_sur_ferme
SN-BOV-002;Taureau Goliath;bovin_viande;M;2022-09-05;2023-06-15;610.0;achat_marche
SN-OV-105;Ladoum Champion;ovin_caprin;M;2024-01-20;2024-02-01;85.0;ne_sur_ferme
SN-CAP-042;Chèvre Rousse;ovin_caprin;F;2023-11-10;2024-03-05;35.0;autre`
  },
  {
    id: 'parcelles',
    titre: 'Parcelles & Cultures végétales',
    description: 'Maraîchage, arboriculture fruitière, fourrages, surfaces, dates et rendements',
    icone: 'parcelles',
    nomFichierModele: 'modele_import_parcelles_vegetales.csv',
    modeleCSV: `nom;surface_ha;type_culture;culture_actuelle;variete;date_semis;date_recolte_prevue;rendement_estime;systeme_irrigation
Parcelle Maraîchère Nord;2.5;maraichere;Oignon;Goudami;2026-01-15;2026-05-15;25.0;goutte_a_goutte
Parcelle Piment & Tomate;1.2;maraichere;Tomate;Mongal F1;2026-02-01;2026-06-10;18.0;goutte_a_goutte
Verger Manguiers & Agrumes;4.0;fruitiere;Mangue;Kent;2022-06-01;;30.0;goutte_a_goutte
Parcelle Fourrage Sud;3.0;fourragere;Luzerne & Maralfalfa;;2025-10-10;;40.0;aspersion`
  },
  {
    id: 'aliments',
    titre: 'Aliments & Intrants d’élevage',
    description: 'Stocks d’aliments, fourrages, compléments et produits vétérinaires',
    icone: 'aliments',
    nomFichierModele: 'modele_import_aliments_stocks.csv',
    modeleCSV: `nom;type_aliment;quantite_kg;seuil_alerte_kg;prix_unitaire_kg
Aliment Démarrage Poussin;aliment;2500;300;320
Aliment Finition Poulet;aliment;4000;500;310
Aliment Concentré Vaches Laitières;aliment;1800;200;280
Foin de Luzerne / Maralfalfa;fourrage;5000;800;120
Complexe Vitaminique Avicole;veterinaire;80;10;4500`
  }
]

export default function PageImportElevage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AssistantImport
        nomApplication="D-AGROFERME"
        titreModule="Assistant d'Importation de Données Existantes"
        optionsTypes={OPTIONS_ELEVAGE}
        onImporter={importerDonneesElevage}
      />
    </div>
  )
}
