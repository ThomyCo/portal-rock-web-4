import { useState } from 'react'
import { EventCard } from './EventCard'
import type { HomeEvent } from './types'

type CityGroup='todas'|'cdmx'|'monterrey'|'guadalajara'|'otras'
export function cityGroupFor(city:string):Exclude<CityGroup,'todas'>{const value=city.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();if(value.includes('ciudad de mexico')||value==='cdmx'||value.includes('mexico city'))return'cdmx';if(value.includes('monterrey'))return'monterrey';if(value.includes('guadalajara')||value.includes('zapopan'))return'guadalajara';return'otras'}
const labels:Record<CityGroup,string>={todas:'Todas',cdmx:'CDMX',monterrey:'Monterrey',guadalajara:'Guadalajara',otras:'Otras ciudades'}
export function MexicoEvents({events}:{events:HomeEvent[]}){const[active,setActive]=useState<CityGroup>('todas');const available=(['cdmx','monterrey','guadalajara','otras'] as const).filter(group=>events.some(event=>cityGroupFor(event.city)===group));const visible=active==='todas'?events:events.filter(event=>cityGroupFor(event.city)===active);return <>{events.length>0&&<div className="city-filters" aria-label="Filtrar conciertos por ciudad">{(['todas',...available] as CityGroup[]).map(group=><button key={group} className={active===group?'active':''} aria-pressed={active===group} onClick={()=>setActive(group)}>{labels[group]}</button>)}</div>}<div className="event-rail" tabIndex={0} aria-label="Próximos conciertos en México">{visible.map(event=><EventCard key={event.id} event={event}/>)}</div></>}
