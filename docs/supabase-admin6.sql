-- LAKAT /admin runda 2 (Petar 11. 11.): niz po danima za bilo koje razdoblje (duh prošlog razdoblja, mini grafovi)
-- i detalji jednog dana (ladica). SAMO ZBROJEVI. Zove samo server (service_role). Aditivno i idempotentno.

create or replace function public.admin_dnevno(p_od date, p_do date)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with d as (
    select generate_series(greatest(p_od, p_do - 370), p_do, interval '1 day')::date dan
  ),
  akt as (
    select (checked_in_at at time zone 'Europe/Zagreb')::date dan, user_id from checkins where checked_in_at >= (p_od::timestamp at time zone 'Europe/Zagreb') - interval '1 day'
    union all select (pocetak at time zone 'Europe/Zagreb')::date, user_id from igra_partije where pocetak >= (p_od::timestamp at time zone 'Europe/Zagreb') - interval '1 day'
    union all select (created_at at time zone 'Europe/Zagreb')::date, user_id from native_dogadaji where created_at >= (p_od::timestamp at time zone 'Europe/Zagreb') - interval '1 day'
    union all select (created_at at time zone 'Europe/Zagreb')::date, user_id from reactions where created_at >= (p_od::timestamp at time zone 'Europe/Zagreb') - interval '1 day'
    union all select (created_at at time zone 'Europe/Zagreb')::date, user_id from comments where created_at >= (p_od::timestamp at time zone 'Europe/Zagreb') - interval '1 day'
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'dan', d.dan,
    'aktivni', (select count(distinct user_id) from akt where akt.dan = d.dan),
    'novi', (select count(*) from profiles p where (p.created_at at time zone 'Europe/Zagreb')::date = d.dan),
    'runde', (select count(*) from checkins c where c.cancelled_at is null and (c.checked_in_at at time zone 'Europe/Zagreb')::date = d.dan),
    'partije', (select count(*) from igra_partije g where (g.pocetak at time zone 'Europe/Zagreb')::date = d.dan),
    'reakcije', (select count(*) from reactions r where (r.created_at at time zone 'Europe/Zagreb')::date = d.dan),
    'komentari', (select count(*) from comments k where (k.created_at at time zone 'Europe/Zagreb')::date = d.dan),
    'pajdastva', (select count(*) from friendships f where f.status = 'accepted' and (coalesce(f.responded_at, f.created_at) at time zone 'Europe/Zagreb')::date = d.dan)
  ) order by d.dan), '[]'::jsonb)
  from d;
$$;

-- Jedan dan: zbrojevi, sati, igre i push tog dana. Igre s manje od 3 igrača ne pokazuju broj igrača.
create or replace function public.admin_dan(p_dan date)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with t as (select (p_dan::timestamp at time zone 'Europe/Zagreb') od, ((p_dan + 1)::timestamp at time zone 'Europe/Zagreb') do_)
  select jsonb_build_object(
    'dan', p_dan,
    'runde', (select count(*) from checkins, t where cancelled_at is null and checked_in_at >= t.od and checked_in_at < t.do_),
    'partije', (select count(*) from igra_partije, t where pocetak >= t.od and pocetak < t.do_),
    'novi', (select count(*) from profiles, t where created_at >= t.od and created_at < t.do_),
    'reakcije', (select count(*) from reactions, t where created_at >= t.od and created_at < t.do_),
    'komentari', (select count(*) from comments, t where created_at >= t.od and created_at < t.do_),
    'pajdastva', (select count(*) from friendships, t where status = 'accepted' and coalesce(responded_at, created_at) >= t.od and coalesce(responded_at, created_at) < t.do_),
    'sati', (select coalesce(jsonb_agg(jsonb_build_object('h', h, 'n', n) order by h), '[]'::jsonb) from (
       select extract(hour from x at time zone 'Europe/Zagreb')::int h, count(*) n from (
         select checked_in_at x from checkins, t where cancelled_at is null and checked_in_at >= t.od and checked_in_at < t.do_
         union all select pocetak from igra_partije, t where pocetak >= t.od and pocetak < t.do_) q group by 1) s),
    'igre', (select coalesce(jsonb_agg(jsonb_build_object('igra', igra, 'partije', n) order by n desc), '[]'::jsonb) from (
       select igra, count(*) n from igra_partije, t where pocetak >= t.od and pocetak < t.do_ group by 1) g),
    'push', (select coalesce(jsonb_agg(jsonb_build_object('kljuc', kljuc, 'broj', broj)), '[]'::jsonb) from puls_brojac where dan = p_dan)
  );
$$;

revoke all on function public.admin_dnevno(date, date) from public, anon, authenticated;
revoke all on function public.admin_dan(date) from public, anon, authenticated;
grant execute on function public.admin_dnevno(date, date) to service_role;
grant execute on function public.admin_dan(date) to service_role;
