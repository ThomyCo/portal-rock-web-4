# Portal Rock Web 4.0

Aplicación contemporánea para explorar el origen geográfico de bandas, guardar favoritas y conversar en comunidad. Usa React, TypeScript, MapLibre, OpenFreeMap y Supabase con PostgreSQL/PostGIS.

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

## Verificación

```powershell
npm test
npm run typecheck
npm run build
$env:DENO_DIR='.deno-cache'; deno check supabase/functions/sync-band/index.ts supabase/functions/admin-import/index.ts
```

Consulta [deployment.md](docs/deployment.md), [operations.md](docs/operations.md), [data-sources.md](docs/data-sources.md) y [privacy.md](docs/privacy.md).
