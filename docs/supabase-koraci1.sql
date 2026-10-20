-- Koraci na laktarenje.com (Petar 20. 10., runda 2 „mjerenje: tablica“).
-- Vercel je na Hobby planu i ne bilježi track() događaje, pa brojimo sami.
-- Samo brojači po danu, koraku, izvoru i varijanti: bez maila, IP-a, kolačića ili ID-a osobe.
-- Piše samo server (/api/korak i /potvrdi) tajnim ključem; anon i authenticated nemaju ništa.

create table if not exists public.web_koraci (
  dan date not null default ((now() at time zone 'Europe/Zagreb')::date),
  korak text not null check (korak ~ '^[a-z_]{2,30}$'),
  izvor text not null default 'direkt' check (izvor ~ '^[a-z0-9-]{1,40}$'),
  varijanta text not null default '-' check (varijanta ~ '^[a-z0-9-]{1,20}$'),
  broj integer not null default 0 check (broj >= 0),
  primary key (dan, korak, izvor, varijanta)
);

alter table public.web_koraci enable row level security;
revoke all on public.web_koraci from anon, authenticated;

create or replace function public.web_korak(p_korak text, p_izvor text default 'direkt', p_varijanta text default '-')
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.web_koraci (korak, izvor, varijanta, broj)
  values (p_korak, coalesce(nullif(p_izvor, ''), 'direkt'), coalesce(nullif(p_varijanta, ''), '-'), 1)
  on conflict (dan, korak, izvor, varijanta) do update set broj = public.web_koraci.broj + 1;
$$;

revoke execute on function public.web_korak(text, text, text) from public, anon, authenticated;
grant execute on function public.web_korak(text, text, text) to service_role;

-- Čitanje (Claude, read-only):
-- select dan, korak, izvor, varijanta, broj from public.web_koraci order by dan desc, korak;
