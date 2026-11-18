-- LAKAT /admin, glavni broj (Petar 18. 11. 2026): „izlasci s ekipom“ i tjedni ritam.
-- Izlazak s ekipom = osoba + lakat-noć (dan počinje u 06:00 po Zagrebu) u kojoj je objavila rundu, a iste noći je vani
-- bio i bar jedan njezin prihvaćeni pajdaš. To je ono zbog čega LAKAT postoji: da nitko ne izlazi sam.
-- SAMO ZBROJEVI (pravilo 3.0): funkcija ne vraća nijedan ID, ime ni lokaciju. Aditivno i idempotentno, samo service_role.

create or replace function public.admin_glavni(p_tjedana int default 8)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with granice as (
    select
      ((now() at time zone 'Europe/Zagreb') - interval '6 hours')::date as danas,
      date_trunc('week', ((now() at time zone 'Europe/Zagreb') - interval '6 hours')::date)::date as ovaj_tjedan,
      least(greatest(coalesce(p_tjedana, 8), 2), 26) as n
  ),
  noci as (
    select distinct c.user_id, ((c.checked_in_at at time zone 'Europe/Zagreb') - interval '6 hours')::date as noc
    from public.checkins c, granice g
    where c.cancelled_at is null
      and c.checked_in_at >= ((g.ovaj_tjedan - (g.n - 1) * 7) + time '06:00') at time zone 'Europe/Zagreb'
  ),
  s_ekipom as (
    select n.user_id, n.noc
    from noci n
    where exists (
      select 1
      from noci m
      join public.friendships f
        on f.status = 'accepted'
       and ((f.requester = n.user_id and f.addressee = m.user_id) or (f.addressee = n.user_id and f.requester = m.user_id))
      where m.noc = n.noc
    )
  ),
  tjedni as (
    select t.tjedan,
      (select count(*) from s_ekipom e where date_trunc('week', e.noc)::date = t.tjedan) as izlasci,
      (select count(distinct e.user_id) from s_ekipom e where date_trunc('week', e.noc)::date = t.tjedan) as ljudi,
      (select count(*) from noci x where date_trunc('week', x.noc)::date = t.tjedan) as vani
    from granice g, generate_series(g.ovaj_tjedan - (g.n - 1) * 7, g.ovaj_tjedan, interval '7 days') as s(d)
    cross join lateral (select s.d::date as tjedan) t
  ),
  -- Ritam: prosjek izlazaka s ekipom po danu u tjednu, iz punih tjedana u kojima se izlazilo (tekući je nedovršen,
  -- a prazni tjedni, npr. lockdown u listopadu, srušili bi prosjek).
  ritam as (
    select d.dow,
      round(coalesce((select count(*) from s_ekipom e, granice g
                      where extract(isodow from e.noc) = d.dow and e.noc < g.ovaj_tjedan), 0)::numeric
            / greatest((select count(*) from tjedni t, granice g where t.tjedan < g.ovaj_tjedan and t.vani > 0), 1), 1) as prosjek
    from generate_series(1, 7) as d(dow)
  )
  select jsonb_build_object(
    'danas', (select danas from granice),
    'ovaj_tjedan', (select ovaj_tjedan from granice),
    'tjedni', coalesce((select jsonb_agg(jsonb_build_object('tjedan', tjedan, 'izlasci', izlasci, 'ljudi', ljudi, 'vani', vani) order by tjedan) from tjedni), '[]'::jsonb),
    'ritam', coalesce((select jsonb_agg(jsonb_build_object('dan', dow, 'prosjek', prosjek) order by dow) from ritam), '[]'::jsonb),
    -- Do danas u tekućem tjednu i isti broj dana prošli tjedan, da usporedba bude poštena usred tjedna.
    'do_danas', (select count(*) from s_ekipom e, granice g where e.noc >= g.ovaj_tjedan),
    'do_danas_prije', (select count(*) from s_ekipom e, granice g where e.noc >= g.ovaj_tjedan - 7 and e.noc <= g.danas - 7)
  );
$$;
revoke all on function public.admin_glavni(int) from public, anon, authenticated;
grant execute on function public.admin_glavni(int) to service_role;
