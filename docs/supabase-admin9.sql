-- LAKAT /admin faza 3 (Petar 12. 11.): 2FA. Isti kod se ne smije iskoristiti dvaput (korak = 30-sekundni prozor),
-- i ploča pokazuje zadnje prijave (vrijeme, uspjeh, skraćeni otisak IP-a). Samo service_role. Aditivno, idempotentno.

alter table public.admin_prijave add column if not exists korak bigint;

-- Uspjeh s 2FA: označi pokušaj uspješnim samo ako taj korak još nije iskorišten. Vraća true/false.
create or replace function public.admin_uspjeh2(p_id bigint, p_korak bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtext('lakat_admin_prijava'));
  if p_korak is not null and exists (select 1 from admin_prijave where uspjeh and korak = p_korak) then
    return false;
  end if;
  update admin_prijave set uspjeh = true, korak = p_korak where id = p_id;
  return found;
end;
$$;

-- Zadnjih 20 pokušaja za ploču: bez IP-a, samo prvih 6 znakova otiska.
create or replace function public.admin_prijave_zadnje()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object('at', at, 'uspjeh', uspjeh, 'otisak', left(otisak, 6), 'dvafa', korak is not null) order by at desc), '[]'::jsonb)
  from (select * from admin_prijave order by at desc limit 20) z;
$$;

revoke all on function public.admin_uspjeh2(bigint, bigint) from public, anon, authenticated;
revoke all on function public.admin_prijave_zadnje() from public, anon, authenticated;
grant execute on function public.admin_uspjeh2(bigint, bigint) to service_role;
grant execute on function public.admin_prijave_zadnje() to service_role;
