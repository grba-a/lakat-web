-- LAKAT /admin (laktarenje.com/admin, Petar 11. 11.): sve brojke kontrolne ploče u jednom pozivu.
-- SAMO ZBROJEVI (pravilo 3.0): nijedno ime, slika, lokacija ni poruka ne izlazi iz funkcije.
-- Zove je samo server lakat-weba tajnim ključem (service_role); anon i authenticated je ne smiju zvati.
-- Aditivno i idempotentno: pokreće Petar u SQL editoru, PROD (lista čekanja i web koraci postoje samo ondje).
-- Dan = kalendarski dan u Zagrebu.

create or replace function public.admin_statistika(p_dana int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_danas date := (now() at time zone 'Europe/Zagreb')::date;
  v_od date := v_danas - (greatest(1, least(p_dana, 120)) - 1);
  v_out jsonb;
begin
  with aktivnost as (
    select (checked_in_at at time zone 'Europe/Zagreb')::date dan, user_id from checkins where checked_in_at >= now() - interval '121 days'
    union all select (pocetak at time zone 'Europe/Zagreb')::date, user_id from igra_partije where pocetak >= now() - interval '121 days'
    union all select (created_at at time zone 'Europe/Zagreb')::date, user_id from native_dogadaji where created_at >= now() - interval '121 days'
    union all select (created_at at time zone 'Europe/Zagreb')::date, user_id from reactions where created_at >= now() - interval '121 days'
    union all select (created_at at time zone 'Europe/Zagreb')::date, user_id from comments where created_at >= now() - interval '121 days'
  ),
  dani as (select generate_series(v_od, v_danas, interval '1 day')::date dan),
  dnevno as (
    select d.dan,
      (select count(*) from profiles p where (p.created_at at time zone 'Europe/Zagreb')::date = d.dan) novi,
      (select count(*) from checkins c where (c.checked_in_at at time zone 'Europe/Zagreb')::date = d.dan and c.cancelled_at is null) runde,
      (select count(distinct a.user_id) from aktivnost a where a.dan = d.dan) aktivni,
      (select count(*) from igra_partije g where (g.pocetak at time zone 'Europe/Zagreb')::date = d.dan) partije,
      (select count(*) from reactions r where (r.created_at at time zone 'Europe/Zagreb')::date = d.dan) reakcije
    from dani d
  )
  select jsonb_build_object(
    'generirano', now(),
    'danas', v_danas,
    'dnevno', (select coalesce(jsonb_agg(to_jsonb(dnevno) order by dan), '[]'::jsonb) from dnevno),
    'ukupno', jsonb_build_object(
      'profili', (select count(*) from profiles),
      'aktivni_danas', (select count(distinct user_id) from aktivnost where dan = v_danas),
      'aktivni_7d', (select count(distinct user_id) from aktivnost where dan > v_danas - 7),
      'aktivni_30d', (select count(distinct user_id) from aktivnost where dan > v_danas - 30),
      'runde', (select count(*) from checkins where cancelled_at is null),
      'pajdastva', (select count(*) from friendships where status = 'accepted'),
      'sazivi', (select count(*) from sazivi),
      'komentari', (select count(*) from comments),
      'ios_push', (select count(distinct user_id) from apns_tokens),
      'vani_sad', (select count(*) from vani where do_ is null or do_ > now())
    ),
    'igre', (select coalesce(jsonb_agg(jsonb_build_object('igra', igra, 'partije', n, 'partije_7d', n7, 'igraca', u) order by n7 desc), '[]'::jsonb)
             from (select igra, count(*) n, count(*) filter (where pocetak > now() - interval '7 days') n7, count(distinct user_id) u
                   from igra_partije group by igra) g),
    'puls', (select coalesce(jsonb_agg(jsonb_build_object('kljuc', kljuc, 'broj', n, 'broj_7d', n7)), '[]'::jsonb)
             from (select kljuc, sum(broj) n, sum(broj) filter (where dan > v_danas - 7) n7 from puls_brojac group by kljuc) p),
    'puls_od', (select min(dan) from puls_brojac),
    'web', (select coalesce(jsonb_agg(jsonb_build_object('korak', korak, 'broj', n)), '[]'::jsonb)
            from (select korak, sum(broj) n from web_koraci group by korak) w),
    'web_od', (select min(dan) from web_koraci),
    'lista', jsonb_build_object(
      'ukupno', (select count(*) from lista_cekanja),
      'potvrdeno', (select count(*) from lista_cekanja where potvrdeno_at is not null),
      'iphone', (select count(*) from lista_cekanja where platforma = 'iphone'),
      'android', (select count(*) from lista_cekanja where platforma = 'android')
    )
  ) into v_out;
  return v_out;
end;
$$;

revoke all on function public.admin_statistika(int) from public, anon, authenticated;
grant execute on function public.admin_statistika(int) to service_role;
