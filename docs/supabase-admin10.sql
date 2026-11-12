-- LAKAT /admin faza 3b (Petar 12. 11.): popis liste čekanja za /admin/lista (iza šifre i 2FA). Samo service_role.
-- Bez tokena i ref kodova. Svrha: pregled i izvoz potvrđenih za mail o izlasku. (Pušteno na PROD 12. 11.)
create or replace function public.admin_lista()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'email', email, 'ime', ime, 'grad', grad, 'kvart', kvart, 'platforma', platforma, 'izvor', izvor,
    'potvrdeno', potvrdeno_at, 'upisan', created_at) order by created_at desc), '[]'::jsonb)
  from lista_cekanja;
$$;
revoke all on function public.admin_lista() from public, anon, authenticated;
grant execute on function public.admin_lista() to service_role;
