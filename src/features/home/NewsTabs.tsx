import { useRef, useState } from 'react'
import type { HomeNewsItem, NewsCategory } from './types'

const tabs:{label:string;categories:NewsCategory[]}[]=[
  {label:'México',categories:['mexico','festivals']},
  {label:'Internacional',categories:['international']},
  {label:'Estrenos',categories:['releases']},
]
export function NewsTabs({news}:{news:HomeNewsItem[]}){
  const[active,setActive]=useState(0);const refs=useRef<Array<HTMLButtonElement|null>>([])
  const choose=(index:number)=>{const next=(index+tabs.length)%tabs.length;setActive(next);refs.current[next]?.focus()}
  return <section className="quick-news" aria-labelledby="quick-title"><h2 id="quick-title">Actualidad rápida</h2>
    <div role="tablist" aria-label="Secciones de noticias">{tabs.map((tab,index)=><button key={tab.label} ref={node=>{refs.current[index]=node}} role="tab" aria-selected={active===index} aria-controls={`news-panel-${index}`} id={`news-tab-${index}`} tabIndex={active===index?0:-1} onClick={()=>setActive(index)} onKeyDown={event=>{if(event.key==='ArrowRight')choose(active+1);if(event.key==='ArrowLeft')choose(active-1);if(event.key==='Home')choose(0);if(event.key==='End')choose(tabs.length-1)}}>{tab.label}</button>)}</div>
    <div role="tabpanel" id={`news-panel-${active}`} aria-labelledby={`news-tab-${active}`}><ol>{news.filter(item=>tabs[active].categories.includes(item.category)).slice(0,5).map(item=><li key={item.id}><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a><small>{item.sourceName} · {new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short'}).format(new Date(item.publishedAt))}</small></li>)}</ol>{!news.some(item=>tabs[active].categories.includes(item.category))&&<p>No hay notas aprobadas en esta sección.</p>}</div>
  </section>
}
