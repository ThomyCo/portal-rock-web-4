# Operación de noticias y conciertos

## Variables privadas

Obtén una clave de Ticketmaster Discovery API y genera un secreto largo y aleatorio para el programador. En local colócalos en `supabase/functions/.env`:

```dotenv
TICKETMASTER_API_KEY=tu_clave
SYNC_CONTENT_SECRET=tu_secreto_aleatorio
```

Estas variables son del servidor. Nunca uses los prefijos `VITE_TICKETMASTER` o `VITE_SYNC_CONTENT`.

## Preparar Supabase alojado

```powershell
npx supabase secrets set TICKETMASTER_API_KEY=tu_clave SYNC_CONTENT_SECRET=tu_secreto
npx supabase db push --include-seed
npx supabase functions deploy sync-rock-content --no-verify-jwt
```

En el editor SQL de Supabase guarda las dos entradas que consume Cron:

```sql
select vault.create_secret('https://IDENTIFICADOR.supabase.co', 'project_url');
select vault.create_secret('EL_MISMO_SECRETO', 'sync_content_secret');
```

Revisa en `rock_news_sources` que las fuentes iniciales sigan publicando RSS y que sus condiciones permitan mostrar título, resumen, imagen y enlace. Desactiva cualquier fuente dudosa antes de la primera sincronización.

## Primera ejecución y diagnóstico

Desde el panel administrativo usa **Sincronizar ahora**. Después consulta `content_sync_runs`: debe existir un registro final `succeeded` o `partial`, con conteos y advertencias sin claves. Revisa también `rock_news_sources.last_success_at` y `last_error`.

Comprueba el trabajo programado:

```sql
select jobname, schedule, active from cron.job where jobname = 'sync-rock-content-every-6-hours';
select * from cron.job_run_details order by start_time desc limit 10;
```

Una respuesta `409` significa que hay otra ejecución activa. Un `429` de Ticketmaster indica cuota temporal; el portal conserva los últimos datos válidos.

## Rotar el secreto

Actualiza `SYNC_CONTENT_SECRET` en los secretos de la función y sustituye el valor `sync_content_secret` de Vault en la misma operación. Ejecuta una sincronización manual después de rotarlo.

## Desactivar o recuperar

Para detener las ejecuciones sin borrar contenido:

```sql
select cron.unschedule('sync-rock-content-every-6-hours');
```

Para recuperarlo, vuelve a aplicar `202610210008_news_events_cron.sql`. Si una fuente falla repetidamente, establece `active=false`; las demás fuentes continuarán procesándose.
