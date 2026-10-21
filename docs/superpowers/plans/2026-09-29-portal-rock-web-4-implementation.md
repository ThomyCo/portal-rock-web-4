# Portal Rock Web 4.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar una aplicación musical moderna, gratuita y adaptable que combine un mapa de origen de bandas, datos externos, comunidad en tiempo real y una base PostgreSQL geográfica.

**Architecture:** React y TypeScript se compilan como una aplicación estática para Cloudflare Pages. Supabase proporciona PostgreSQL/PostGIS, Auth, Storage, Realtime y Edge Functions; MapLibre renderiza datos geográficos almacenados en PostGIS sobre OpenFreeMap. Las integraciones externas pasan por funciones con caché y nunca desde el navegador.

**Tech Stack:** Node.js 24 LTS, npm, React, TypeScript, Vite, React Router, TanStack Query, MapLibre GL JS, Supabase JS/CLI, PostgreSQL, PostGIS, Deno Edge Functions, Vitest, Testing Library, Playwright, pgTAP, Cloudflare Pages y GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-29-portal-rock-web-4-design.md`

## Global Constraints

- El producto y los mensajes de interfaz estarán en español.
- El costo operativo inicial será USD 0 al mes y ninguna configuración activará facturación automática.
- La aplicación pública funcionará mediante HTTPS y no dependerá de una computadora local.
- PostgreSQL con PostGIS en Supabase será la fuente de verdad.
- Toda tabla expuesta tendrá Row Level Security activa y pruebas por rol.
- Las integraciones con MusicBrainz y Wikidata se ejecutarán desde Edge Functions con caché.
- MusicBrainz recibirá como máximo una solicitud por segundo y un `User-Agent` identificable.
- La primera versión incluirá 12 bandas; las tiendas de discos quedan fuera de este plan.
- No se desplegarán MP3 comerciales ni secretos.
- La interfaz admitirá anchos de 360, 768 y 1440 píxeles y los recorridos principales cumplirán WCAG 2.2 AA.
- Todos los UUID se generarán en base de datos y todas las fechas se almacenarán como `timestamptz` UTC.
- Node.js 24 LTS se fijará en `.nvmrc`; el bloqueo exacto de dependencias será `package-lock.json`.

## Review Focus

1. Un filtro combinado sin resultados debe mostrar estado vacío, conservar los controles y permitir restablecerlos; Task 5 lo prueba.
2. Un usuario autenticado nunca debe poder modificar contenido, favoritos o perfil de otra cuenta; Tasks 2, 6 y 8 lo prueban mediante RLS.
3. Un proveedor externo lento, incompleto o caído debe conservar la última copia válida y devolver un resultado parcial explícito; Task 7 lo prueba.
4. Una reconexión Realtime no debe duplicar publicaciones ni perder el borrador del usuario; Task 8 lo prueba.
5. Un mapa sin WebGL o sin mosaicos debe ofrecer la lista accesible de bandas y conservar la navegación; Task 11 lo prueba.

---

## File Structure

```text
portal-rock-web-4/
├── .github/workflows/ci.yml               # Verificación automática
├── .env.example                            # Variables públicas documentadas
├── .nvmrc                                  # Node 24
├── index.html                              # Entrada Vite
├── package.json                            # Scripts y dependencias
├── playwright.config.ts                    # Pruebas E2E
├── vite.config.ts                          # Vite y Vitest
├── src/
│   ├── app/App.tsx                         # Rutas y proveedores globales
│   ├── app/router.tsx                      # Tabla de rutas
│   ├── components/                         # Controles compartidos
│   ├── features/auth/                      # Cuenta y sesión
│   ├── features/bands/                     # Catálogo y perfiles
│   ├── features/community/                 # Foro, comentarios, reacciones
│   ├── features/map/                       # Mapa, filtros y lista accesible
│   ├── features/admin/                     # Catálogo, sincronización, moderación
│   ├── lib/supabase.ts                     # Cliente público único
│   ├── lib/queryClient.ts                  # Caché de consultas
│   ├── styles/                             # Tokens, base y componentes
│   ├── test/                               # Setup y factories
│   └── types/database.ts                   # Tipos generados de Supabase
├── e2e/                                    # Recorridos Playwright
├── scripts/import-v3.ts                    # Importación idempotente
├── supabase/
│   ├── config.toml                         # Entorno local
│   ├── migrations/                         # Esquema, RLS y funciones SQL
│   ├── seed.sql                             # 12 bandas y datos de prueba
│   ├── tests/database.test.sql              # pgTAP
│   └── functions/
│       ├── _shared/                         # Auth, caché y clientes externos
│       ├── sync-band/index.ts               # Sincroniza una banda
│       └── admin-import/index.ts            # Importa lotes como borrador
└── docs/                                   # Operación, despliegue y licencias
```

## Task 1: Repository, Toolchain, and Application Shell

**Files:**
- Create: `.nvmrc`, `.gitignore`, `.env.example`, `package.json`, `package-lock.json`
- Create: `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`
- Create: `src/main.tsx`, `src/app/App.tsx`, `src/app/router.tsx`
- Create: `src/styles/tokens.css`, `src/styles/base.css`, `src/test/setup.ts`
- Test: `src/app/App.test.tsx`

**Interfaces:**
- Produces: `App(): JSX.Element`, `router: Router`, scripts `dev`, `build`, `typecheck`, `lint`, `test`, `test:e2e`, `supabase:start`, `supabase:test`.
- Consumes: none.

- [ ] **Step 1: Write the shell test**

```tsx
it('renders Spanish navigation and the map entry point', () => {
  render(<App />)
  expect(screen.getByRole('link', { name: 'Explorar mapa' })).toHaveAttribute('href', '/mapa')
  expect(screen.getByRole('link', { name: 'Comunidad' })).toHaveAttribute('href', '/comunidad')
})
```

- [ ] **Step 2: Run `npm test -- src/app/App.test.tsx` and verify RED because the app does not exist**

- [ ] **Step 3: Scaffold Vite React TypeScript with Node 24 and implement the route shell**

Use React Router routes `/`, `/mapa`, `/bandas/:slug`, `/comunidad`, `/favoritos`, `/perfil`, `/admin` and `*`. Add providers for router and TanStack Query in `src/main.tsx`. Establish CSS tokens for charcoal, petroleum blue, electric accent, genre colors, spacing, focus ring and reduced motion.

- [ ] **Step 4: Run `npm test -- src/app/App.test.tsx && npm run typecheck && npm run build` and verify PASS with an emitted `dist/`**

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold portal rock web 4"
```

