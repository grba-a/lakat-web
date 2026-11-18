-- LAKAT /admin, zdravlje cronova (Petar 18. 11. 2026: „ploču ćemo dovršiti danas“).
-- Svaki posao koji radi sam (Vercel cron u lakat-pwa i lakat-web, ruta /admin/provjera) javi „otkucaj“ kad završi.
-- Ploča i uzbune iz ovoga vide koji posao kasni ili pada; pas čuvar u lakat-pwa vidi ako sama provjera utihne.
-- Aditivno i idempotentno. Samo service_role; nema osobnih podataka (ime posla, vremena, kratka greška).

create table if not exists public.admin_otkucaji (
  posao text primary key,
  zadnji_ok timestamptz,
  zadnja_greska timestamptz,
  greska text,
  broj_ok bigint not null default 0,
  broj_gresaka bigint not null default 0
);
alter table public.admin_otkucaji enable row level security;
revoke all on table public.admin_otkucaji from public, anon, authenticated;

create or replace function public.admin_otkucaj(p_posao text, p_ok boolean, p_greska text default null)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.admin_otkucaji as o (posao, zadnji_ok, zadnja_greska, greska, broj_ok, broj_gresaka)
  values (
    left(p_posao, 64),
    case when p_ok then now() end,
    case when not p_ok then now() end,
    case when not p_ok then left(coalesce(p_greska, 'greska'), 300) end,
    case when p_ok then 1 else 0 end,
    case when p_ok then 0 else 1 end
  )
  on conflict (posao) do update set
    zadnji_ok = coalesce(excluded.zadnji_ok, o.zadnji_ok),
    zadnja_greska = coalesce(excluded.zadnja_greska, o.zadnja_greska),
    greska = coalesce(excluded.greska, o.greska),
    broj_ok = o.broj_ok + excluded.broj_ok,
    broj_gresaka = o.broj_gresaka + excluded.broj_gresaka;
$$;
revoke all on function public.admin_otkucaj(text, boolean, text) from public, anon, authenticated;
grant execute on function public.admin_otkucaj(text, boolean, text) to service_role;

-- Jedan pogled za ploču: pg_cron poslovi (zadnja vožnja, greške 24 h), pg_net odgovori 24 h i otkucaji.
-- Napomena: pg_cron „succeeded“ znači samo da je HTTP poziv poslan (pg_net je asinkron); stvarni ishod rute je otkucaj.
create or replace function public.admin_cronovi()
returns jsonb
language sql
stable
security definer
set search_path = public, cron, net
as $$
  select jsonb_build_object(
    'pg', coalesce((
      select jsonb_agg(jsonb_build_object(
        'posao', j.jobname,
        'raspored', j.schedule,
        'aktivan', j.active,
        'zadnji', z.zadnji,
        'zadnji_status', z.status,
        'zadnji_ok', z.zadnji_ok,
        'greske_24h', z.greske_24h,
        'ok_24h', z.ok_24h
      ) order by j.jobname)
      from cron.job j
      cross join lateral (
        select
          max(d.start_time) as zadnji,
          max(d.start_time) filter (where d.status = 'succeeded') as zadnji_ok,
          count(*) filter (where d.status = 'failed' and d.start_time > now() - interval '24 hours') as greske_24h,
          count(*) filter (where d.status = 'succeeded' and d.start_time > now() - interval '24 hours') as ok_24h,
          (array_agg(d.status order by d.start_time desc))[1] as status
        from cron.job_run_details d
        where d.jobid = j.jobid and d.start_time > now() - interval '8 days'
      ) z
    ), '[]'::jsonb),
    'http', (
      select jsonb_build_object(
        'ok', count(*) filter (where r.status_code between 200 and 299),
        'greske', count(*) filter (where r.status_code is null or r.status_code >= 300)
      )
      from net._http_response r
      where r.created > now() - interval '24 hours'
    ),
    'otkucaji', coalesce((select jsonb_agg(to_jsonb(o) order by o.posao) from public.admin_otkucaji o), '[]'::jsonb),
    'sad', now()
  );
$$;
revoke all on function public.admin_cronovi() from public, anon, authenticated;
grant execute on function public.admin_cronovi() to service_role;
