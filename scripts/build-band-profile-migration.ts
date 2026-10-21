import fs from 'node:fs'
import path from 'node:path'
import { fetchCommonsMetadata, fetchWikidataImage, fetchWikidataImages, type CommonsMedia } from './wikimedia.ts'

type Entry = { slug:string; wikidataId:string; summary:string; biography:string[]; imageAlt:string; endedYear:number|null }
export type ImportWarning = { slug:string; message:string }
type Options = { manifest:Entry[]; contact:string; fetchImage?:(qid:string)=>Promise<string|null>; fetchMedia?:(title:string, contact:string)=>Promise<CommonsMedia> }

export const sqlLiteral = (value:string|null) => value === null ? 'null' : `'${value.replaceAll("'", "''")}'`

export async function buildBandProfileMigration({ manifest, contact, fetchImage = fetchWikidataImage, fetchMedia = fetchCommonsMetadata }:Options) {
  const warnings:ImportWarning[] = []
  const statements:string[] = ['begin;']
  for (const entry of [...manifest].sort((a,b)=>a.slug.localeCompare(b.slug))) {
    let media:CommonsMedia|null = null
    try {
      const title = await fetchImage(entry.wikidataId)
      if (title) media = await fetchMedia(title, contact)
      else warnings.push({ slug:entry.slug, message:'Wikidata no contiene P18' })
    } catch (error) { warnings.push({ slug:entry.slug, message:error instanceof Error ? error.message : String(error) }) }
    const values = [`summary = ${sqlLiteral(entry.summary)}`, `biography = ${sqlLiteral(entry.biography.join('\\n\\n'))}`, `ended_year = ${entry.endedYear ?? 'null'}`, `image_alt = ${sqlLiteral(entry.imageAlt)}`]
    if (media) values.push(`image_url = ${sqlLiteral(media.imageUrl)}`, `image_source_url = ${sqlLiteral(media.sourceUrl)}`, `image_author = ${sqlLiteral(media.author)}`, `image_license = ${sqlLiteral(media.license)}`)
    statements.push(`update public.bands set\n  ${values.join(',\n  ')}\nwhere slug = ${sqlLiteral(entry.slug)};`)
  }
  statements.push('commit;')
  return { sql:statements.join('\n\n')+'\n', warnings }
}

const invoked = process.argv[1]?.replaceAll('\\','/').endsWith('/scripts/build-band-profile-migration.ts')
async function main() {
  const root = process.cwd()
  const contact = process.env.ADMIN_CONTACT
  if (!contact) throw new Error('ADMIN_CONTACT es obligatorio')
  const manifest = JSON.parse(fs.readFileSync(path.join(root,'content/bands.es.json'),'utf8')) as Entry[]
  const imageTitles=await fetchWikidataImages(manifest.map(entry=>entry.wikidataId))
  const result = await buildBandProfileMigration({ manifest, contact, fetchImage:async qid=>imageTitles.get(qid)??null })
  fs.writeFileSync(path.join(root,'supabase/migrations/202610210005_band_profile_content.sql'), result.sql)
  fs.mkdirSync(path.join(root,'migration-reports'),{recursive:true})
  fs.writeFileSync(path.join(root,'migration-reports/band-profile-content.json'),JSON.stringify(result.warnings,null,2))
  console.log(`${manifest.length} bandas procesadas; ${result.warnings.length} advertencias`)
}
if (invoked) void main()
