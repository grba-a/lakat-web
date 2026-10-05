-- lakat-web: lista čekanja u LAKAT Supabase PROD (Petar q2 = A, 2026-10-05).
-- Aditivno i idempotentno: može se pokrenuti više puta. Ne dira postojeće tablice aplikacije.
-- Pristup ima samo server lakat-weba (service role); RLS je uključen i nema nijedne politike,
-- pa anon i prijavljeni korisnici aplikacije ne vide ništa.

create table if not exists public.lista_cekanja (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  platforma text not null default 'iphone' check (platforma in ('iphone', 'android')),
  izvor text not null default 'direkt',
  grad text,
  kvart text,
  ime text,                       -- rezervirano ime za aplikaciju (w09), malim slovima
  ref_kod text not null,          -- osobni kod za „Dovedi pajdaša“ (w06)
  pozvao text,                    -- ref_kod onoga tko je poslao link
  token uuid not null default gen_random_uuid(),   -- za potvrdu maila (vlastiti double opt-in)
  potvrdeno_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists lista_cekanja_email_key on public.lista_cekanja (lower(email));
create unique index if not exists lista_cekanja_ref_key on public.lista_cekanja (ref_kod);
create unique index if not exists lista_cekanja_ime_key on public.lista_cekanja (lower(ime)) where ime is not null;
create unique index if not exists lista_cekanja_token_key on public.lista_cekanja (token);
create index if not exists lista_cekanja_pozvao_idx on public.lista_cekanja (pozvao) where potvrdeno_at is not null;
create index if not exists lista_cekanja_kvart_idx on public.lista_cekanja (grad, kvart) where potvrdeno_at is not null;

alter table public.lista_cekanja enable row level security;
revoke all on public.lista_cekanja from anon, authenticated;

-- Poredak kvartova (w07): samo potvrđeni, samo kvartovi s barem 3 upisa, bez imena i mailova.
create or replace view public.lista_kvartovi
with (security_invoker = true) as
select initcap(grad) as grad, initcap(kvart) as kvart, count(*)::int as broj
from public.lista_cekanja
where potvrdeno_at is not null and grad is not null and kvart is not null
group by initcap(grad), initcap(kvart)
having count(*) >= 3;

revoke all on public.lista_kvartovi from anon, authenticated;

-- Je li ime slobodno (w09): ni u aplikaciji (profiles.username) ni rezervirano na listi.
create or replace function public.lista_ime_slobodno(p_ime text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (select 1 from public.profiles where lower(username) = lower(p_ime))
     and not exists (select 1 from public.lista_cekanja where lower(ime) = lower(p_ime));
$$;

revoke all on function public.lista_ime_slobodno(text) from public, anon, authenticated;
