# Portal Rock News and Events Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the simple Portal Rock homepage with a Mexico-first rock news and concerts portal that synchronizes external content every six hours and supports editorial moderation.

**Architecture:** Supabase stores normalized events, news, sources, and synchronization runs behind RLS. A protected `sync-rock-content` Edge Function fetches Ticketmaster and approved RSS feeds, while React reads only persisted public content and the existing admin area exposes moderation and diagnostics. Pure normalization and orchestration code stays separate from the Edge Function handler so Jest can test it without a running Supabase project.

**Tech Stack:** React 19, TypeScript 5.9, TanStack React Query, Supabase/PostgreSQL/RLS/Edge Functions/Cron, Ticketmaster Discovery API v2, RSS/Atom, `fast-xml-parser`, Jest, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-21-home-news-events-design.md`

## Global Constraints

- Mexico content is primary; international content is secondary.
- Include rock, metal, punk, and alternative content, without restricting results to catalogued bands.
- Synchronize every six hours; visits to the homepage must never call Ticketmaster or RSS directly.
- Publish concerts automatically; import every new article as `pending` until a moderator or administrator approves it.
- Store only article metadata and the original link, never the complete external article.
- Keep `TICKETMASTER_API_KEY`, the service-role key, and the scheduler secret outside Git and outside all `VITE_*` variables.
- Public users may read future visible events and approved news only.
- Moderators and administrators may review news; only administrators may manage sources or start a manual synchronization.
- External URLs must use HTTPS before persistence or rendering.
- Reimporting content must preserve editorial decisions, including `rejected`, `featured`, and `editorial_order`.
- At most one approved article may be featured, and changing it must be atomic.
- The page must work at 360, 768, and 1440 pixels with keyboard tabs, visible focus, and no page-level horizontal overflow.

## Review Focus

- A cancelled or postponed Ticketmaster event must show its state and must not present an active ticket purchase call to action; Task 2 pins normalization and Task 6 pins rendering.
- Two feed entries that differ only by tracking parameters or URL fragments must become one article; Task 2 pins canonicalization and deduplication.
- A successful second import must not reset a rejected article or overwrite its editorial fields; Task 3 pins idempotent repository payloads.
- One broken RSS feed must produce a warning while other feeds and Ticketmaster data still persist; Task 3 pins partial success and run summaries.
- A visitor, moderator, and administrator must receive exactly their intended database access even when calling Supabase directly; Task 1 pins the RLS matrix.

---

### Task 1: Database schema, public projections, and editorial RPCs

**Files:**
- Create: `supabase/migrations/202610210007_news_events.sql`
- Create: `scripts/news-events-schema.test.ts`
- Create: `supabase/tests/news_events_rls.test.sql`

**Interfaces:**
- Consumes: existing `public.profiles`, `public.user_role`, and `public.is_staff()`.
- Produces: `public.rock_events`, `public.rock_news`, `public.rock_news_sources`, `public.content_sync_runs`; public views `public.public_rock_events` and `public.public_rock_news`; RPCs `public.moderate_rock_news`, `public.set_featured_rock_news`, `public.reorder_rock_news`, `public.set_rock_event_hidden`, and `public.set_rock_news_source`.

- [ ] **Step 1: Write the failing schema contract test**

Add assertions that the migration defines all four tables, the unique keys `(provider, external_id)` and `url_hash`, the category/status/scope checks, the one-featured partial unique index, the one-running-sync partial unique index, all five RPC names, grants, and policies for visitor/moderator/admin access. Include assertions that the public views filter `hidden = false`, approved news, and events whose `starts_at >= now()`. Add pgTAP tests that impersonate anon, moderator, and admin JWT claims and exercise the actual permissions.

- [ ] **Step 2: Run the schema test to verify it fails**

Run: `npm test -- --runTestsByPath scripts/news-events-schema.test.ts`

Expected: FAIL because `202610210007_news_events.sql` does not exist.

- [ ] **Step 3: Implement the schema and RLS migration**

Create the tables and views with the columns from the spec. Define:

```sql
moderate_rock_news(news_id uuid, decision text, edited_title text, edited_summary text, edited_category text) returns public.rock_news
set_featured_rock_news(news_id uuid) returns public.rock_news
reorder_rock_news(news_ids uuid[]) returns void
set_rock_event_hidden(event_id uuid, should_hide boolean) returns public.rock_events
set_rock_news_source(source_id uuid, source_name text, feed_url text, site_url text, source_country text, source_language text, allowed_categories text[], should_be_active boolean) returns public.rock_news_sources
```

Use `security definer set search_path = ''`, explicit role checks, and transactions supplied by each function call. `moderate_rock_news` accepts only `approve` or `reject`; `set_featured_rock_news` clears the previous featured row and features only an approved target; `reorder_rock_news` rejects duplicate IDs and updates approved rows to their one-based array positions. Permit moderators and admins to call the three news RPCs; restrict event hiding and source changes to admins. Add a partial unique index that permits at most one `content_sync_runs.status='running'`. Create the public views with `security_invoker=true`, grant only the required reads to `anon, authenticated`, and leave synchronization-table writes to `service_role`.

- [ ] **Step 4: Verify the migration contract and a local database reset**

Run: `npm test -- --runTestsByPath scripts/news-events-schema.test.ts`

Expected: PASS.

Run: `npx supabase db reset`

Expected: migrations and seed complete without SQL errors.

Run: `npx supabase test db`

Expected: pgTAP proves anon cannot select pending news, moderator cannot alter sources, admin can call every editorial RPC, and direct table writes remain blocked.

- [ ] **Step 5: Commit the database contract**

```bash
git add supabase/migrations/202610210007_news_events.sql supabase/tests/news_events_rls.test.sql scripts/news-events-schema.test.ts
git commit -m "feat: add rock news and events schema"
```

### Task 2: Ticketmaster and feed normalization

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `jest.config.cjs`
- Create: `supabase/functions/deno.json`
- Create: `supabase/functions/_shared/rock-content/types.ts`
- Create: `supabase/functions/_shared/rock-content/urls.ts`
- Create: `supabase/functions/_shared/rock-content/ticketmaster.ts`
- Create: `supabase/functions/_shared/rock-content/feeds.ts`
- Create: `supabase/functions/_shared/rock-content/normalizers.test.ts`

**Interfaces:**
- Consumes: Ticketmaster Discovery API JSON and RSS 2.0 or Atom XML strings.
- Produces: `NormalizedRockEvent`, `NormalizedRockArticle`, `canonicalizeArticleUrl(raw: string): string`, `normalizeTicketmasterEvents(payload: unknown, scope: EventScope, fetchedAt: Date): NormalizedRockEvent[]`, and `parseRockFeed(xml: string, source: RockNewsSourceInput, fetchedAt: Date): NormalizedRockArticle[]`.

- [ ] **Step 1: Add failing normalization tests and make Jest discover Edge Function tests**

Add `supabase/functions/**/*.test.ts` to `testMatch`. Test Mexico and international event mapping, genre filtering, timezone/location extraction, HTTPS rejection, cancelled/postponed status mapping, RSS and Atom variants, missing optional images, HTML stripping, category assignment, and URL canonicalization that removes `utm_*`, `fbclid`, `gclid`, and fragments before computing a SHA-256 hash.

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npm test -- --runTestsByPath supabase/functions/_shared/rock-content/normalizers.test.ts`

