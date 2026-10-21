# Band Profile Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich all 54 band pages with a verified Wikimedia Commons photograph, attribution, structured facts, and an original Spanish biography rendered inside Portal Rock.

**Architecture:** Store reviewed editorial and media metadata in Supabase and expose it through `public_band_catalog`; the public React app never calls Wikimedia. A Node import tool reads a reviewed 54-band manifest, fetches Wikidata P18 and Commons `imageinfo` metadata, validates licenses, and emits a deterministic SQL migration for review and deployment.

**Tech Stack:** React 19, TypeScript 5.9, Jest and Testing Library, Node.js built-in `fetch`, Supabase PostgreSQL, Wikidata Action API, Wikimedia Commons MediaWiki Action API.

**Spec:** `docs/superpowers/specs/2026-10-21-band-profile-content-design.md`

## Global Constraints

- Process exactly the 54 published catalog bands and preserve users, favorites, forum data, locations, and existing band IDs.
- Use only reviewed Wikidata QIDs; never resolve a band automatically from a name-only search.
- Accept only HTTPS Wikimedia Commons media with nonempty author, license, source page, and alt text.
- Store two to four original Spanish biography paragraphs for every band; do not copy article prose.
- Public band pages read Supabase only and make no Wikimedia request.
- Remove the visible «Consultar fuente abierta» action while retaining provenance in the database.
- Preserve the initials fallback when media is missing or fails to load.
- Keep the approved two-column desktop layout and image-first single-column mobile layout.
- Send a descriptive `User-Agent` using `ADMIN_CONTACT` for Wikimedia requests.

## Review Focus

- An image response containing HTML in `Artist` or `LicenseShortName` must become safe plain text before entering SQL.
- A valid QID with no P18 image must produce a review warning and no partial media update.
- A non-HTTPS thumbnail or file-page URL must fail validation and preserve the existing fallback.
- A broken browser image request must reveal initials without hiding biography or facts.
- Names containing apostrophes or accents must generate valid escaped SQL and update the correct slug.

---

### Task 1: Database contract for enriched profiles

**Files:**
- Create: `supabase/migrations/202610210004_band_profile_media.sql`
- Create: `scripts/band-profile-schema.test.ts`
- Modify: `src/features/bands/types.ts`

**Interfaces:**
- Produces: `BandDetail` fields `endedYear: number | null`, `imageSourceUrl: string | null`, `imageAuthor: string | null`, `imageLicense: string | null`, and `imageAlt: string | null`.
- Produces: matching camel-case columns in `public.public_band_catalog` while retaining every existing column.

- [ ] **Step 1: Write the failing schema test**

Assert that the new migration adds `image_source_url`, `image_author`, `image_license`, and `image_alt`; constrains media URLs to HTTPS when non-null; and exposes all five new DTO fields plus `endedYear` from the public view.

- [ ] **Step 2: Run the schema test and verify red**

Run: `npm test -- --runTestsByPath scripts/band-profile-schema.test.ts`  
Expected: FAIL because the migration and fields do not exist.

- [ ] **Step 3: Add the migration and frontend types**

Use nullable `text` columns on `public.bands`, retain existing `image_url` and `ended_year`, and replace the public view without changing prior column names. Add the exact nullable camel-case properties to `BandDetail`.

- [ ] **Step 4: Run schema and type checks**

