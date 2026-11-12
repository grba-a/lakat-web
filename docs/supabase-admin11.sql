-- LAKAT /admin faza U (Petar 11. 11.: uzbune mailom, tihi sati 00–08, sve vrste): incidenti i tajna za cron.
-- Tajnu za poziv /admin/provjera generira SAMA BAZA u Supabase Vaultu (nitko je ne vidi, ni Vercel ni Claude);
-- ruta je provjerava preko admin_uzbune_tajna_ok. Samo service_role. Aditivno, idempotentno.
-- Raspored (pg_cron) je u supabase-admin11-cron.sql i pali se tek kad je ruta uživo.

create table if not exists public.admin_uzbune (
  kljuc text primary key,
  razina text not null check (razina in ('kriticno', 'vazno', 'info')),
  naslov text not null,
  detalj text,
  otvoreno_at timestamptz not null default now(),
  zadnje_at timestamptz not null default now(),
  rijeseno_at timestamptz,
  poslano_razina text,
  oporavak_poslan boolean not null default false
);
alter table public.admin_uzbune enable row level security;
revoke all on table public.admin_uzbune from public, anon, authenticated;

do $$ begin
  if not exists (select 1 from vault.secrets where name = 'uzbune_tajna') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'uzbune_tajna', 'LAKAT admin: cron -> /admin/provjera');
  end if;
end $$;

create or replace function public.admin_uzbune_tajna_ok(p_tajna text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(length(p_tajna) = 64 and p_tajna = (select decrypted_secret from vault.decrypted_secrets where name = 'uzbune_tajna'), false);
$$;

-- Ulaz: trenutne uzbune [{kljuc, razina, naslov, detalj}]. Otvara nove, ažurira postojeće, zatvara nestale.
-- Izlaz: {otvorene: [...] koje treba javiti (nova ili viša razina), oporavci: [...] zatvorene koje su bile javljene}.
create or replace function public.admin_uzbune_azuriraj(p_aktivne jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r jsonb;
  v_kljucevi text[] := array(select jsonb_array_elements(coalesce(p_aktivne, '[]'::jsonb)) ->> 'kljuc');
begin
  perform pg_advisory_xact_lock(hashtext('lakat_admin_uzbune'));
  for r in select * from jsonb_array_elements(coalesce(p_aktivne, '[]'::jsonb)) loop
    insert into admin_uzbune (kljuc, razina, naslov, detalj)
    values (left(r ->> 'kljuc', 80), r ->> 'razina', left(r ->> 'naslov', 200), left(r ->> 'detalj', 300))
    on conflict (kljuc) do update set
      razina = excluded.razina, naslov = excluded.naslov, detalj = excluded.detalj, zadnje_at = now(),
      otvoreno_at = case when admin_uzbune.rijeseno_at is not null then now() else admin_uzbune.otvoreno_at end,
      poslano_razina = case when admin_uzbune.rijeseno_at is not null then null else admin_uzbune.poslano_razina end,
      oporavak_poslan = case when admin_uzbune.rijeseno_at is not null then false else admin_uzbune.oporavak_poslan end,
      rijeseno_at = null;
  end loop;
  update admin_uzbune set rijeseno_at = now(), oporavak_poslan = false
    where rijeseno_at is null and not (kljuc = any (v_kljucevi));
  delete from admin_uzbune where rijeseno_at < now() - interval '60 days';
  return jsonb_build_object(
    'otvorene', (select coalesce(jsonb_agg(to_jsonb(u) order by otvoreno_at), '[]'::jsonb) from admin_uzbune u
                 where rijeseno_at is null and (poslano_razina is null
                   or (case razina when 'kriticno' then 3 when 'vazno' then 2 else 1 end) >
                      (case poslano_razina when 'kriticno' then 3 when 'vazno' then 2 else 1 end))),
    'oporavci', (select coalesce(jsonb_agg(to_jsonb(u) order by rijeseno_at), '[]'::jsonb) from admin_uzbune u
                 where rijeseno_at is not null and not oporavak_poslan and poslano_razina is not null)
  );
end;
$$;

create or replace function public.admin_uzbune_poslano(p_otvorene text[], p_oporavci text[])
returns void
language sql
security definer
set search_path = public
as $$
  update admin_uzbune set poslano_razina = razina where kljuc = any (coalesce(p_otvorene, '{}'));
  update admin_uzbune set oporavak_poslan = true where kljuc = any (coalesce(p_oporavci, '{}'));
$$;

-- Povijest za ploču: zadnjih 30 incidenata.
create or replace function public.admin_uzbune_povijest()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object('kljuc', kljuc, 'razina', razina, 'naslov', naslov, 'detalj', detalj,
    'otvoreno', otvoreno_at, 'rijeseno', rijeseno_at, 'javljeno', poslano_razina is not null) order by otvoreno_at desc), '[]'::jsonb)
  from (select * from admin_uzbune order by otvoreno_at desc limit 30) z;
$$;

revoke all on function public.admin_uzbune_tajna_ok(text) from public, anon, authenticated;
revoke all on function public.admin_uzbune_azuriraj(jsonb) from public, anon, authenticated;
revoke all on function public.admin_uzbune_poslano(text[], text[]) from public, anon, authenticated;
revoke all on function public.admin_uzbune_povijest() from public, anon, authenticated;
grant execute on function public.admin_uzbune_tajna_ok(text) to service_role;
grant execute on function public.admin_uzbune_azuriraj(jsonb) to service_role;
grant execute on function public.admin_uzbune_poslano(text[], text[]) to service_role;
grant execute on function public.admin_uzbune_povijest() to service_role;
