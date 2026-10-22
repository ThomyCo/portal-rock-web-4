# Portal Rock Web 4.0

## Perfiles enriquecidos de bandas

Los perfiles públicos guardan biografías originales e imágenes con atribución en Supabase. Para regenerar la migración desde el manifiesto revisado, define `ADMIN_CONTACT` y ejecuta `npm run content:bands`; revisa el reporte antes de publicar y luego aplica `npx supabase db push`.

Aplicación contemporánea para explorar el origen geográfico de bandas, guardar favoritas y conversar en comunidad. Usa React, TypeScript, MapLibre, OpenFreeMap y Supabase con PostgreSQL/PostGIS.

La portada funciona como un periódico musical: muestra noticias aprobadas y conciertos de México antes de una selección internacional. Una Edge Function importa Ticketmaster y fuentes RSS cada seis horas; el panel editorial permite revisar noticias, ocultar eventos y consultar las ejecuciones.

## Ejecutar en la computadora

Requisitos: Node.js indicado en `.nvmrc`, npm, Docker Desktop, Deno y Supabase CLI.

```powershell
npm install
Copy-Item .env.example .env.local
npx supabase start
npx supabase db reset
npm run dev -- --host 0.0.0.0
```

Abre `http://localhost:5173`. Desde un celular en la misma red, abre `http://IP-DE-TU-PC:5173` y permite el puerto 5173 en el firewall de Windows.

Sin Supabase configurado, la portada, el mapa, las 12 bandas y las publicaciones de muestra funcionan en modo demostración. Registro, favoritos, publicación, sincronización y administración requieren Supabase.

## Activar noticias y conciertos

1. Crea una aplicación en Ticketmaster Developer y copia su Consumer Key.
2. Configura `TICKETMASTER_API_KEY` y un `SYNC_CONTENT_SECRET` aleatorio como secretos de Supabase.
3. Guarda `project_url` y `sync_content_secret` en Supabase Vault.
4. Aplica las migraciones y las fuentes iniciales con `npx supabase db push --include-seed`.
5. Publica la función con `npx supabase functions deploy sync-rock-content --no-verify-jwt`.
6. Entra como administrador y ejecuta **Sincronizar ahora**; revisa el historial antes de activar la portada en producción.

Consulta [news-events-sync.md](docs/operations/news-events-sync.md) para los comandos exactos, diagnóstico, rotación de secretos y desactivación del trabajo programado. Las claves de Ticketmaster y del programador nunca deben usar el prefijo `VITE_`.

## Verificación

```powershell
npm test
npm run typecheck
npm run build
$env:PLAYWRIGHT_BROWSERS_PATH='.playwright'; npx playwright install chromium
npm run test:e2e -- e2e/home-news-events.spec.ts
$env:DENO_DIR='.deno-cache'; deno check supabase/functions/sync-band/index.ts supabase/functions/admin-import/index.ts
```

Consulta [deployment.md](docs/deployment.md), [operations.md](docs/operations.md), [data-sources.md](docs/data-sources.md) y [privacy.md](docs/privacy.md).