Run: `npm test -- --runTestsByPath scripts/band-profile-schema.test.ts && npm run typecheck`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/202610210004_band_profile_media.sql scripts/band-profile-schema.test.ts src/features/bands/types.ts
git commit -m "feat: add band profile media schema"
```

### Task 2: Reviewed catalog manifest

**Files:**
- Create: `content/bands.es.json`
- Create: `scripts/band-content.test.ts`

**Interfaces:**
- Produces: 54 unique records shaped as `{ slug, wikidataId, summary, biography: string[], imageAlt, endedYear }`.
- Consumes: the exact slugs in `src/features/bands/demoCatalog.ts` and the editorial requirements from the spec.

- [ ] **Step 1: Write the failing manifest validation test**

Assert: exactly 54 entries; slugs equal the demo catalog slug set; QIDs match `^Q[1-9][0-9]*$` and are unique; summaries are nonempty; biographies contain two to four nonempty paragraphs; alt text is descriptive; `endedYear` is null or at least the formation year.

- [ ] **Step 2: Run the validation and verify red**

Run: `npm test -- --runTestsByPath scripts/band-content.test.ts`  
Expected: FAIL because the manifest does not exist.

- [ ] **Step 3: Create and editorially review all 54 entries**

Use verified Wikidata entity IDs. Write original Spanish summaries and biography paragraphs covering formation, defining period, evolution, and influence. Use `null` for bands with ongoing or non-contiguous activity that cannot be represented by one ending year.

- [ ] **Step 4: Run manifest validation**

Run: `npm test -- --runTestsByPath scripts/band-content.test.ts`  
Expected: PASS with 54 records.

- [ ] **Step 5: Commit**

```bash
git add content/bands.es.json scripts/band-content.test.ts
git commit -m "content: add reviewed band biographies"
```

### Task 3: Wikimedia metadata client

**Files:**
- Create: `scripts/wikimedia.ts`
- Create: `scripts/wikimedia.test.ts`

**Interfaces:**
- Produces: `fetchWikidataImage(qid: string, fetcher?: typeof fetch): Promise<string | null>` returning the Commons file title from Wikidata P18.
- Produces: `fetchCommonsMetadata(fileTitle: string, contact: string, fetcher?: typeof fetch): Promise<CommonsMedia>`.
- Produces: `CommonsMedia = { imageUrl: string; sourceUrl: string; author: string; license: string }`.
- Produces: `plainText(html: string): string` for sanitized metadata.

- [ ] **Step 1: Write failing client tests with mocked fetch**

Cover a valid P18 statement, missing P18, malformed QID rejection, complete Commons metadata, HTML stripping, non-HTTPS rejection, missing author/license rejection, and network errors. Include apostrophes and accented author names.

- [ ] **Step 2: Run tests and verify red**

Run: `npm test -- --runTestsByPath scripts/wikimedia.test.ts`  
Expected: FAIL because the client does not exist.

- [ ] **Step 3: Implement Wikidata image lookup**

Call `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids=<QID>` and read the first valid P18 value. Validate the QID before any request.

- [ ] **Step 4: Implement Commons metadata lookup**

Call `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=1600&iiextmetadatafilter=Artist%7CLicenseShortName%7CUsageTerms&titles=File:<title>`. Send `User-Agent: PortalRockWeb4/1.0 (contacto: <ADMIN_CONTACT>)`. Normalize protocol-relative URLs and prefer `thumburl` over the original URL.

- [ ] **Step 5: Implement strict normalization**

Convert metadata HTML to plain text, decode basic entities, collapse whitespace, require HTTPS, and throw field-specific errors when author, license, image URL, or description URL is missing.

- [ ] **Step 6: Run client tests**

Run: `npm test -- --runTestsByPath scripts/wikimedia.test.ts`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add scripts/wikimedia.ts scripts/wikimedia.test.ts
git commit -m "feat: add wikimedia metadata client"
```

### Task 4: Deterministic migration generator

**Files:**
- Create: `scripts/build-band-profile-migration.ts`
- Create: `scripts/build-band-profile-migration.test.ts`
- Modify: `package.json`
- Generate: `supabase/migrations/202610210005_band_profile_content.sql`

**Interfaces:**
- Consumes: `content/bands.es.json`, `fetchWikidataImage`, and `fetchCommonsMetadata`.
- Produces: `buildBandProfileMigration(options): Promise<{ sql: string; warnings: ImportWarning[] }>`.
- Produces: npm script `content:bands` invoking the generator through Node TypeScript stripping.

