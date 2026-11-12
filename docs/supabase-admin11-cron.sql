-- LAKAT /admin faza U: pg_cron svakih 5 min zove laktarenje.com/admin/provjera s tajnom iz Vaulta (pg_net).
-- Pokrenuti TEK kad je ruta /admin/provjera uživo. Idempotentno (unschedule prije schedule).
select cron.unschedule('lakat_admin_uzbune') where exists (select 1 from cron.job where jobname = 'lakat_admin_uzbune');
select cron.schedule('lakat_admin_uzbune', '*/5 * * * *', $job$
  select net.http_post(
    url := 'https://laktarenje.com/admin/provjera',
    headers := jsonb_build_object('content-type', 'application/json',
      'x-uzbune-tajna', (select decrypted_secret from vault.decrypted_secrets where name = 'uzbune_tajna')),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
$job$);