Expected: FAIL because the normalization modules do not exist.

- [ ] **Step 3: Add the parser dependency and shared types**

Run: `npm install fast-xml-parser`

Define `EventScope`, `EventStatus`, `NewsCategory`, `NormalizedRockEvent`, `NormalizedRockArticle`, and `RockNewsSourceInput`. Keep these files independent of Deno and Supabase imports. Map the bare `fast-xml-parser` import to its pinned `npm:` package in `supabase/functions/deno.json` so the same source resolves under Jest and the Edge runtime.

- [ ] **Step 4: Implement URL, Ticketmaster, and RSS/Atom normalization**

Use `fast-xml-parser` for RSS/Atom variants. Normalize artist names and genres with lowercase Unicode-safe comparison while preserving display text. Filter to rock, metal, punk, and alternative classifications; reject non-HTTPS output links; return deterministic hashes and arrays suitable for database upserts.

- [ ] **Step 5: Verify normalization**

Run: `npm test -- --runTestsByPath supabase/functions/_shared/rock-content/normalizers.test.ts`

Expected: PASS with every Review Focus case owned by this task covered.

- [ ] **Step 6: Commit the normalizers**

```bash
git add package.json package-lock.json jest.config.cjs supabase/functions/_shared/rock-content
git commit -m "feat: normalize rock events and news feeds"
```

