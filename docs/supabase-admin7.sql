-- LAKAT /admin Instagram (Petar 11. 11.): dnevna snimka @lakat_app (pratitelji, objave), jer Meta ne daje povijest.
-- Javni brojevi vlastitog poslovnog računa, bez ikakvih podataka o pratiteljima. Samo service_role. Idempotentno.

create table if not exists public.admin_ig_dnevno (
  dan date primary key,
  pratitelji integer not null,
  objave integer not null,
  at timestamptz not null default now()
);
alter table public.admin_ig_dnevno enable row level security;
revoke all on table public.admin_ig_dnevno from public, anon, authenticated;

-- Upiše današnju snimku (zadnja vrijednost dana pobjeđuje) i vrati zadnjih 120 dana.
create or replace function public.admin_ig_snimka(p_pratitelji int, p_objave int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dan date := (now() at time zone 'Europe/Zagreb')::date;
begin
  if p_pratitelji is not null and p_pratitelji >= 0 and p_objave is not null and p_objave >= 0 then
    insert into admin_ig_dnevno (dan, pratitelji, objave, at) values (v_dan, p_pratitelji, p_objave, now())
    on conflict (dan) do update set pratitelji = excluded.pratitelji, objave = excluded.objave, at = excluded.at;
  end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('dan', dan, 'pratitelji', pratitelji, 'objave', objave) order by dan), '[]'::jsonb)
          from admin_ig_dnevno where dan > v_dan - 120);
end;
$$;

revoke all on function public.admin_ig_snimka(int, int) from public, anon, authenticated;
grant execute on function public.admin_ig_snimka(int, int) to service_role;