## Task 2: PostgreSQL Schema, PostGIS, Profiles, and RLS Foundation

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/202609290001_extensions_and_types.sql`
- Create: `supabase/migrations/202609290002_profiles_and_catalog.sql`
- Create: `supabase/migrations/202609290003_community.sql`
- Create: `supabase/migrations/202609290004_rls.sql`
- Test: `supabase/tests/database.test.sql`

**Interfaces:**
- Produces: tables, enums and constraints named exactly as Section 6 of the spec; SQL helpers `public.current_role() returns app_role`, `public.is_moderator() returns boolean`, `public.is_admin() returns boolean`.
- Consumes: Supabase `auth.users` and PostGIS installed in schema `extensions`.

- [ ] **Step 1: Write pgTAP tests for schema constraints and cross-user denial**

```sql
select has_extension('postgis');
select has_table('public', 'profiles');
select has_table('public', 'bands');
select throws_ok(
  $$ insert into public.profiles(id, username, display_name) values (gen_random_uuid(), 'x', 'X') $$,
  '23514'
);
select results_eq(
  $$ select count(*)::bigint from public.posts where author_id <> auth.uid() $$,
  $$ values (0::bigint) $$
);
```

Include tests for duplicate case-insensitive usernames, invalid years, one primary location per band, one reaction per user/post, exactly one report target, and denial of profile role changes.

- [ ] **Step 2: Run `npx supabase start && npx supabase db reset && npx supabase test db` and verify RED because migrations are absent**

- [ ] **Step 3: Implement extensions, enums, tables, indexes, triggers and validation constraints**

Install `postgis` under `extensions` and `citext` under `extensions`. Use a GiST index for `band_locations.location`, unique partial index for primary locations, and triggers for `updated_at` plus profile creation after `auth.users` insertion.

- [ ] **Step 4: Implement RLS policies for visitor, owner, moderator and administrator**

Expose published bands and visible community content for reads; restrict writes to `auth.uid()` owners. Route moderation and role-sensitive operations through checked functions. Do not grant clients access to `api_cache` or `sync_runs` writes.

- [ ] **Step 5: Run `npx supabase db reset && npx supabase test db` and verify all pgTAP assertions pass**

- [ ] **Step 6: Generate TypeScript types**

Run: `npx supabase gen types typescript --local > src/types/database.ts`

- [ ] **Step 7: Commit**

```bash
git add supabase src/types/database.ts
git commit -m "feat: add geospatial database and security policies"
```

## Task 3: Catalog Seed, Public Views, and Data Client

**Files:**
- Create: `supabase/migrations/202609290005_public_catalog.sql`
- Create: `supabase/seed.sql`
- Create: `src/lib/supabase.ts`, `src/lib/queryClient.ts`
- Create: `src/features/bands/api.ts`, `src/features/bands/types.ts`
- Test: `src/features/bands/api.test.ts`, `supabase/tests/catalog.test.sql`

**Interfaces:**
- Produces: `listBands(filters: BandFilters): Promise<BandSummary[]>`, `getBand(slug: string): Promise<BandDetail>`, SQL function `bands_in_view(min_lat float8, min_long float8, max_lat float8, max_long float8, genre_slug text default null, decade int default null, country text default null, query text default null)`.
- Consumes: generated `Database` types and schema from Task 2.

- [ ] **Step 1: Write failing tests for combined filtering and no-result output**

```ts
it('passes all active filters to bands_in_view', async () => {
  await listBands({ bounds: [-120, 20, -70, 50], genre: 'thrash-metal', decade: 1980, country: 'US', query: 'metal' })
  expect(rpc).toHaveBeenCalledWith('bands_in_view', expect.objectContaining({ genre_slug: 'thrash-metal', decade: 1980, country: 'US', query: 'metal' }))
})
```

Add pgTAP assertions that unpublished bands never appear and an empty combination returns zero rows without an SQL error.

- [ ] **Step 2: Run `npm test -- src/features/bands/api.test.ts && npx supabase test db` and verify RED**

- [ ] **Step 3: Create public catalog views, geographic RPC and the typed client functions**

Return stable DTO fields: `id`, `slug`, `name`, `summary`, `formationYear`, `countryCode`, `genres`, `longitude`, `latitude`, `heroImageUrl`.

- [ ] **Step 4: Seed exactly 12 published bands with sourced primary locations**

Include exactly Queen, Guns N’ Roses, Metallica, Bon Jovi, Soda Stereo, Caifanes, AC/DC, U2, The Cure, Depeche Mode, Héroes del Silencio and Maná. Every row requires a unique slug, source URL and valid coordinate. Leave `hero_image_path` null when no licensed asset is present; the interface will render the genre-colored fallback instead of a remote placeholder.

- [ ] **Step 5: Run database and frontend tests, regenerate types, and verify PASS**

- [ ] **Step 6: Commit**

```bash
git add supabase src/lib src/features/bands src/types/database.ts
git commit -m "feat: add searchable public band catalog"
```

## Task 4: Authentication and Profile Experience

**Files:**
- Create: `src/features/auth/AuthProvider.tsx`, `authApi.ts`, `RequireAuth.tsx`, `RequireRole.tsx`
- Create: `src/features/auth/LoginPage.tsx`, `RegisterPage.tsx`, `RecoverPage.tsx`, `ProfilePage.tsx`
- Test: `src/features/auth/AuthProvider.test.tsx`, `src/features/auth/ProfilePage.test.tsx`
- Test: `e2e/auth.spec.ts`

**Interfaces:**
- Produces: `useAuth(): { user, profile, loading, signOut }`, `register(email, password, username, displayName)`, `login(email, password)`, `requestPasswordReset(email)`, route guards.
- Consumes: Supabase Auth and `profiles` policies from Task 2.

- [ ] **Step 1: Write failing component tests for anonymous, verified and unauthorized-role states**

```tsx
it('redirects an anonymous visitor and preserves the intended URL', async () => {
  renderRoute('/favoritos', { user: null })
  expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
  expect(location.search).toContain('next=%2Ffavoritos')
})
```

Assert that profile update payload excludes `role`, another profile cannot be edited, and unverified users see the verification instruction before community forms.

- [ ] **Step 2: Run `npm test -- src/features/auth` and verify RED**

- [ ] **Step 3: Implement auth provider, forms, validation and guards**

Use Supabase password auth, a 10-character minimum, generic login errors, `next` redirect validation restricted to same-origin application paths, and accessible status messages.

- [ ] **Step 4: Add Playwright flow for registration, email-confirmed fixture, login, profile edit and logout**

- [ ] **Step 5: Run `npm test -- src/features/auth && npm run test:e2e -- e2e/auth.spec.ts` and verify PASS**

- [ ] **Step 6: Commit**

```bash
git add src/features/auth e2e/auth.spec.ts src/app
git commit -m "feat: add secure account and profile flows"
```

## Task 5: Interactive Musical Map and Shareable Filters

**Files:**
- Create: `src/features/map/MapPage.tsx`, `BandMap.tsx`, `BandMarker.tsx`, `MapFilters.tsx`, `AccessibleBandList.tsx`
- Create: `src/features/map/filterState.ts`, `mapStyle.ts`
- Test: `src/features/map/filterState.test.ts`, `MapPage.test.tsx`
- Test: `e2e/map.spec.ts`

**Interfaces:**
- Produces: `parseMapFilters(search: string): BandFilters`, `serializeMapFilters(filters: BandFilters): string`, `BandMap({ bands, selectedId, onSelect })`.
- Consumes: `listBands()` and `BandSummary` from Task 3.

- [ ] **Step 1: Write failing URL round-trip and combined-empty-state tests**

```ts
it('round-trips genre, decade, country and query', () => {
  const filters = { genre: 'hard-rock', decade: 1980, country: 'GB', query: 'queen' }
  expect(parseMapFilters(serializeMapFilters(filters))).toEqual(filters)
})
```

The page test must assert “No encontramos bandas con estos filtros”, visible controls and a “Restablecer filtros” button.

- [ ] **Step 2: Run `npm test -- src/features/map` and verify RED**

- [ ] **Step 3: Implement filter state, query integration and accessible list**

Keep filter state in URL search parameters. Debounce text by 250 ms and cancel superseded TanStack queries. The list and map use the same `BandSummary[]` result.

- [ ] **Step 4: Implement MapLibre map with OpenFreeMap, clusters and genre markers**

Load MapLibre only on the map route, retain visible attribution, use `flyTo` unless reduced motion is active, and synchronize selected band with the side panel or mobile bottom sheet.

- [ ] **Step 5: Add Playwright tests at 360, 768 and 1440 pixels**

Assert filters, shared URL reload, marker/list selection and absence of page-level horizontal overflow.

- [ ] **Step 6: Run unit and map E2E tests and verify PASS**

- [ ] **Step 7: Commit**

```bash
git add src/features/map e2e/map.spec.ts
git commit -m "feat: add interactive musical origins map"
```

## Task 6: Band Profiles, Favorites, and Licensed Media

**Files:**
- Create: `src/features/bands/BandPage.tsx`, `BandHero.tsx`, `AlbumGrid.tsx`, `FavoriteButton.tsx`
- Create: `src/features/bands/favoritesApi.ts`
- Create: `supabase/migrations/202609290006_storage.sql`
- Test: `src/features/bands/BandPage.test.tsx`, `FavoriteButton.test.tsx`
- Test: `supabase/tests/favorites.test.sql`, `e2e/band-profile.spec.ts`

**Interfaces:**
- Produces: `addFavorite(bandId: string): Promise<void>`, `removeFavorite(bandId: string): Promise<void>`, `listFavorites(): Promise<BandSummary[]>`.
- Consumes: `getBand()`, auth state and `favorites` table.

- [ ] **Step 1: Write failing tests for public details, favorite toggle and cross-user denial**

Assert unauthenticated users are sent to login with `next`, authenticated toggles are idempotent, and RLS rejects deletion of another user's favorite.

- [ ] **Step 2: Run frontend and pgTAP tests and verify RED**

- [ ] **Step 3: Implement band profile and favorites API**

Render biography, source links, genres, primary location, albums, official embeds or licensed media only, and related community posts.

- [ ] **Step 4: Create Storage buckets and policies**

Create `avatars` with 2 MB JPEG/PNG/WebP owner writes and `band-images` with 5 MB JPEG/PNG/WebP admin writes. Do not add an audio bucket.

- [ ] **Step 5: Run tests and verify that no `.mp3` file exists under the production project**

Run: `npm test -- src/features/bands && npx supabase test db && node -e "const fs=require('fs');const p=require('path');let bad=[];function w(d){for(const x of fs.readdirSync(d,{withFileTypes:true})){const f=p.join(d,x.name);x.isDirectory()?w(f):/\.mp3$/i.test(f)&&bad.push(f)}}w('.');if(bad.length)throw Error(bad.join('\n'))"`

- [ ] **Step 6: Commit**

```bash
git add src/features/bands supabase e2e/band-profile.spec.ts
git commit -m "feat: add band profiles and favorites"
```

## Task 7: MusicBrainz and Wikidata Synchronization

**Files:**
- Create: `supabase/functions/_shared/auth.ts`, `cache.ts`, `rateLimit.ts`, `musicbrainz.ts`, `wikidata.ts`, `types.ts`
- Create: `supabase/functions/sync-band/index.ts`, `admin-import/index.ts`
- Test: `supabase/functions/_shared/musicbrainz.test.ts`, `wikidata.test.ts`, `cache.test.ts`
- Test: `supabase/functions/sync-band/index.test.ts`, `admin-import/index.test.ts`

**Interfaces:**
- Produces: `fetchMusicBrainzArtist(mbid: string): Promise<MusicBrainzArtist>`, `fetchWikidataEntity(qid: string): Promise<WikidataBandData>`, `syncBand(input: SyncBandInput, actor: Actor): Promise<SyncResult>`.
- Consumes: admin JWT, `api_cache`, `sync_runs`, `bands`, `albums`, `band_locations`.

- [ ] **Step 1: Write Deno tests for cache, throttling, partial response and editorial-field preservation**

```ts
Deno.test('keeps verified editorial fields when providers disagree', async () => {
  const result = await syncBandFixture({ local: { summary: 'Texto revisado' }, remote: { summary: 'Texto remoto' } })
  assertEquals(result.band.summary, 'Texto revisado')
  assertEquals(result.ignored, ['summary'])
})
```

Also assert a cached success prevents a network call, a stale success remains available after provider timeout, non-admin receives 403, and 26-item import receives 400.

- [ ] **Step 2: Run `deno test --allow-env supabase/functions` and verify RED**

- [ ] **Step 3: Implement shared clients, seven-day cache and one-request-per-second MusicBrainz gate**

Use the exact `User-Agent` format `PortalRockWeb4/1.0 (contacto: <ADMIN_CONTACT>)`. Validate MBID UUID and Wikidata `^Q[1-9][0-9]*$` before network access.

- [ ] **Step 4: Implement `sync-band` and `admin-import` handlers**

Return JSON with `status`, `created`, `updated`, `ignored`, `warnings`; import creates `draft` records only. Record sanitized outcomes in `sync_runs`.

- [ ] **Step 5: Run all Deno tests and a local function smoke request; verify PASS and no secrets in response/log fixtures**

- [ ] **Step 6: Commit**

```bash
git add supabase/functions
git commit -m "feat: synchronize curated external music data"
```

## Task 8: Community, Comments, Reactions, and Realtime

**Files:**
- Create: `src/features/community/communityApi.ts`, `CommunityPage.tsx`, `PostComposer.tsx`, `PostCard.tsx`, `CommentList.tsx`, `ReactionPicker.tsx`, `useCommunityRealtime.ts`
- Test: `src/features/community/communityApi.test.ts`, `PostComposer.test.tsx`, `useCommunityRealtime.test.tsx`
- Test: `supabase/tests/community.test.sql`, `e2e/community.spec.ts`

**Interfaces:**
- Produces: `listPosts(cursor?: string, bandId?: string): Promise<PostPage>`, `createPost(body: string, bandId?: string): Promise<Post>`, `createComment(postId: string, body: string): Promise<Comment>`, `setReaction(postId: string, type: ReactionType | null): Promise<void>`, `subscribeCommunity(onEvent): Unsubscribe`.
- Consumes: authenticated verified user, community tables and Supabase Realtime.

- [ ] **Step 1: Write failing tests for limits, ownership, reconnection and deduplication**

Assert 1–1,200 post characters, 1–800 comment characters, cross-user update denial, one reaction per post, 20-row cursor pages, duplicate Realtime event collapse by ID, and draft text retained after a failed request or reconnection.

- [ ] **Step 2: Run frontend and pgTAP tests and verify RED**

- [ ] **Step 3: Implement cursor APIs and community components**

Render user text through React text nodes, never `dangerouslySetInnerHTML`. Preserve composer value until confirmed insertion. Provide visible offline, retry and reconnecting states.

- [ ] **Step 4: Implement Realtime subscription merging**

Merge inserts/updates by primary key into TanStack Query pages; unsubscribe on route change and resubscribe with exponential backoff capped at 30 seconds.

- [ ] **Step 5: Add two-browser Playwright test for live post and moderation-safe deletion state**

- [ ] **Step 6: Run all community tests and verify PASS**

- [ ] **Step 7: Commit**

```bash
git add src/features/community supabase/tests/community.test.sql e2e/community.spec.ts
git commit -m "feat: add realtime rock community"
```

## Task 9: Administration and Moderation

**Files:**
- Create: `src/features/admin/AdminLayout.tsx`, `BandEditor.tsx`, `SyncPanel.tsx`, `ModerationQueue.tsx`
- Create: `src/features/admin/adminApi.ts`
- Create: `supabase/migrations/202609290007_admin_functions.sql`
- Test: `src/features/admin/BandEditor.test.tsx`, `ModerationQueue.test.tsx`
- Test: `supabase/tests/admin.test.sql`, `e2e/admin.spec.ts`

**Interfaces:**
- Produces: `saveBand(input: BandEditorInput): Promise<BandDetail>`, `publishBand(id: string): Promise<void>`, `moderateReport(reportId: string, decision: 'resolve-hide' | 'dismiss'): Promise<void>`, `requestBandSync(bandId, providers): Promise<SyncResult>`.
- Consumes: `RequireRole`, Edge Functions and admin/moderator SQL functions.

- [ ] **Step 1: Write failing authorization and validation tests**

Assert users cannot enter `/admin`, moderators can access reports but not band editing, administrators cannot publish without primary location/source/summary, and role escalation is rejected.

- [ ] **Step 2: Run frontend, pgTAP and E2E admin tests and verify RED**

- [ ] **Step 3: Implement role-specific routes, band editor and synchronization summary**

- [ ] **Step 4: Implement moderation RPCs with audit fields and soft hiding**

- [ ] **Step 5: Run tests and verify PASS for all three roles**

- [ ] **Step 6: Commit**

```bash
git add src/features/admin supabase e2e/admin.spec.ts
git commit -m "feat: add catalog administration and moderation"
```

## Task 10: Version 3 Content Migration

**Files:**
- Create: `scripts/import-v3.ts`, `scripts/import-v3.test.ts`
- Create: `docs/migration-v3.md`
- Create: `migration-reports/.gitkeep`

**Interfaces:**
- Produces: `parseV3Users(text: string): ReservedUsername[]`, `parseV3Messages(text: string): LegacyMessage[]`, `importV3(options: ImportOptions): Promise<ImportReport>`.
- Consumes: version 3 `usuarios.txt`, `mensajes.txt`, four editorial band texts; Supabase service role only from local administrator environment.

- [ ] **Step 1: Write failing fixture tests for empty, valid, malformed and repeated input**

Assert PBKDF2 hashes are never sent to Auth, messages outside limits are reported, rerunning import creates no duplicates, and empty source files return zero counts.

- [ ] **Step 2: Run `npm test -- scripts/import-v3.test.ts` and verify RED**

- [ ] **Step 3: Implement dry-run-first migration and JSON report**

Require `--apply` for writes; default to dry run. Use deterministic legacy keys for idempotency. Import band copy as drafts, reserve usernames without creating accounts, and import only valid messages with `legacy_import` audit metadata.

- [ ] **Step 4: Run dry run against a copied version 3 data directory and inspect counts without modifying production**

- [ ] **Step 5: Run the unit test and verify PASS**

- [ ] **Step 6: Commit**

```bash
git add scripts docs/migration-v3.md migration-reports/.gitkeep
git commit -m "feat: add safe version 3 migration"
```

## Task 11: Resilience, Accessibility, and Performance

**Files:**
- Create: `src/components/ErrorBoundary.tsx`, `ConnectionStatus.tsx`, `SkipLink.tsx`
- Create: `src/features/map/MapFallback.tsx`
- Modify: `src/styles/base.css`, route components
- Test: `src/components/ErrorBoundary.test.tsx`, `src/features/map/MapFallback.test.tsx`
- Test: `e2e/accessibility.spec.ts`, `e2e/resilience.spec.ts`

**Interfaces:**
- Produces: consistent error/retry UI, WebGL/tile fallback and keyboard path.
- Consumes: all user-facing routes from Tasks 4–9.

- [ ] **Step 1: Write failing fallback and accessibility tests**

Assert WebGL absence shows `AccessibleBandList`, tile failure retains navigation, reduced motion prevents `flyTo`, every route has one H1, focus moves to route heading, and no critical automated accessibility violation exists.

- [ ] **Step 2: Run relevant unit and Playwright tests and verify RED**

- [ ] **Step 3: Implement global error boundary, connection states, skip link and map fallback**

- [ ] **Step 4: Add route-level lazy loading for map and admin, responsive images and bundle-size check**

Set the production initial JS budget to 250 KB gzip excluding lazy map/admin chunks; fail CI when exceeded using a build-report script.

- [ ] **Step 5: Run `npm run build`, unit tests and accessibility/resilience E2E tests; verify PASS at all three viewports**

- [ ] **Step 6: Commit**

```bash
git add src e2e package.json
git commit -m "feat: harden accessibility and resilience"
```

## Task 12: CI, Free Production Deployment, and Operations

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `docs/deployment.md`, `docs/operations.md`, `docs/data-sources.md`, `docs/privacy.md`
- Create: `public/_headers`, `public/_redirects`
- Modify: `.env.example`, `README.md`
- Test: complete repository suite and deployed smoke checks

**Interfaces:**
- Produces: repeatable GitHub verification, Supabase migration/function deployment instructions, Cloudflare Pages deployment, quota/reactivation/backup runbook.
- Consumes: every prior task.

- [ ] **Step 1: Write the CI workflow with explicit gates**

Run install with `npm ci`, typecheck, lint, unit tests, Supabase database tests, Deno function tests, production build and Playwright Chromium tests. Cache npm only; do not cache secrets or generated environment files.

- [ ] **Step 2: Run the full command locally and verify it fails on any deliberately broken gate, then restore**

Run: `npm ci && npm run typecheck && npm run lint && npm test -- --run && npx supabase db reset && npx supabase test db && deno test --allow-env supabase/functions && npm run build && npm run test:e2e`

- [ ] **Step 3: Document free Supabase project creation and secure configuration**

Include PostGIS schema, Auth redirect URLs, email verification, RLS verification, Storage limits, Edge secrets, migration deployment, no-spend policy, pause reactivation and quota checks at 70 percent.

- [ ] **Step 4: Document Cloudflare Pages and GitHub deployment**

Use build command `npm run build`, output `dist`, Node 24, SPA fallback, security headers and only the public Supabase URL/anon key. Document the free `pages.dev` URL and optional paid custom domain.

- [ ] **Step 5: Deploy a preview and run smoke acceptance**

Verify public homepage, map/list fallback, band page, sign-in screen, unauthenticated community read, HTTPS, no exposed service-role key, no MP3 requests and correct map attribution.

- [ ] **Step 6: Run the complete suite once more and record exact passing counts in `README.md`**

- [ ] **Step 7: Commit**

```bash
git add .github docs public README.md .env.example
git commit -m "docs: add production deployment and operations"
```

## Final Release Gate

- [ ] Execute every acceptance journey in Section 17.4 of the specification.
- [ ] Confirm all 18 acceptance bullets in Section 18 of the specification with evidence.
- [ ] Review Supabase Security Advisor findings and resolve all project-owned warnings.
- [ ] Verify GitHub history contains no service-role key, API secret, password or `.env.local`.
- [ ] Export a database schema backup and record restore instructions.
- [ ] Confirm Cloudflare and Supabase billing remain on free plans without paid add-ons.
- [ ] Tag the verified commit as `v4.0.0` and publish the release notes.