- [ ] **Step 1: Write failing generator tests**

With fixture fetch responses, assert slug-based updates, SQL escaping for `Guns N' Roses` and `Mötley Crüe`, paragraph joining with blank lines, omission of partial image fields when P18 is missing, deterministic slug order, and one warning without aborting the remaining batch.

- [ ] **Step 2: Run tests and verify red**

Run: `npm test -- --runTestsByPath scripts/build-band-profile-migration.test.ts`  
Expected: FAIL because the generator does not exist.

- [ ] **Step 3: Implement the pure generator**

Accept injected manifest and fetcher in tests. Generate one transaction containing slug-keyed `UPDATE public.bands` statements. Escape SQL string literals by doubling single quotes. Never write a media field unless the complete `CommonsMedia` object is valid.

- [ ] **Step 4: Implement the command entry point**

Require `ADMIN_CONTACT`, write the migration to the exact path above, print one line per processed slug, and write unresolved items to `migration-reports/band-profile-content.json` (already ignored by Git).

- [ ] **Step 5: Run generator tests**

Run: `npm test -- --runTestsByPath scripts/build-band-profile-migration.test.ts`  
Expected: PASS.

- [ ] **Step 6: Generate and review the real migration**

Run: `npm run content:bands`  
Expected: 54 processed entries; zero incorrect-entity warnings; any missing licensed image remains null and is listed for manual review.

- [ ] **Step 7: Validate generated content**

Run: `npm test -- --runTestsByPath scripts/band-content.test.ts scripts/build-band-profile-migration.test.ts scripts/band-profile-schema.test.ts`  
Expected: PASS; migration includes updates for all 54 slugs and complete media metadata for every accepted photograph.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json scripts/build-band-profile-migration.ts scripts/build-band-profile-migration.test.ts supabase/migrations/202610210005_band_profile_content.sql
git commit -m "feat: generate licensed band profile content"
```

### Task 5: Resilient band photograph component

**Files:**
- Create: `src/features/bands/BandHeroImage.tsx`
- Create: `src/features/bands/BandHeroImage.test.tsx`

**Interfaces:**
- Consumes: `{ name, heroImageUrl, imageAlt, imageAuthor, imageLicense, imageSourceUrl }` from `BandDetail`.
- Produces: a photograph with attribution or the initials fallback after missing data or `error`.

- [ ] **Step 1: Write failing component tests**

Assert complete metadata renders an image with exact alt text and visible author/license; missing URL renders initials; an image `error` swaps to initials; non-HTTPS media is rejected; content remains present after failure.

- [ ] **Step 2: Run tests and verify red**

Run: `npm test -- --runTestsByPath src/features/bands/BandHeroImage.test.tsx`  
Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement `BandHeroImage`**

Use local error state, fixed `width` and `height`, `loading="eager"` for the hero, `decoding="async"`, and the existing two-character initials fallback. Render attribution as text; link only the attribution source, with no primary external call to action.

- [ ] **Step 4: Run component tests**

Run: `npm test -- --runTestsByPath src/features/bands/BandHeroImage.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/bands/BandHeroImage.tsx src/features/bands/BandHeroImage.test.tsx
git commit -m "feat: add resilient band hero image"
```

### Task 6: Enriched band page layout

**Files:**
- Create: `src/features/bands/BandPage.test.tsx`
- Modify: `src/features/bands/BandPage.tsx`
- Modify: `src/app/app.css`
- Modify: `src/features/bands/demoCatalog.ts`

**Interfaces:**
- Consumes: the expanded `BandDetail` contract and `BandHeroImage` from Tasks 1 and 5.
- Produces: the approved desktop and mobile profile layouts without the former source action.

- [ ] **Step 1: Write the failing page test**

Mock `getBand` with a complete band and assert city/country, formation and ending years, genres, summary, every biography paragraph, photograph attribution, and favorites are present; assert «Consultar fuente abierta» is absent. Add a second case with null media fields and assert initials.

- [ ] **Step 2: Run tests and verify red**

Run: `npm test -- --runTestsByPath src/features/bands/BandPage.test.tsx`  
Expected: FAIL against the existing page.

- [ ] **Step 3: Refactor `BandPage` into approved sections**

Render `city, countryCode`, active years derived from `formationYear/endedYear`, genres, summary, favorite action, `BandHeroImage`, and biography paragraphs split on blank lines. Remove the standalone source link.

- [ ] **Step 4: Update demo data contract**

Add nullable attribution and activity fields to all local demo objects so fallback mode remains type-safe and usable without Supabase.

- [ ] **Step 5: Implement responsive styling**

Use two hero columns above 720px, image first and one text column at or below 720px, readable story width, visible attribution, and no horizontal overflow at 360px.

- [ ] **Step 6: Run page and regression tests**

Run: `npm test -- --runTestsByPath src/features/bands/BandPage.test.tsx src/features/bands/api.test.ts src/app/App.test.tsx`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/bands/BandPage.test.tsx src/features/bands/BandPage.tsx src/features/bands/demoCatalog.ts src/app/app.css
git commit -m "feat: redesign enriched band profiles"
```

