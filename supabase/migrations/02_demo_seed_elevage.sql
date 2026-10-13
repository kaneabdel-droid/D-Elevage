-- =====================================================================
-- D-ELEVAGE : Migration 02 - Données de Démonstration & Tables Abonnements
-- =====================================================================

-- 1. Tables abonnements & Maketou
create table if not exists public.maketou_produits (
    montant integer primary key,
    product_id text not null,
    created_at timestamptz default now()
);

insert into public.maketou_produits (montant, product_id) values
(5000, 'prod_elevage_standard_mensuel'),
(10000, 'prod_elevage_medium_mensuel'),
(15000, 'prod_elevage_premium_mensuel'),
(50000, 'prod_elevage_standard_annuel'),
(100000, 'prod_elevage_medium_annuel'),
(150000, 'prod_elevage_premium_annuel')
on conflict (montant) do nothing;

create table if not exists public.tarif_abonnement (
    niveau text primary key,
    nom text not null,
    prix_mensuel numeric(12,2) not null,
    prix_annuel numeric(12,2) not null
);

insert into public.tarif_abonnement (niveau, nom, prix_mensuel, prix_annuel) values
('standard', 'Standard', 5000, 50000),
('medium', 'Médium', 10000, 100000),
('premium', 'Prémium', 15000, 150000)
on conflict (niveau) do update set
    prix_mensuel = excluded.prix_mensuel,
    prix_annuel = excluded.prix_annuel;

create table if not exists public.abonnement_paiements (
    id uuid primary key default gen_random_uuid(),
    gie_id uuid references public.entreprises(id) on delete cascade,
    entreprise_id uuid references public.entreprises(id) on delete cascade,
    niveau text not null,
    montant numeric(12,2) not null,
    devise text default 'XOF',
    provider text not null,
    provider_reference text,
    moyen_paiement text default 'wave',
    statut text default 'pending',
    doublon boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. Exploitation de Démonstration
insert into public.entreprises (id, nom, code_pays, devise, subscription_tier, essai_expire_le)
values ('00000000-0000-0000-0000-000000000001', 'Exploitation Démo Sahel (D-Élevage)', 'SN', 'FCFA', 'premium', now() + interval '365 days')
on conflict (id) do update set
    nom = excluded.nom,
    subscription_tier = 'premium',
    devise = 'FCFA';

-- 3. Bâtiments démo
insert into public.batiments (id, entreprise_id, nom, type_batiment, capacite_max) values
('b1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Poulailler Chair A1', 'poulailler', 2500),
('b1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Poulailler Ponte B2', 'poulailler', 1200),
('b1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Étable Laitière Sahel', 'etable', 30),
('b1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Bergerie Prestige (Ladoum)', 'bergerie', 60),
('b1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'Enclos Caprins & Ruminants', 'parc', 50)
on conflict (id) do nothing;

-- 4. Bandes démo
insert into public.bandes (id, entreprise_id, code_bande, espece_code, batiment_id, date_entree, effectif_initial, effectif_actuel, poids_moyen_actuel_kg, cout_achat_sujet, statut, notes) values
('b2000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'BND-2026-CHAIR-01', 'volaille_chair', 'b1000000-0000-0000-0000-000000000001', current_date - 28, 1500, 1472, 1.650, 550, 'en_cours', 'Cobb 500 certifié SEDIMA.'),
('b2000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'BND-2026-PONTE-02', 'volaille_ponte', 'b1000000-0000-0000-0000-000000000002', current_date - 65, 800, 792, 1.820, 600, 'en_cours', 'Isa Brown. Ponte quotidienne 710 œufs / jour.'),
('b2000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'BND-2026-CHAIR-02', 'volaille_chair', 'b1000000-0000-0000-0000-000000000001', current_date - 8, 2000, 1988, 0.220, 550, 'en_cours', 'Poussins Ross 308 d’un jour.')
on conflict (id) do nothing;

-- 5. Animaux individuels démo
insert into public.animaux (id, entreprise_id, numero_boucle, nom_ou_surnom, espece_code, batiment_id, sexe, date_naissance, date_entree, poids_actuel_kg, etat_sante, en_lactation, date_fin_latence) values
('a1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'SN-TH-2024-001', 'Fatou', 'bovin_lait', 'b1000000-0000-0000-0000-000000000003', 'F', '2022-03-12', '2022-03-12', 425, 'sain', true, null),
('a1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'SN-TH-2023-014', 'Diambar', 'bovin_viande', 'b1000000-0000-0000-0000-000000000003', 'M', '2021-01-15', '2021-01-15', 680, 'sain', false, null),
('a1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'SN-TH-2025-089', 'Awa', 'bovin_lait', 'b1000000-0000-0000-0000-000000000003', 'F', '2023-05-20', '2023-05-20', 395, 'en_latence', true, current_date + 3),
('a1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'SN-DK-2024-042', 'Sultan', 'ovin_caprin', 'b1000000-0000-0000-0000-000000000004', 'M', '2023-11-10', '2023-11-10', 118, 'sain', false, null),
('a1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'SN-DK-2025-019', 'Reine', 'ovin_caprin', 'b1000000-0000-0000-0000-000000000004', 'F', '2024-02-14', '2024-02-14', 78, 'sain', false, null),
('a1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'SN-TH-2025-104', 'Sahel Star', 'ovin_caprin', 'b1000000-0000-0000-0000-000000000005', 'F', '2024-04-05', '2024-04-05', 42, 'sain', false, null)
on conflict (id) do nothing;
