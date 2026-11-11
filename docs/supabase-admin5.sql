-- LAKAT /admin (11. 11., Codex Medium 1): zajednička brava od 30 promašaja/h omogućavala je da netko s 6 adresa
-- zaključa Petra vani. Sada: samo granica po adresi (5 u 15 min); blokirani pokušaji se i dalje zapisuju
-- (napadač ostaje zaključan dok pokušava), a nalet promašaja javlja se kao uzbuna na ploči, ne zaključava.
-- Aditivno i idempotentno; zamjenjuje admin_pokusaj iz supabase-admin2.sql.

create or replace function public.admin_pokusaj(p_otisak text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
  v_o text := left(p_otisak, 64);
begin
  perform pg_advisory_xact_lock(hashtext('lakat_admin_prijava'));
  if (select count(*) from admin_prijave where not uspjeh and otisak = v_o and at > now() - interval '15 minutes') >= 5 then
    insert into admin_prijave (otisak) values (v_o);
    return null;
  end if;
  insert into admin_prijave (otisak) values (v_o) returning id into v_id;
  delete from admin_prijave where at < now() - interval '30 days';
  return v_id;
end;
$$;

revoke all on function public.admin_pokusaj(text) from public, anon, authenticated;
grant execute on function public.admin_pokusaj(text) to service_role;
