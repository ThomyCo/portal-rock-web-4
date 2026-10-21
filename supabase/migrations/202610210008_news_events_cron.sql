create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

do $$
begin
  if exists(select 1 from cron.job where jobname = 'sync-rock-content-every-6-hours') then
    perform cron.unschedule('sync-rock-content-every-6-hours');
  end if;
end $$;

select cron.schedule(
  'sync-rock-content-every-6-hours',
  '0 */6 * * *',
  $cron$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/sync-rock-content',
      headers := jsonb_build_object(
        'content-type', 'application/json',
        'x-sync-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'sync_content_secret')
      ),
      body := '{"triggerKind":"cron"}'::jsonb
    );
  $cron$
);