### Task 7: Deployment validation and operator guide

**Files:**
- Modify: `docs/data-sources.md`
- Modify: `docs/operations.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: migrations and scripts from Tasks 1–6.
- Produces: exact commands for content refresh, review, database push, rollback, and visual verification.

- [ ] **Step 1: Document data provenance and refresh workflow**

Record the official Wikidata and Commons endpoints, `ADMIN_CONTACT`, manifest review requirement, `npm run content:bands`, generated report, and attribution requirements. Reference the official MediaWiki `imageinfo` and Wikidata entity documentation.

- [ ] **Step 2: Document deployment and rollback**

Specify `npx supabase db push`, the two migration filenames, a pre-push database backup, and rollback by clearing only the new media metadata while retaining biographies and all unrelated tables.

- [ ] **Step 3: Run the complete automated verification**

Run: `npm test && npm run typecheck && npm run build`  
Expected: all test suites pass, TypeScript exits 0, and Vite produces `dist`.

- [ ] **Step 4: Verify the database result**

After pushing migrations, query `public_band_catalog` and assert 54 rows, 54 biographies with at least two paragraphs, and no media row with incomplete attribution.

- [ ] **Step 5: Perform responsive acceptance review**

Open at least The Beatles, Queen, Guns N' Roses, Mötley Crüe, Soda Stereo, and one intentional fallback at 360, 768, and 1440 pixels. Confirm correct photograph identity, attribution, reading order, no visible source call to action, and no horizontal overflow.

- [ ] **Step 6: Commit**

```bash
git add README.md docs/data-sources.md docs/operations.md
git commit -m "docs: add band content operations guide"
```

### Task 8: Final repository and remote verification

**Files:**
- Review: all files changed in Tasks 1–7

**Interfaces:**
- Consumes: the complete feature branch.
- Produces: one verified branch ready to push and deploy.

- [ ] **Step 1: Inspect repository state and secret exclusions**

Run: `git status --short && git check-ignore .env.local .tmp supabase/.temp`  
Expected: only intentional changes before final commit; all three local paths are ignored.

- [ ] **Step 2: Scan tracked content for credentials**

Run a tracked-file search for assigned `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, GitHub tokens, and local `.env` files.  
Expected: no secret values; `.env.example` contains placeholders only.

- [ ] **Step 3: Review the complete branch diff**

Verify every spec acceptance criterion maps to code, data, a test, and the deployment guide. Confirm generated content contains all 54 slugs exactly once.

- [ ] **Step 4: Push the branch**

Run: `git push`  
Expected: GitHub accepts the branch without repository rule or secret-scanning violations.
