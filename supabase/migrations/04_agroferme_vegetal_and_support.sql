-- =====================================================================
-- D-AGROFERME : Migration 04 - Volet Végétal, Support & Types d'Activité
-- =====================================================================

-- 1. Ajout de la colonne types_activite sur les entreprises
alter table public.entreprises 
add column if not exists types_activite text[] default '{"volaille", "ruminants", "lait", "production_vegetale"}';

-- 2. Table des messages de support (correction de l'envoi de messages support)
create table if not exists public.support_messages (
    id uuid primary key default uuid_generate_v4(),
    entreprise_id uuid not null references public.entreprises(id) on delete cascade,
    gie_id uuid references public.entreprises(id) on delete cascade,
    user_id uuid references auth.users(id) on delete set null,
    email text not null,
    sujet text not null check (char_length(sujet) between 1 and 200),
    message text not null check (char_length(message) between 1 and 5000),
    statut text not null default 'nouveau' check (statut in ('nouveau', 'en_cours', 'resolu')),
    email_envoye boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists idx_support_messages_entreprise on public.support_messages (entreprise_id, created_at desc);

alter table public.support_messages enable row level security;

do $$
begin
    if not exists (select 1 from pg_policies where tablename = 'support_messages' and policyname = 'Lecture support_messages par entreprise') then
        create policy "Lecture support_messages par entreprise"
        on public.support_messages for select
        using (
          entreprise_id in (select entreprise_id from public.utilisateurs where id = auth.uid())
        );
    end if;

    if not exists (select 1 from pg_policies where tablename = 'support_messages' and policyname = 'Creation support_messages par entreprise') then
        create policy "Creation support_messages par entreprise"
        on public.support_messages for insert
        with check (
          user_id = auth.uid()
          and entreprise_id in (select entreprise_id from public.utilisateurs where id = auth.uid())
        );
    end if;
end $$;

-- 3. Volet Végétal : Parcelles & Cultures
create table if not exists public.parcelles_vegetales (
    id uuid primary key default uuid_generate_v4(),
    entreprise_id uuid not null references public.entreprises(id) on delete cascade,
    nom text not null,
    surface_ha numeric(8,2) default 1.0,
    type_culture text not null default 'maraichere' check (type_culture in ('maraichere', 'fruitiere', 'fourragere', 'cerealiere', 'autre')),
    culture_actuelle text not null,
    variete text,
    date_semis date,
    date_recolte_prevue date,
    statut text default 'en_culture' check (statut in ('preparation', 'en_culture', 'recolte_en_cours', 'jachere', 'recoltee')),
    systeme_irrigation text default 'goutte_a_goutte',
    rendement_estime numeric(10,2),
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 4. Volet Végétal : Récoltes & Productions
create table if not exists public.recoltes_vegetales (
    id uuid primary key default uuid_generate_v4(),
    entreprise_id uuid not null references public.entreprises(id) on delete cascade,
    parcelle_id uuid references public.parcelles_vegetales(id) on delete set null,
    culture text not null,
    variete text,
    date_recolte date not null default current_date,
    quantite numeric(10,2) not null check (quantite > 0),
    unite text not null default 'kg',
    qualite text default 'premier_choix' check (qualite in ('premier_choix', 'deuxieme_choix', 'rebut', 'standard')),
    destination text default 'stock' check (destination in ('stock', 'vente_directe', 'autoconsommation_fourrage', 'perte')),
    cout_recolte numeric(12,2) default 0,
    observations text,
    created_at timestamptz default now()
);

-- 5. Volet Végétal : Stocks de Récoltes & Fourrages
create table if not exists public.stocks_vegetaux (
    id uuid primary key default uuid_generate_v4(),
    entreprise_id uuid not null references public.entreprises(id) on delete cascade,
    type_element text not null default 'produit_recolte' check (type_element in ('produit_recolte', 'semence', 'fourrage_stocke', 'fertilisant_organique')),
    nom_produit text not null,
    variete text,
    quantite_disponible numeric(10,2) not null default 0,
    unite text not null default 'kg',
    seuil_alerte numeric(10,2) default 10,
    lieu_stockage text,
    prix_unitaire_estime numeric(12,2) default 0,
    date_derniere_entree date default current_date,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 6. Volet Végétal : Ventes de Produits Végétaux
create table if not exists public.ventes_vegetales (
    id uuid primary key default uuid_generate_v4(),
    entreprise_id uuid not null references public.entreprises(id) on delete cascade,
    stock_vegetal_id uuid references public.stocks_vegetaux(id) on delete set null,
    culture text not null,
    variete text,
    client_nom text not null,
    client_contact text,
    quantite numeric(10,2) not null check (quantite > 0),
    unite text not null default 'kg',
    prix_unitaire numeric(12,2) not null check (prix_unitaire >= 0),
    montant_total numeric(12,2) not null check (montant_total >= 0),
    date_vente date not null default current_date,
    moyen_paiement text default 'especes' check (moyen_paiement in ('especes', 'wave', 'orange_money', 'virement', 'cheque', 'credit')),
    statut_paiement text default 'regle' check (statut_paiement in ('regle', 'partiel', 'en_attente')),
    montant_regle numeric(12,2) default 0,
    notes text,
    created_at timestamptz default now()
);

-- RLS
alter table public.parcelles_vegetales enable row level security;
alter table public.recoltes_vegetales enable row level security;
alter table public.stocks_vegetaux enable row level security;
alter table public.ventes_vegetales enable row level security;

do $$
begin
    if not exists (select 1 from pg_policies where tablename = 'parcelles_vegetales' and policyname = 'Parcelles par entreprise') then
        create policy "Parcelles par entreprise" on public.parcelles_vegetales
        for all using (entreprise_id in (select entreprise_id from public.utilisateurs where id = auth.uid()));
    end if;

    if not exists (select 1 from pg_policies where tablename = 'recoltes_vegetales' and policyname = 'Recoltes par entreprise') then
        create policy "Recoltes par entreprise" on public.recoltes_vegetales
        for all using (entreprise_id in (select entreprise_id from public.utilisateurs where id = auth.uid()));
    end if;

    if not exists (select 1 from pg_policies where tablename = 'stocks_vegetaux' and policyname = 'Stocks vegetaux par entreprise') then
        create policy "Stocks vegetaux par entreprise" on public.stocks_vegetaux
        for all using (entreprise_id in (select entreprise_id from public.utilisateurs where id = auth.uid()));
    end if;

    if not exists (select 1 from pg_policies where tablename = 'ventes_vegetales' and policyname = 'Ventes vegetales par entreprise') then
        create policy "Ventes vegetales par entreprise" on public.ventes_vegetales
        for all using (entreprise_id in (select entreprise_id from public.utilisateurs where id = auth.uid()));
    end if;
end $$;
