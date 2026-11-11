-- LAKAT /admin: zdravlje baze (Petar 11. 11., „sve na jednom mjestu").
-- Samo brojke o samoj bazi: veličina, tablice, spajanja, cache, pohrana po bucketu, broj računa. Nikakav sadržaj.
-- Zove je samo server lakat-weba (service_role). Aditivno i idempotentno.

create or replace function public.admin_baza()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select jsonb_build_object(
    'generirano', now(),
    'baza_b', pg_database_size(current_database()),
    'spajanja', (select count(*) from pg_stat_activity where datname = current_database()),
    'spajanja_aktivna', (select count(*) from pg_stat_activity where datname = current_database() and state = 'active' and backend_type = 'client backend'),
    'spajanja_max', (select setting::int from pg_settings where name = 'max_connections'),
    'cache_pct', (select round(100.0 * sum(blks_hit) / nullif(sum(blks_hit) + sum(blks_read), 0), 2) from pg_stat_database where datname = current_database()),
    -- Najdulji upit klijenta koji stvarno radi (ne čeka na klijenta; realtime i replikacija isključeni).
    'najduzi_upit_s', (select coalesce(max(extract(epoch from now() - query_start)), 0)::int from pg_stat_activity
                       where datname = current_database() and state = 'active' and backend_type = 'client backend'
                         and coalesce(wait_event_type, '') <> 'Client' and query not ilike '%START_REPLICATION%' and pid <> pg_backend_pid()),
    'deadlockovi', (select deadlocks from pg_stat_database where datname = current_database()),
    'auth_racuni', (select count(*) from auth.users),
    'admin_promasaji_1h', (select count(*) from admin_prijave where not uspjeh and at > now() - interval '1 hour'),
    'pohrana', (select coalesce(jsonb_agg(jsonb_build_object('bucket', bucket_id, 'datoteka', n, 'b', b) order by b desc), '[]'::jsonb)
                from (select bucket_id, count(*) n, sum(coalesce((metadata->>'size')::bigint, 0)) b from storage.objects group by 1) s),
    'pohrana_7d_b', (select coalesce(sum(coalesce((metadata->>'size')::bigint, 0)), 0) from storage.objects where created_at > now() - interval '7 days'),
    'tablice', (select coalesce(jsonb_agg(jsonb_build_object('tablica', relname, 'b', b, 'redaka', n_live_tup, 'mrtvih', n_dead_tup) order by b desc), '[]'::jsonb)
                from (select relname, pg_total_relation_size(relid) b, n_live_tup, n_dead_tup from pg_stat_user_tables where schemaname = 'public' order by 2 desc limit 8) t)
  );
$$;

revoke all on function public.admin_baza() from public, anon, authenticated;
grant execute on function public.admin_baza() to service_role;