### Task 3: Idempotent synchronization service and Edge Function

**Files:**
- Modify: `supabase/functions/_shared/auth.ts`
- Create: `supabase/functions/_shared/rock-content/sync.ts`
- Create: `supabase/functions/_shared/rock-content/sync.test.ts`
- Create: `supabase/functions/sync-rock-content/index.ts`
- Modify: `supabase/config.toml`

**Interfaces:**
- Consumes: Task 2 normalizers and Task 1 table contracts.
- Produces: `syncRockContent(deps: SyncDependencies, request: SyncRequest): Promise<SyncSummary>`, `requireStaff(request: Request, roles: Array<'moderator' | 'admin'>)`, and the POST Edge Function `sync-rock-content`.

- [ ] **Step 1: Write failing synchronization tests using injected clients**

Test two Ticketmaster queries (`countryCode=MX` first and a limited international query second), per-source feed isolation, a timeout followed by at most two retries for 429/5xx responses, no retry for 4xx, idempotent event upserts, article inserts with `status='pending'`, omission of editorial columns from conflict updates, partial success warnings, a final failed run when all providers fail, and refusal of a second concurrent run.

- [ ] **Step 2: Run the synchronization tests to verify they fail**

Run: `npm test -- --runTestsByPath supabase/functions/_shared/rock-content/sync.test.ts`

Expected: FAIL because `syncRockContent` does not exist.

- [ ] **Step 3: Implement the injectable synchronization service**

Define repository methods `tryStartRun`, `upsertEvents`, `upsertArticles`, `markSourceResult`, and `finishRun`. Use an `AbortController` timeout per request and bounded exponential delays. Upsert imported article fields only; never include `status`, `featured`, `editorial_order`, `reviewed_by`, or `reviewed_at` in conflict updates.

- [ ] **Step 4: Implement Edge Function authorization and persistence adapters**

Allow a request when either `x-sync-secret` equals `SYNC_CONTENT_SECRET` or an authenticated profile has role `admin`; reject every other request. Instantiate the service-role Supabase client only inside the function. Validate `TICKETMASTER_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SYNC_CONTENT_SECRET` before work starts. Add `[functions.sync-rock-content] verify_jwt = false` because the scheduler authenticates with its private header while the handler performs both authorization paths.

- [ ] **Step 5: Verify synchronization and function type safety**

Run: `npm test -- --runTestsByPath supabase/functions/_shared/rock-content/sync.test.ts`

Expected: PASS, including partial-source failure, editorial-state preservation, and concurrency tests.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit the synchronization function**

```bash
git add supabase/functions supabase/config.toml
git commit -m "feat: synchronize rock news and concerts"
```

### Task 4: Six-hour schedule, initial source loading, and operations guide

**Files:**
- Create: `supabase/migrations/202610210008_news_events_cron.sql`
- Modify: `supabase/seed.sql`
- Create: `scripts/news-events-schedule.test.ts`
- Create: `docs/operations/news-events-sync.md`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `sync-rock-content`, `rock_news_sources`, Supabase Vault, `pg_cron`, and `pg_net`.
- Produces: cron job `sync-rock-content-every-6-hours`, seed records for the reviewed starter feeds, and exact local/hosted setup and rollback instructions.

