-- lakat-web: javna ljestvica igre dana (Petar, 15. 10., j-igra-nagrada NE + bilješka: „tvoj rekord“ i ljestvica s imenom).
-- Aditivno i idempotentno: može se pokrenuti više puta. Ne dira tablice aplikacije. Petar pokreće u SQL editoru (PROD).
-- Prije ove skripte web radi kao i prije: ljestvice nema, ostaje samo lokalni rekord.
--
-- Pristup ima samo server lakat-weba (service role) preko dvije funkcije. RLS je uključen i nema politika,
-- pa anon i korisnici aplikacije ne vide ništa. Nema mailova. Sprema se: dan, nadimak, rezultat i HMAC otisak IP-a
-- (ne sama adresa) samo za ograničenje slanja; otisak se briše nakon jednog dana, redovi nakon 30 dana.
-- Rezultat šalje preglednik, pa ga netko uporan može i lažirati: zato je ljestvica dnevna i služi za zabavu.

create table if not exists public.igra_ljestvica (
  id bigint generated always as identity primary key,
  dan date not null,
  ime text not null check (char_length(ime) between 2 and 16),
  rezultat int not null check (rezultat between 1 and 999),
  ip_otisak text,
  created_at timestamptz not null default now()
);

create index if not exists igra_ljestvica_dan_rezultat_idx on public.igra_ljestvica (dan, rezultat desc);
create index if not exists igra_ljestvica_otisak_idx on public.igra_ljestvica (ip_otisak, created_at) where ip_otisak is not null;

alter table public.igra_ljestvica enable row level security;
revoke all on public.igra_ljestvica from anon, authenticated;

-- Upis rezultata. Vraća 'ok', 'cesto' (previše slanja), 'ime' (nedopušteno ime) ili 'rezultat'.
create or replace function public.igra_upis(p_ime text, p_rezultat int, p_otisak text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ime text := btrim(regexp_replace(coalesce(p_ime, ''), '\s+', ' ', 'g'));
  v_dan date := (now() at time zone 'Europe/Zagreb')::date;
  v_blok boolean := false;
begin
  if p_rezultat is null or p_rezultat < 1 or p_rezultat > 999 then return 'rezultat'; end if;
  if v_ime !~ '^[A-Za-z0-9ČĆŠĐŽčćšđž ._-]{2,16}$' then return 'ime'; end if;

  -- Filter mržnje i prijetnji iz aplikacije (lakat-ios docs/supabase-filter1.sql), ako postoji u ovoj bazi.
  if to_regprocedure('public.filter_blokira(text)') is not null then
    execute 'select public.filter_blokira($1)' into v_blok using v_ime;
    if v_blok then return 'ime'; end if;
  end if;

  -- Najviše 5 upisa u 10 minuta s istog otiska, i najviše 300 u 10 minuta ukupno.
  if p_otisak is not null and (
    select count(*) from public.igra_ljestvica
    where ip_otisak = p_otisak and created_at > now() - interval '10 minutes'
  ) >= 5 then return 'cesto'; end if;
  if (select count(*) from public.igra_ljestvica where created_at > now() - interval '10 minutes') >= 300 then
    return 'cesto';
  end if;

  insert into public.igra_ljestvica (dan, ime, rezultat, ip_otisak) values (v_dan, v_ime, p_rezultat, p_otisak);

  -- Čišćenje usput: otisak živi jedan dan, redovi 30 dana.
  update public.igra_ljestvica set ip_otisak = null where ip_otisak is not null and created_at < now() - interval '1 day';
  delete from public.igra_ljestvica where dan < v_dan - 30;
  return 'ok';
end;
$$;

-- Ljestvica dana: najboljih 10 imena (svako ime jednom, s najboljim rezultatom). Bez otisaka i bez ičeg drugog.
create or replace function public.igra_ljestvica_dana(p_dan date default null)
returns table (ime text, rezultat int)
language sql
stable
security definer
set search_path = public
as $$
  select min(l.ime) as ime, max(l.rezultat) as rezultat
  from public.igra_ljestvica l
  where l.dan = coalesce(p_dan, (now() at time zone 'Europe/Zagreb')::date)
  group by lower(l.ime)
  order by max(l.rezultat) desc, min(l.created_at)
  limit 10;
$$;

revoke all on function public.igra_upis(text, int, text) from public, anon, authenticated;
revoke all on function public.igra_ljestvica_dana(date) from public, anon, authenticated;
grant execute on function public.igra_upis(text, int, text) to service_role;
grant execute on function public.igra_ljestvica_dana(date) to service_role;
