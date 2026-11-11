-- LAKAT /admin zaštita (11. 11.): zapis svakog pokušaja prijave i zaključavanje nakon previše promašaja.
-- Vercel vrti više instanci odjednom, pa pauza u kodu sama ne zaustavlja pogađanje; brojač mora biti u bazi.
-- Svaki pokušaj se zapiše KAO PROMAŠAJ prije provjere šifre, pod zaključavanjem, pa ni stotinu istovremenih
-- zahtjeva ne prođe limit. Uspjeh se naknadno označi.
-- IP se NE sprema: samo HMAC otisak (ne da se vratiti u adresu). Redovi stariji od 30 dana se brišu.
-- Pristup samo service_role (RLS uključen, bez ijedne politike). Aditivno i idempotentno.

create table if not exists public.admin_prijave (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  uspjeh boolean not null default false,
  otisak text not null
);
create index if not exists admin_prijave_at on public.admin_prijave (at desc);
alter table public.admin_prijave enable row level security;
revoke all on table public.admin_prijave from public, anon, authenticated;

-- Vraća id pokušaja, ili null ako je limit prijeđen (tada se šifra uopće ne provjerava).
-- Limiti: 5 promašaja po otisku u 15 min, 30 promašaja ukupno u 1 h (štiti i od napada s mnogo IP-ova).
create or replace function public.admin_pokusaj(p_otisak text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
begin
  perform pg_advisory_xact_lock(hashtext('lakat_admin_prijava'));
  if (select count(*) from admin_prijave where not uspjeh and otisak = left(p_otisak, 64) and at > now() - interval '15 minutes') >= 5
     or (select count(*) from admin_prijave where not uspjeh and at > now() - interval '1 hour') >= 30 then
    return null;
  end if;
  insert into admin_prijave (otisak) values (left(p_otisak, 64)) returning id into v_id;
  delete from admin_prijave where at < now() - interval '30 days';
  return v_id;
end;
$$;

create or replace function public.admin_uspjeh(p_id bigint)
returns void
language sql
security definer
set search_path = public
as $$
  update admin_prijave set uspjeh = true where id = p_id;
$$;

revoke all on function public.admin_pokusaj(text) from public, anon, authenticated;
revoke all on function public.admin_uspjeh(bigint) from public, anon, authenticated;
grant execute on function public.admin_pokusaj(text) to service_role;
grant execute on function public.admin_uspjeh(bigint) to service_role;
