import { useState } from 'react'
import type { BandDetail } from './types'

type Props=Pick<BandDetail,'name'|'heroImageUrl'|'imageAlt'|'imageAuthor'|'imageLicense'|'imageSourceUrl'>
export function BandHeroImage({name,heroImageUrl,imageAlt,imageAuthor,imageLicense,imageSourceUrl}:Props){
 const [failed,setFailed]=useState(false), valid=heroImageUrl?.startsWith('https://') && imageAlt && imageAuthor && imageLicense && imageSourceUrl?.startsWith('https://')
 if(!valid||failed)return <div className="cover-fallback" aria-label={`Imagen gráfica de ${name}`}><span>{name.slice(0,2).toUpperCase()}</span></div>
 return <figure className="band-photo"><img src={heroImageUrl!} alt={imageAlt!} width="960" height="1200" loading="eager" decoding="async" onError={()=>setFailed(true)}/><figcaption>Foto: <a href={imageSourceUrl!} target="_blank" rel="noreferrer">{imageAuthor} · {imageLicense}</a></figcaption></figure>
}