- [ ] **Step 1: Write the failing schedule contract test**

Assert that the migration enables `pg_cron` and `pg_net`, reads `project_url` and `sync_content_secret` from Vault, calls `/functions/v1/sync-rock-content`, schedules `0 */6 * * *`, uses `x-sync-secret`, and exposes an idempotent unschedule statement in the guide. Assert that `.env.example` lists `TICKETMASTER_API_KEY` and `SYNC_CONTENT_SECRET` without values.

- [ ] **Step 2: Run the schedule test to verify it fails**

Run: `npm test -- --runTestsByPath scripts/news-events-schedule.test.ts`

Expected: FAIL because the cron migration and guide do not exist.

- [ ] **Step 3: Implement the cron migration and initial source seed**

Schedule one invocation at minute zero every sixth hour. Seed only feeds whose publisher page explicitly advertises RSS and whose feed succeeds during implementation; each source must include name, feed URL, site URL, country, language, allowed categories, and `active=true`. Put changing feed records in `supabase/seed.sql`, not the schema migration, so production operators can review them before loading.

- [ ] **Step 4: Write the operations guide**

Document local secrets, hosted secrets, Vault entries, function deployment, source review/loading, first manual run, run-log inspection, cron verification, rotation of the sync secret, unscheduling, and recovery from quota or feed failures. State explicitly that `TICKETMASTER_API_KEY` must never be prefixed with `VITE_`.

- [ ] **Step 5: Verify schedule contracts and database reset**

Run: `npm test -- --runTestsByPath scripts/news-events-schedule.test.ts`

Expected: PASS.

Run: `npx supabase db reset`

Expected: PASS and one cron job with schedule `0 */6 * * *`.

- [ ] **Step 6: Commit scheduling and operations**

```bash
git add supabase/migrations/202610210008_news_events_cron.sql supabase/seed.sql scripts/news-events-schedule.test.ts docs/operations/news-events-sync.md .env.example
git commit -m "feat: schedule six-hour content sync"
```

### Task 5: Public homepage data layer

**Files:**
- Create: `src/features/home/types.ts`
- Create: `src/features/home/homeApi.ts`
- Create: `src/features/home/homeApi.test.ts`
- Create: `src/features/home/useHomeContent.ts`

**Interfaces:**
- Consumes: Task 1 public views, existing `public.public_band_catalog`, and `src/lib/supabase.ts`.
- Produces: `HomeNewsItem`, `HomeEvent`, `HomeContent`, `getHomeContent(now?: Date): Promise<HomeContent>`, and `useHomeContent()`.

- [ ] **Step 1: Write failing public-query tests**

Mock Supabase and assert approved news is ordered by `featured desc, editorial_order asc, published_at desc`; future visible events are ordered by `starts_at`; Mexico and international results are separated; only a normalized published-band match yields `bandSlug`; and query failure returns an error rather than silently replacing persisted data with an empty success.

- [ ] **Step 2: Run the focused API test to verify it fails**

Run: `npm test -- --runTestsByPath src/features/home/homeApi.test.ts`

Expected: FAIL because `homeApi.ts` does not exist.

- [ ] **Step 3: Implement public data mapping and query hook**

Fetch the two public views in parallel, request only display fields, and join event artist names to published band names using the same normalized comparison as the sync layer. Configure the query with a five-minute stale time and retain previous successful data during background refetches.

- [ ] **Step 4: Verify the data layer**

