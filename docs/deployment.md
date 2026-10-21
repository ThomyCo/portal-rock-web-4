# Publicación gratuita

Arquitectura recomendada: **Cloudflare Pages** para el frontend y **Supabase Free** para PostgreSQL/PostGIS, Auth, Realtime, Storage y Edge Functions. OpenFreeMap sirve el mapa sin clave.

## 1. Crear Supabase

1. Crea un proyecto gratuito y guarda su referencia.
2. Vincula el repositorio: `npx supabase link --project-ref TU_REFERENCIA`.
3. Publica migraciones: `npx supabase db push`.
4. Carga el catálogo inicial desde `supabase/seed.sql` en SQL Editor.
5. Configura `ADMIN_CONTACT` como secreto y publica funciones:
   `npx supabase secrets set ADMIN_CONTACT=correo@dominio.com`
   `npx supabase functions deploy sync-band`
   `npx supabase functions deploy admin-import`
6. En Auth > URL Configuration agrega la URL final de Cloudflare y `https://*.pages.dev/**` como redirección permitida.
7. Copia Project URL y la clave pública `anon`. Nunca copies `service_role` al frontend.

## 2. Crear Cloudflare Pages

1. Sube el repositorio a GitHub o GitLab.
2. En Workers & Pages elige **Create > Pages > Connect to Git**.
3. Build command: `npm run build`.
4. Build output: `dist`.
5. Variables: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
6. Publica y luego añade el dominio `pages.dev` final a Supabase Auth.

Cloudflare Pages permite 500 compilaciones mensuales en Free y los archivos estáticos no consumen solicitudes de Functions. Supabase Free incluye dos proyectos activos y puede pausar proyectos con poca actividad. Revisa los límites antes de una presentación pública.

## 3. Comprobación pública

- Abre portada, mapa y un perfil en una ventana privada.
- Registra y confirma una cuenta real.
- Crea un tema y comprueba su aparición en otra ventana.
- Prueba una cuenta moderadora y otra administradora.
- Verifica atribución del mapa, consola del navegador y diseño a 360 px.
