-- =====================================================================
-- D-ELEVAGE : Schéma initial & Multi-tenant SaaS
-- Gestion d'élevage multi-espèces (Avicole, Bovin, Ovin/Caprin, Porcin)
-- =====================================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- 1. Table des Entreprises / Exploitations (Tenants)
create table if not exists public.entreprises (
    id uuid primary key default uuid_generate_v4(),
    nom text not null,
    code_pays text default 'SN',
    telephone text,
    email text,
    adresse text,
    devise text default 'FCFA',
    subscription_tier text default 'standard' check (subscription_tier in ('standard', 'medium', 'premium')),
    compte_verrouille boolean default false,
    essai_expire_le timestamptz default (now() + interval '14 days'),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. Table des Utilisateurs
create table if not exists public.utilisateurs (
    id uuid primary key references auth.users(id) on delete cascade,
    entreprise_id uuid not null references public.entreprises(id) on delete cascade,
    nom_complet text,
    role text not null default 'agent' check (role in ('admin', 'responsable', 'agent', 'veterinaire')),
    permissions jsonb default '{"production": "write", "sanitaire": "write", "stocks": "write", "finances": "read"}'::jsonb,
    actif boolean default true,
    created_at timestamptz default now()
);

-- 3. Types d'Élevage & Espèces
create table if not exists public.especes_elevage (
    id uuid primary key default uuid_generate_v4(),
    code text not null unique, -- 'volaille_chair', 'volaille_ponte', 'bovin_viande', 'bovin_lait', 'ovin_caprin', 'porcin'
    nom text not null,
    categorie text not null, -- 'avicole', 'bovin', 'petit_ruminant', 'porcin'
    mode_suivi text not null default 'bande' check (mode_suivi in ('bande', 'individuel', 'mixte')),
    unite_effectif text default 'sujets'
);

insert into public.especes_elevage (code, nom, categorie, mode_suivi, unite_effectif) values
('volaille_chair', 'Poulets de chair (GRILL / COBB / ROSS)', 'avicole', 'bande', 'sujets'),
('volaille_ponte', 'Poules pondeuses / Oeufs', 'avicole', 'bande', 'sujets'),
('bovin_viande', 'Bovins engraissement / viande', 'bovin', 'individuel', 'têtes'),
('bovin_lait', 'Bovins laitiers', 'bovin', 'individuel', 'têtes'),
('ovin_caprin', 'Ovins / Caprins (Moutons, Chèvres)', 'petit_ruminant', 'mixte', 'têtes'),
('porcin', 'Porcins (Porcs charcutiers / Truies)', 'porcin', 'bande', 'sujets')
on conflict (code) do nothing;

-- 4. Bâtiments / Enclos / Parcs
create table if not exists public.batiments (
    id uuid primary key default uuid_generate_v4(),
    entreprise_id uuid not null references public.entreprises(id) on delete cascade,
    nom text not null,
    type_batiment text default 'poulailler', -- 'poulailler', 'etable', 'bergerie', 'porcherie', 'parc'
    capacite_max integer default 1000,
    actif boolean default true,
    created_at timestamptz default now()
);

-- 5. Bandes / Cohortes (Aviculture, Porcs, etc.)
create table if not exists public.bandes (
    id uuid primary key default uuid_generate_v4(),
    entreprise_id uuid not null references public.entreprises(id) on delete cascade,
    code_bande text not null, -- ex: BND-2026-001
    espece_code text not null references public.especes_elevage(code),
    batiment_id uuid references public.batiments(id) on delete set null,
    date_entree date not null default current_date,
    effectif_initial integer not null check (effectif_initial > 0),
    effectif_actuel integer not null check (effectif_actuel >= 0),
    poids_moyen_initial_kg numeric(6,3) default 0.040, -- 40g poussin d'un jour
    poids_moyen_actuel_kg numeric(6,3),
    cout_achat_sujet numeric(12,2) default 0,
    statut text default 'en_cours' check (statut in ('en_cours', 'en_latence', 'pret_vente', 'cloturee', 'archivee')),
    date_cloture date,
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 6. Suivi Individuel des Animaux (Bovins, Ruminants, Reproducteurs)
create table if not exists public.animaux (
    id uuid primary key default uuid_generate_v4(),
    entreprise_id uuid not null references public.entreprises(id) on delete cascade,
    numero_boucle text not null, -- Numéro d'identification ou boucle auriculaire
    nom_ou_surnom text,
    espece_code text not null references public.especes_elevage(code),
    batiment_id uuid references public.batiments(id) on delete set null,
    sexe text not null check (sexe in ('M', 'F')),
    date_naissance date,
    date_entree date not null default current_date,
    origine text, -- 'ne_sur_ferme', 'achat_marche', 'autre'
    pere_boucle text,
    mere_boucle text,
    poids_actuel_kg numeric(7,2),
    etat_sante text default 'sain' check (etat_sante in ('sain', 'en_soins', 'en_latence', 'isole', 'vendu', 'decede')),
    en_lactation boolean default false,
    date_fin_latence date, -- calculée automatiquement en fonction des soins
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 7. Catalogue des Intrants & Médicaments
create table if not exists public.intrants (
    id uuid primary key default uuid_generate_v4(),
    entreprise_id uuid not null references public.entreprises(id) on delete cascade,
    code_article text,
    nom text not null,
    categorie text not null check (categorie in ('aliment', 'medicament', 'vaccin', 'vitamines', 'litiere', 'desinfectant', 'autre')),
    unite text not null default 'kg', -- 'kg', 'sac_50kg', 'flacon', 'dose', 'litre'
    stock_actuel numeric(12,2) not null default 0,
    stock_minimum numeric(12,2) default 5,
    prix_unitaire_moyen numeric(12,2) default 0,
    latence_jours_defaut integer default 0, -- délai d'attente / temps de retrait avant consommation/vente
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 8. Soins, Vaccinations & Traitements Médicaux (Sécurité sanitaire)
create table if not exists public.traitements_medicaux (
    id uuid primary key default uuid_generate_v4(),
    entreprise_id uuid not null references public.entreprises(id) on delete cascade,
    bande_id uuid references public.bandes(id) on delete cascade,
    animal_id uuid references public.animaux(id) on delete cascade,
    intrant_id uuid not null references public.intrants(id) on delete restrict,
    date_administration date not null default current_date,
    quantite_administree numeric(10,2) not null,
    dose_par_sujet text,
    motif text not null, -- 'vaccination_preventive', 'antibiotique_curatif', 'vitamines_demarrage', 'autre'
    duree_latence_jours integer not null default 0, -- Rémanence/retrait
    date_fin_latence date not null, -- date_administration + duree_latence_jours
    administre_par text,
    notes text,
    created_at timestamptz default now()
);

-- 9. Suivi Quotidien de Production (Alimentation, Mortalités, Ponte, Pesées)
create table if not exists public.suivi_quotidien (
    id uuid primary key default uuid_generate_v4(),
    entreprise_id uuid not null references public.entreprises(id) on delete cascade,
    bande_id uuid references public.bandes(id) on delete cascade,
    animal_id uuid references public.animaux(id) on delete cascade,
    date_suivi date not null default current_date,
    mortalites integer default 0,
    cause_mortalite text,
    aliment_intrant_id uuid references public.intrants(id),
    aliment_quantite_kg numeric(10,2) default 0,
    oeufs_recoltes integer default 0,
    oeufs_casses integer default 0,
    lait_recolte_litres numeric(8,2) default 0,
    poids_moyen_mesure_kg numeric(7,3),
    observations text,
    created_at timestamptz default now()
);

-- 10. Finances de Production (Ventes d'animaux, oeufs, lait, charges)
create table if not exists public.finances_elevage (
    id uuid primary key default uuid_generate_v4(),
    entreprise_id uuid not null references public.entreprises(id) on delete cascade,
    type_operation text not null check (type_operation in ('vente_sujets', 'vente_oeufs', 'vente_lait', 'achat_intrant', 'achat_animaux', 'charge_veterinaire', 'autre_charge', 'autre_produit')),
    bande_id uuid references public.bandes(id) on delete set null,
    animal_id uuid references public.animaux(id) on delete set null,
    date_operation date not null default current_date,
    montant_total numeric(12,2) not null check (montant_total >= 0),
    quantite numeric(10,2) default 1,
    prix_unitaire numeric(12,2),
    moyen_paiement text default 'especes', -- 'especes', 'wave', 'orange_money', 'cheque', 'virement'
    tiers_nom text, -- client ou fournisseur
    description text,
    created_at timestamptz default now()
);

-- 11. Fonction & Trigger pour recalculer le statut de latence sanitaire
create or replace function public.fn_actualiser_latence_traitement()
returns trigger as $$
begin
    -- Met à jour la date de fin de latence
    new.date_fin_latence := new.date_administration + (new.duree_latence_jours || ' days')::interval;
    
    -- Si bande associée et latence > 0
    if new.bande_id is not null and new.duree_latence_jours > 0 then
        update public.bandes
        set statut = case when new.date_fin_latence >= current_date then 'en_latence' else statut end
        where id = new.bande_id;
    end if;

    -- Si animal associé et latence > 0
    if new.animal_id is not null and new.duree_latence_jours > 0 then
        update public.animaux
        set etat_sante = case when new.date_fin_latence >= current_date then 'en_latence' else etat_sante end,
            date_fin_latence = new.date_fin_latence
        where id = new.animal_id;
    end if;

    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_traitements_medicaux_latence on public.traitements_medicaux;
create trigger trg_traitements_medicaux_latence
before insert or update on public.traitements_medicaux
for each row execute function public.fn_actualiser_latence_traitement();

-- 12. Trigger de mise à jour des effectifs lors d'une mortalité dans le suivi quotidien
create or replace function public.fn_maj_effectif_suivi_quotidien()
returns trigger as $$
begin
    if new.mortalites > 0 and new.bande_id is not null then
        update public.bandes
        set effectif_actuel = greatest(0, effectif_actuel - new.mortalites),
            updated_at = now()
        where id = new.bande_id;
    end if;
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_suivi_quotidien_mortalites on public.suivi_quotidien;
create trigger trg_suivi_quotidien_mortalites
after insert on public.suivi_quotidien
for each row execute function public.fn_maj_effectif_suivi_quotidien();

-- 13. Sécurité RLS
alter table public.entreprises enable row level security;
alter table public.utilisateurs enable row level security;
alter table public.batiments enable row level security;
alter table public.bandes enable row level security;
alter table public.animaux enable row level security;
alter table public.intrants enable row level security;
alter table public.traitements_medicaux enable row level security;
alter table public.suivi_quotidien enable row level security;
alter table public.finances_elevage enable row level security;

-- Policies multi-tenant isolées par entreprise_id
create policy "Entreprise accessible par ses membres" on public.entreprises
    for all using (
        id in (select entreprise_id from public.utilisateurs where id = auth.uid())
    );

create policy "Utilisateurs de la même entreprise" on public.utilisateurs
    for all using (
        entreprise_id in (select entreprise_id from public.utilisateurs where id = auth.uid())
    );

create policy "Bâtiments par entreprise" on public.batiments
    for all using (
        entreprise_id in (select entreprise_id from public.utilisateurs where id = auth.uid())
    );

create policy "Bandes par entreprise" on public.bandes
    for all using (
        entreprise_id in (select entreprise_id from public.utilisateurs where id = auth.uid())
    );

create policy "Animaux par entreprise" on public.animaux
    for all using (
        entreprise_id in (select entreprise_id from public.utilisateurs where id = auth.uid())
    );

create policy "Intrants par entreprise" on public.intrants
    for all using (
        entreprise_id in (select entreprise_id from public.utilisateurs where id = auth.uid())
    );

create policy "Traitements par entreprise" on public.traitements_medicaux
    for all using (
        entreprise_id in (select entreprise_id from public.utilisateurs where id = auth.uid())
    );

create policy "Suivi par entreprise" on public.suivi_quotidien
    for all using (
        entreprise_id in (select entreprise_id from public.utilisateurs where id = auth.uid())
    );

create policy "Finances par entreprise" on public.finances_elevage
    for all using (
        entreprise_id in (select entreprise_id from public.utilisateurs where id = auth.uid())
    );
