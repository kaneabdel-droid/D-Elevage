-- =====================================================================
-- Migration 05: Trigger auth.users et identification de l'entreprise payante
-- Permet d'identifier automatiquement l'entreprise et le responsable qui paie
-- =====================================================================

-- 1. S'assurer que la table entreprises possède bien toutes les colonnes d'identification
alter table public.entreprises 
    add column if not exists telephone text,
    add column if not exists adresse text,
    add column if not exists types_activite text[] default array['volaille', 'ruminants', 'lait', 'production_vegetale']::text[];

-- 2. Fonction exécutée après création d'un utilisateur dans auth.users
create or replace function public.handle_new_user() 
returns trigger as $$
declare
  v_nom text;
  v_nom_complet text;
  v_telephone text;
  v_adresse text;
  v_code_pays text;
  v_devise text;
  v_plan text;
  v_types_activite text[];
  v_entreprise_id uuid;
begin
  -- Nom de l'entreprise ou exploitation
  v_nom := coalesce(
    nullif(trim(new.raw_user_meta_data->>'gie_nom'), ''),
    nullif(trim(new.raw_user_meta_data->>'nom_entreprise'), ''),
    'Mon Agroferme'
  );

  -- Identité du responsable payeur
  v_nom_complet := coalesce(nullif(trim(new.raw_user_meta_data->>'nom_complet'), ''), '');
  v_telephone := coalesce(nullif(trim(new.raw_user_meta_data->>'telephone'), ''), '');
  v_adresse := coalesce(nullif(trim(new.raw_user_meta_data->>'adresse'), ''), '');
  v_code_pays := coalesce(nullif(trim(new.raw_user_meta_data->>'pays'), ''), 'SN');
  v_devise := coalesce(nullif(trim(new.raw_user_meta_data->>'devise'), ''), 'FCFA');
  v_plan := coalesce(nullif(trim(new.raw_user_meta_data->>'plan'), ''), 'standard');

  if v_plan not in ('standard', 'medium', 'premium') then
    v_plan := 'standard';
  end if;

  -- Types d'activités
  begin
    if new.raw_user_meta_data->'types_activite' is not null and jsonb_typeof(new.raw_user_meta_data->'types_activite') = 'array' then
      select coalesce(array_agg(x::text), array['volaille', 'ruminants', 'lait', 'production_vegetale']::text[])
      into v_types_activite
      from jsonb_array_elements_text(new.raw_user_meta_data->'types_activite') t(x);
    else
      v_types_activite := array['volaille', 'ruminants', 'lait', 'production_vegetale']::text[];
    end if;
  exception when others then
    v_types_activite := array['volaille', 'ruminants', 'lait', 'production_vegetale']::text[];
  end;

  -- 1. Créer ou associer l'entreprise
  insert into public.entreprises (
    nom,
    code_pays,
    telephone,
    email,
    adresse,
    devise,
    subscription_tier,
    types_activite,
    essai_expire_le
  ) values (
    v_nom,
    v_code_pays,
    v_telephone,
    new.email,
    v_adresse,
    v_devise,
    v_plan,
    v_types_activite,
    now() + interval '14 days'
  )
  returning id into v_entreprise_id;

  -- 2. Créer l'utilisateur admin lié à cette entreprise
  insert into public.utilisateurs (
    id,
    entreprise_id,
    nom_complet,
    role,
    permissions,
    actif
  ) values (
    new.id,
    v_entreprise_id,
    v_nom_complet,
    'admin',
    '{"production": "write", "sanitaire": "write", "stocks": "write", "finances": "write"}'::jsonb,
    true
  )
  on conflict (id) do update set
    entreprise_id = excluded.entreprise_id,
    nom_complet = coalesce(nullif(excluded.nom_complet, ''), public.utilisateurs.nom_complet);

  return new;
exception when others then
  -- Ne bloque jamais l'inscription Auth si une erreur SQL survient
  return new;
end;
$$ language plpgsql security definer;

-- 3. Trigger sur auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
