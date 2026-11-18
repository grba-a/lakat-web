-- LAKAT /admin, put do 1.000 po gradu (Petar 18. 11. 2026): koliko je ljudi u kojem gradu blizu kritične mase.
-- Po gradu: prijave na listu čekanja (web) i ljudi koji su objavili rundu u kvartu tog grada (aplikacija, 30 dana i ukupno).
-- SAMO ZBROJEVI; broj manji od 3 vraća se kao null (prag anonimnosti, isti kao u admin_pregled). Samo service_role.

create or replace function public.admin_gradovi()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with app as (
    select k.grad,
      count(distinct c.user_id) filter (where c.checked_in_at >= now() - interval '30 days') as ljudi_30d,
      count(distinct c.user_id) as ljudi_sve
    from public.checkins c
    join public.kvartovi k on k.id = c.kvart_id
    where c.cancelled_at is null and k.grad is not null
    group by k.grad
  ),
  lista as (
    select grad, count(*) as prijave
    from public.lista_cekanja
    where grad is not null and grad <> 'Drugo'
    group by grad
  ),
  gradovi as (
    select coalesce(a.grad, l.grad) as grad, coalesce(a.ljudi_30d, 0) as ljudi_30d, coalesce(a.ljudi_sve, 0) as ljudi_sve, coalesce(l.prijave, 0) as prijave
    from app a full join lista l on l.grad = a.grad
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'grad', grad,
      'ljudi_30d', case when ljudi_30d < 3 then null else ljudi_30d end,
      'ljudi_sve', case when ljudi_sve < 3 then null else ljudi_sve end,
      'prijave', case when prijave < 3 then null else prijave end
    ) order by greatest(ljudi_sve, prijave) desc, grad), '[]'::jsonb)
  from gradovi;
$$;
revoke all on function public.admin_gradovi() from public, anon, authenticated;
grant execute on function public.admin_gradovi() to service_role;
