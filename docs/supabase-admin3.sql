-- LAKAT /admin faza 1 (Petar 11. 11.): razdoblje 7/30/90 s usporedbom, segmenti, kohorte, lijevak, dan × sat,
-- kafići, pića, viralnost, značajke, zdravlje, moderacija, bodovi.
-- SAMO ZBROJEVI (pravilo 3.0). Skupina manja od 3 osobe vraća se kao null ("manje od 3") gdje bi se mogla prepoznati osoba.
-- Zove je samo server lakat-weba (service_role). Aditivno: admin_statistika (v1) ostaje dok stari kod ne ode s produkcije.
-- Dan = kalendarski dan u Zagrebu.

create or replace function public.admin_pregled(p_dana int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  n int := greatest(1, least(coalesce(p_dana, 30), 180));
  v_danas date := (now() at time zone 'Europe/Zagreb')::date;
  v_od date := v_danas - (n - 1);              -- tekuće razdoblje [v_od, v_danas]
  v_pod date := v_od - n;                      -- prethodno razdoblje [v_pod, v_od - 1]
  t_od timestamptz := (v_od::timestamp) at time zone 'Europe/Zagreb';
  t_pod timestamptz := (v_pod::timestamp) at time zone 'Europe/Zagreb';
  v_out jsonb;
begin
  with _akt(dan, user_id, izvor) as (
    select (checked_in_at at time zone 'Europe/Zagreb')::date, user_id, 'runda' from checkins where checked_in_at >= least(t_pod, now() - interval '100 days')
    union all select (pocetak at time zone 'Europe/Zagreb')::date, user_id, 'igra' from igra_partije where pocetak >= least(t_pod, now() - interval '100 days')
    union all select (created_at at time zone 'Europe/Zagreb')::date, user_id, 'app' from native_dogadaji where created_at >= least(t_pod, now() - interval '100 days')
    union all select (created_at at time zone 'Europe/Zagreb')::date, user_id, 'reakcija' from reactions where created_at >= least(t_pod, now() - interval '100 days')
    union all select (created_at at time zone 'Europe/Zagreb')::date, user_id, 'komentar' from comments where created_at >= least(t_pod, now() - interval '100 days')
  )
  select jsonb_build_object(
    'generirano', now(), 'danas', v_danas, 'dana', n, 'od', v_od, 'prije_od', v_pod,

    -- Ključne brojke: tekuće i prethodno razdoblje iste duljine
    'kpi', (select jsonb_object_agg(k, jsonb_build_object('sad', sad, 'prije', prije)) from (
      select 'aktivni' k,
        (select count(distinct user_id) from _akt where dan >= v_od) sad,
        (select count(distinct user_id) from _akt where dan >= v_pod and dan < v_od) prije
      union all select 'dau',
        (select round(count(*)::numeric / n, 1) from (select distinct dan, user_id from _akt where dan >= v_od) x),
        (select round(count(*)::numeric / n, 1) from (select distinct dan, user_id from _akt where dan >= v_pod and dan < v_od) x)
      union all select 'novi',
        (select count(*) from profiles where created_at >= t_od),
        (select count(*) from profiles where created_at >= t_pod and created_at < t_od)
      union all select 'runde',
        (select count(*) from checkins where cancelled_at is null and checked_in_at >= t_od),
        (select count(*) from checkins where cancelled_at is null and checked_in_at >= t_pod and checked_in_at < t_od)
      union all select 'partije',
        (select count(*) from igra_partije where pocetak >= t_od),
        (select count(*) from igra_partije where pocetak >= t_pod and pocetak < t_od)
      union all select 'reakcije',
        (select count(*) from reactions where created_at >= t_od),
        (select count(*) from reactions where created_at >= t_pod and created_at < t_od)
      union all select 'komentari',
        (select count(*) from comments where created_at >= t_od),
        (select count(*) from comments where created_at >= t_pod and created_at < t_od)
      union all select 'pajdastva',
        (select count(*) from friendships where status = 'accepted' and coalesce(responded_at, created_at) >= t_od),
        (select count(*) from friendships where status = 'accepted' and coalesce(responded_at, created_at) >= t_pod and coalesce(responded_at, created_at) < t_od)
      union all select 'sazivi',
        (select count(*) from sazivi where created_at >= t_od),
        (select count(*) from sazivi where created_at >= t_pod and created_at < t_od)
    ) kk),

    'ukupno', jsonb_build_object(
      'profili', (select count(*) from profiles),
      'aktivni_danas', (select count(distinct user_id) from _akt where dan = v_danas),
      'runde', (select count(*) from checkins where cancelled_at is null),
      'pajdastva', (select count(*) from friendships where status = 'accepted'),
      'ios_push', (select count(distinct user_id) from apns_tokens),
      'vani_sad', (select count(*) from vani where do_ is null or do_ > now())
    ),

    'dnevno', (select coalesce(jsonb_agg(jsonb_build_object(
        'dan', d.dan,
        'aktivni', (select count(distinct user_id) from _akt a where a.dan = d.dan),
        'novi', (select count(*) from profiles p where (p.created_at at time zone 'Europe/Zagreb')::date = d.dan),
        'runde', (select count(*) from checkins c where c.cancelled_at is null and (c.checked_in_at at time zone 'Europe/Zagreb')::date = d.dan),
        'partije', (select count(*) from igra_partije g where (g.pocetak at time zone 'Europe/Zagreb')::date = d.dan),
        'reakcije', (select count(*) from reactions r where (r.created_at at time zone 'Europe/Zagreb')::date = d.dan)
      ) order by d.dan), '[]'::jsonb)
      from (select generate_series(v_od, v_danas, interval '1 day')::date dan) d),

    -- Što ljudi rade: aktivni po vrsti radnje u razdoblju
    'aktivni_po_radnji', (select coalesce(jsonb_object_agg(izvor, u), '{}'::jsonb) from (
      select izvor, count(distinct user_id) u from _akt where dan >= v_od group by izvor) x),

    -- Kohorte: tjedni registracija (zadnjih 8), vratili se dan poslije, u 2. tjednu, oko 30. dana
    'kohorte', (select coalesce(jsonb_agg(jsonb_build_object('tjedan', tjedan, 'novi', novi, 'd1', d1, 'd7', d7, 'd30', d30) order by tjedan desc), '[]'::jsonb) from (
      select date_trunc('week', (p.created_at at time zone 'Europe/Zagreb'))::date tjedan,
        count(*) novi,
        case when max((p.created_at at time zone 'Europe/Zagreb')::date) + 1 <= v_danas then
          count(*) filter (where exists (select 1 from _akt a where a.user_id = p.id and a.dan = (p.created_at at time zone 'Europe/Zagreb')::date + 1)) end d1,
        case when min((p.created_at at time zone 'Europe/Zagreb')::date) + 13 <= v_danas then
          count(*) filter (where exists (select 1 from _akt a where a.user_id = p.id and a.dan between (p.created_at at time zone 'Europe/Zagreb')::date + 7 and (p.created_at at time zone 'Europe/Zagreb')::date + 13)) end d7,
        case when min((p.created_at at time zone 'Europe/Zagreb')::date) + 36 <= v_danas then
          count(*) filter (where exists (select 1 from _akt a where a.user_id = p.id and a.dan between (p.created_at at time zone 'Europe/Zagreb')::date + 30 and (p.created_at at time zone 'Europe/Zagreb')::date + 36)) end d30
      from profiles p
      where p.created_at >= now() - interval '8 weeks'
      group by 1) c),

    -- Lijevak u razdoblju: posjet → lista → registracija → prva runda → prvi pajdaš
    'lijevak', jsonb_build_object(
      'posjet', (select coalesce(sum(broj), 0) from web_koraci where korak = 'posjet' and dan >= v_od),
      'lista', (select count(*) from lista_cekanja where created_at >= t_od),
      'registracija', (select count(*) from profiles where created_at >= t_od),
      'prva_runda', (select count(*) from profiles p where p.created_at >= t_od and exists (select 1 from checkins c where c.user_id = p.id and c.cancelled_at is null)),
      'prvi_pajdas', (select count(*) from profiles p where p.created_at >= t_od and exists (select 1 from friendships f where f.status = 'accepted' and (f.requester = p.id or f.addressee = p.id)))
    ),

    -- Dan u tjednu × sat (Zagreb): runde i partije u razdoblju
    'sati', (select coalesce(jsonb_agg(jsonb_build_object('d', d, 'h', h, 'n', c)), '[]'::jsonb) from (
      select extract(isodow from t)::int d, extract(hour from t)::int h, count(*) c from (
        select checked_in_at at time zone 'Europe/Zagreb' t from checkins where cancelled_at is null and checked_in_at >= t_od
        union all select pocetak at time zone 'Europe/Zagreb' from igra_partije where pocetak >= t_od) x
      group by 1, 2) s),

    -- Segmenti (zbrojevi; manje od 3 osobe = null)
    'seg_kvart_runde', (with x as (
        select kvart_id, count(*) runde, count(distinct user_id) ljudi from checkins
        where cancelled_at is null and kvart_id is not null and checked_in_at >= t_od group by kvart_id)
      select coalesce(jsonb_agg(r order by (r->>'runde')::int desc), '[]'::jsonb) from (
        select jsonb_build_object('grad', k.grad, 'kvart', k.ime, 'runde', x.runde, 'ljudi', x.ljudi) r
          from x join kvartovi k on k.id = x.kvart_id where x.ljudi >= 3
        union all
        select jsonb_build_object('grad', null, 'kvart', 'Ostali kvartovi (' || count(*) || ')', 'runde', sum(x.runde), 'ljudi', null)
          from x where x.ljudi < 3 having count(*) > 0) y),
    'seg_ulaz', (select coalesce(jsonb_agg(jsonb_build_object('kljuc', kljuc, 'broj', b)), '[]'::jsonb) from (
      select kljuc, sum(broj) b from puls_brojac where kljuc like 'ulaz.%' and dan >= v_od group by kljuc) u),
    'seg_lista', jsonb_build_object(
      'kvart', (select coalesce(jsonb_agg(jsonb_build_object('grad', grad, 'kvart', kvart, 'broj', case when c < 3 then null else c end) order by c desc), '[]'::jsonb)
                from (select grad, kvart, count(*) c from lista_cekanja where kvart is not null group by 1, 2) l),
      'platforma', (select coalesce(jsonb_object_agg(coalesce(platforma, '—'), c), '{}'::jsonb) from (select platforma, count(*) c from lista_cekanja group by 1) l),
      'izvor', (select coalesce(jsonb_object_agg(coalesce(izvor, '—'), c), '{}'::jsonb) from (select izvor, count(*) c from lista_cekanja group by 1) l),
      'ukupno', (select count(*) from lista_cekanja),
      'potvrdeno', (select count(*) from lista_cekanja where potvrdeno_at is not null)
    ),

    -- Igre i push (razdoblje)
    'igre', (select coalesce(jsonb_agg(jsonb_build_object('igra', igra, 'partije', p, 'igraca', case when u < 3 then null else u end, 'prije', pp) order by p desc), '[]'::jsonb) from (
      select igra, count(*) filter (where pocetak >= t_od) p, count(distinct user_id) filter (where pocetak >= t_od) u,
             count(*) filter (where pocetak >= t_pod and pocetak < t_od) pp
      from igra_partije where pocetak >= t_pod group by igra) g where p > 0 or pp > 0),
    'puls', (select coalesce(jsonb_agg(jsonb_build_object('kljuc', kljuc, 'broj', b)), '[]'::jsonb) from (
      select kljuc, sum(broj) b from puls_brojac where dan >= v_od group by kljuc) p),
    'puls_od', (select min(dan) from puls_brojac),
    'web', (select coalesce(jsonb_agg(jsonb_build_object('korak', korak, 'broj', b)), '[]'::jsonb) from (
      select korak, sum(broj) b from web_koraci where dan >= v_od group by korak) w),

    -- Kafići (imena tvrtki, ne osoba); manje od 3 gosta = null
    'kafici', (select coalesce(jsonb_agg(jsonb_build_object('kafic', k.name, 'partner', k.partner, 'runde', x.r,
        'gostiju', case when x.u < 3 then null else x.u end) order by x.r desc), '[]'::jsonb) from (
      select kafic_id, count(*) r, count(distinct user_id) u from checkins
      where cancelled_at is null and kafic_id is not null and checked_in_at >= t_od group by kafic_id) x join kafici k on k.id = x.kafic_id),

    'pica', (select coalesce(jsonb_agg(jsonb_build_object('vrsta', drink_type, 'broj', c) order by c desc), '[]'::jsonb) from (
      select drink_type, count(*) c from drinks where logged_at >= t_od group by 1) d),

    'viralnost', jsonb_build_object(
      'linkovi', (select count(*) from pozivnice where created_at >= t_od),
      'iskoristeni', (select count(*) from pozivnica_upotrebe where at >= t_od),
      'pajdasi_medijan', (select percentile_cont(0.5) within group (order by c) from (
        select p.id, count(f.id) c from profiles p left join friendships f on f.status = 'accepted' and (f.requester = p.id or f.addressee = p.id) group by p.id) z),
      'pajdasi_p90', (select percentile_cont(0.9) within group (order by c) from (
        select p.id, count(f.id) c from profiles p left join friendships f on f.status = 'accepted' and (f.requester = p.id or f.addressee = p.id) group by p.id) z)
    ),

    'znacajke', jsonb_build_object(
      'runde', (select count(*) from checkins where cancelled_at is null and checked_in_at >= t_od),
      'druga_fotka', (select count(*) from checkins where cancelled_at is null and druga_url is not null and checked_in_at >= t_od),
      'sad_ili_nikad', (select count(*) from checkins where cancelled_at is null and sad_ili_nikad and checked_in_at >= t_od),
      'javne', (select count(*) from checkins where cancelled_at is null and javna and checked_in_at >= t_od),
      'video', (select count(*) from checkins where cancelled_at is null and video_url is not null and checked_in_at >= t_od),
      'u_kaficu', (select count(*) from checkins where cancelled_at is null and kafic_id is not null and checked_in_at >= t_od),
      'sazivi', (select count(*) from sazivi where created_at >= t_od),
      'odazivi', (select count(*) from saziv_odazivi where responded_at >= t_od),
      'laktovi', (select count(*) from lakat_signali where created_at >= t_od),
      'pokazi', (select count(*) from pokazi_zahtjevi where created_at >= t_od),
      'krigle', (select count(*) from krigla_nalazi where nadjena_at >= t_od)
    ),

    'zdravlje', jsonb_build_object(
      'push_greske', (select count(*) from token_promasaji where at >= t_od),
      'push_greske_prije', (select count(*) from token_promasaji where at >= t_pod and at < t_od),
      'apple_opozivi_cekaju', (select count(*) from apple_opozivi),
      'ios_uredaji', (select count(*) from apns_tokens),
      'web_push', (select count(*) from push_subscriptions)
    ),

    'moderacija', jsonb_build_object(
      'prijave', (select count(*) from prijave where created_at >= t_od),
      'cekaju', (select count(*) from prijave where rijeseno_at is null),
      'blokade', (select count(*) from blokade where created_at >= t_od)
    ),

    'bodovi', jsonb_build_object(
      'zaradeno', (select coalesce(sum(iznos), 0) from bod_transakcije where iznos > 0 and created_at >= t_od),
      'potroseno', (select coalesce(-sum(iznos), 0) from bod_transakcije where iznos < 0 and created_at >= t_od),
      'kupnje', (select coalesce(jsonb_agg(jsonb_build_object('artikl', a.naziv, 'broj', b.c) order by b.c desc), '[]'::jsonb) from (
        select artikl, count(*) c from bod_transakcije where artikl is not null and created_at >= t_od group by artikl) b join ducan_artikli a on a.kljuc = b.artikl),
      'zadaci', (select count(*) from zadaci_pokupljeni where created_at >= t_od)
    )
  ) into v_out;
  return v_out;
end;
$$;

revoke all on function public.admin_pregled(int) from public, anon, authenticated;
grant execute on function public.admin_pregled(int) to service_role;