Run: `npm test -- --runTestsByPath src/features/home/homeApi.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the homepage data layer**

```bash
git add src/features/home
git commit -m "feat: query homepage news and events"
```

### Task 6: Newspaper-style public homepage

**Files:**
- Create: `src/features/home/HomePage.tsx`
- Create: `src/features/home/HomePage.test.tsx`
- Create: `src/features/home/HomeImage.tsx`
- Create: `src/features/home/NewsTabs.tsx`
- Create: `src/features/home/EventCard.tsx`
- Create: `src/features/home/home.css`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: `useHomeContent()` and types from Task 5.
- Produces: the route component `HomePage`, keyboard-operated `NewsTabs`, broken-image fallback `HomeImage`, and status-aware `EventCard`.

- [ ] **Step 1: Write failing homepage behavior tests**

Test featured-story fallback to first approved item, tab roles and ArrowLeft/ArrowRight/Home/End keyboard behavior, Mexico as the initial tab and first events section, three highlighted-news cards, city groups for CDMX/Monterrey/Guadalajara/other, secondary international events, band-profile links only when `bandSlug` exists, map/community calls to action, empty-news and empty-events messages, and image-error fallback. Assert cancelled/postponed cards display their status and omit the active ticket button.

- [ ] **Step 2: Run the homepage test to verify it fails**

Run: `npm test -- --runTestsByPath src/features/home/HomePage.test.tsx`

Expected: FAIL because `HomePage` does not exist.

- [ ] **Step 3: Implement semantic homepage components**

Move the route component out of `App.tsx`. Render the approved newspaper layout in this order: lead story, quick news, highlighted cards, Mexico concerts, international concerts, portal links. External links use `target="_blank" rel="noreferrer"`, source/date labels remain visible, and all images have useful alt text or are decorative.

- [ ] **Step 4: Implement responsive presentation**

Use the existing dark, orange, and cream tokens. At 1440px use a dominant story plus side column and three-card grids; at 768px reduce to two columns; at 360px use one column. Horizontal event rails must be keyboard-scrollable without creating page overflow, and `:focus-visible` must be apparent.

- [ ] **Step 5: Verify behavior, type safety, and production build**

Run: `npm test -- --runTestsByPath src/features/home/HomePage.test.tsx`

Expected: PASS.

Run: `npm run typecheck && npm run build`

Expected: both commands PASS.

- [ ] **Step 6: Commit the public homepage**

```bash
git add src/features/home src/app/App.tsx
git commit -m "feat: redesign homepage as rock newspaper"
```

### Task 7: Editorial API and permission-aware actions

**Files:**
- Create: `src/features/admin/contentAdminApi.ts`
- Create: `src/features/admin/contentAdminApi.test.ts`
- Create: `src/features/admin/useContentAdmin.ts`

**Interfaces:**
- Consumes: Task 1 RPCs/tables and Task 3 Edge Function.
- Produces: `listPendingNews`, `moderateNews`, `featureNews`, `reorderNews`, `setEventHidden`, `listNewsSources`, `saveNewsSource`, `requestContentSync`, and `listContentSyncRuns`.

- [ ] **Step 1: Write failing editorial API tests**

Mock Supabase and assert exact table/RPC/function names and payloads. Test validation that article title/summary are nonblank, category is allowed, source URLs are HTTPS, allowed categories are nonempty, and a manual sync surfaces HTTP 409 as “Ya hay una sincronización en curso”.

- [ ] **Step 2: Run the editorial API tests to verify they fail**

Run: `npm test -- --runTestsByPath src/features/admin/contentAdminApi.test.ts`

Expected: FAIL because `contentAdminApi.ts` does not exist.

- [ ] **Step 3: Implement API functions and React Query mutations**

Use Task 1 RPCs for moderation/feature/hiding/source writes and invoke `sync-rock-content` for manual runs. Invalidate pending, approved, events, sources, sync-runs, and public-home queries after their owning mutation succeeds.

- [ ] **Step 4: Verify editorial API behavior**

Run: `npm test -- --runTestsByPath src/features/admin/contentAdminApi.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the editorial data layer**

```bash
git add src/features/admin/contentAdminApi.ts src/features/admin/contentAdminApi.test.ts src/features/admin/useContentAdmin.ts
git commit -m "feat: add editorial content actions"
```

