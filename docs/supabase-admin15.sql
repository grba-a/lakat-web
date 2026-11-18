-- LAKAT /admin/plan (Petar 18. 11. 2026): kalendar rada na TV zidu umjesto ploče na claude.ai.
-- Kartica = jedan zadatak ili objava: red (aplikacija, web, instagram, ti), dan (null = kasnije), stanje.
-- Nema osobnih podataka korisnika aplikacije. Čita i piše samo service_role (ploča iza lozinke i 2FA).
-- Aditivno i idempotentno.

create table if not exists public.admin_plan (
  id text primary key default replace(gen_random_uuid()::text, '-', ''),
  naslov text not null check (char_length(naslov) between 1 and 200),
  red text not null default 'ti' check (red in ('app', 'web', 'ig', 'ti')),
  dan date,
  stanje text not null default 'todo' check (stanje in ('todo', 'radim', 'spremno', 'gotovo', 'ne')),
  tko text check (tko is null or char_length(tko) <= 40),
  velicina text check (velicina is null or velicina in ('S', 'M', 'L')),
  napomena text check (napomena is null or char_length(napomena) <= 400),
  biljeska text check (biljeska is null or char_length(biljeska) <= 600),
  moja boolean not null default false,
  redoslijed int not null default 0,
  azurirano timestamptz not null default now()
);
create index if not exists admin_plan_dan_idx on public.admin_plan (dan);
alter table public.admin_plan enable row level security;
revoke all on table public.admin_plan from public, anon, authenticated;
grant select, insert, update, delete on table public.admin_plan to service_role;
