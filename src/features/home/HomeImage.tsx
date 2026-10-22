import { useState } from 'react'

export function HomeImage({src,alt,className}:{src:string|null;alt:string;className?:string}){
  const[failed,setFailed]=useState(false)
  if(!src||failed)return <div className={`home-image-fallback ${className??''}`} role="img" aria-label={alt}><span>PORTAL</span><strong>ROCK</strong></div>
  return <img className={className} src={src} alt={alt} loading="lazy" onError={()=>setFailed(true)}/>
}