### Task 8: Moderation, sources, events, and sync diagnostics UI

**Files:**
- Create: `src/features/admin/NewsModerationPanel.tsx`
- Create: `src/features/admin/NewsSourcesPanel.tsx`
- Create: `src/features/admin/EventVisibilityPanel.tsx`
- Create: `src/features/admin/SyncStatusPanel.tsx`
- Create: `src/features/admin/ContentAdmin.test.tsx`
- Modify: `src/features/admin/AdminLayout.tsx`
- Modify: `src/app/app.css`

**Interfaces:**
- Consumes: Task 7 hooks and existing `useAuth()` roles.
- Produces: moderator news workflow plus admin-only source, event, and synchronization controls.

- [ ] **Step 1: Write failing role and workflow tests**

Test that moderators see pending previews and approve/reject/edit controls but do not see source management, manual sync, or event hiding. Test that admins see all panels, can mark one approved item as featured, reorder approved items, hide an event, create/disable a source, start a manual sync, and inspect safe run summaries. Test loading, empty, validation-error, success, and 409 in-progress states.

- [ ] **Step 2: Run the admin UI test to verify it fails**

Run: `npm test -- --runTestsByPath src/features/admin/ContentAdmin.test.tsx`

Expected: FAIL because the panels do not exist.

- [ ] **Step 3: Implement moderation and admin panels**

Add navigation anchors to `AdminLayout`. Reuse the current role source, require confirmation only for rejection/hiding actions, preserve entered edits after API errors, and render external article previews without embedding third-party pages.

- [ ] **Step 4: Style the editorial workspace and verify it**

Keep controls usable at 360px, provide labels for every input, use live regions for mutation results, and maintain visible keyboard focus.

Run: `npm test -- --runTestsByPath src/features/admin/ContentAdmin.test.tsx`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit the editorial interface**

```bash
git add src/features/admin src/app/app.css
git commit -m "feat: add rock content moderation workspace"
```

### Task 9: End-to-end acceptance and release documentation

**Files:**
- Create: `e2e/home-news-events.spec.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: all prior tasks and the local Supabase stack.
- Produces: release-level evidence for the public homepage, role boundaries, responsive layout, and deployment instructions.

- [ ] **Step 1: Write the failing end-to-end acceptance test**

Seed deterministic approved/pending/rejected news and future/past/cancelled events. Test visitor visibility, Mexico-first ordering, original-source links, keyboard tabs, expired-event exclusion, moderator visibility, admin-only controls, and manual-sync conflict feedback. Run viewport checks at 360x800, 768x1024, and 1440x900 and assert `document.documentElement.scrollWidth === window.innerWidth` at each size.

- [ ] **Step 2: Run the end-to-end test to expose remaining gaps**

Run: `npm run test:e2e -- e2e/home-news-events.spec.ts`

Expected: FAIL only for acceptance gaps not yet covered by component tests; fix those gaps in the owning feature files before continuing.

- [ ] **Step 3: Update project setup and deployment documentation**

Add Ticketmaster key creation, local secrets, Supabase Vault, database push, Edge Function deploy, initial source review/load, cron verification, manual sync, and production smoke-check steps to `README.md`, linking to `docs/operations/news-events-sync.md` for diagnostics and rollback.

- [ ] **Step 4: Run the complete verification suite**

Run: `npm test`

Expected: all Jest tests PASS.

Run: `npm run lint && npm run typecheck && npm run build`

Expected: all commands PASS with no errors.

Run: `npm run test:e2e -- e2e/home-news-events.spec.ts`

Expected: PASS at all three target viewports.

Run: `git status --short`

Expected: only the intended plan progress edit may remain; no generated secrets, local Supabase state, or build output is tracked.

- [ ] **Step 5: Commit acceptance coverage and documentation**

```bash
git add e2e/home-news-events.spec.ts README.md
git commit -m "test: cover rock portal homepage release"
```
