-- Migration 03: Tables pour la configuration des produits Maketou et Chariow et tarifs d'abonnements

CREATE TABLE IF NOT EXISTS public.chariow_produits (
    montant numeric PRIMARY KEY,
    product_id text NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.chariow_produits ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.maketou_produits (
    montant integer PRIMARY KEY,
    product_id text NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.maketou_produits ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.tarif_abonnement (
    niveau text PRIMARY KEY,
    prix_annuel integer NOT NULL,
    prix_mensuel integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.tarif_abonnement ENABLE ROW LEVEL SECURITY;

INSERT INTO public.tarif_abonnement (niveau, prix_annuel, prix_mensuel)
VALUES 
    ('standard', 50000, 5000),
    ('medium', 100000, 10000),
    ('premium', 150000, 15000)
ON CONFLICT (niveau) DO UPDATE SET prix_annuel = EXCLUDED.prix_annuel, prix_mensuel = EXCLUDED.prix_mensuel;
