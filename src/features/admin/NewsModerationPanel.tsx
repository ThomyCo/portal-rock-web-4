import { FormEvent, useState } from 'react'
import { newsCategories } from './contentAdminApi'
import type { useContentAdmin } from './useContentAdmin'

type Manager = ReturnType<typeof useContentAdmin>
type NewsItem = { id:string; title:string; summary:string; category:string; canonical_url:string; featured:boolean; rock_news_sources?:{name?:string}|null }

function NewsEditor({ item, manager, onMessage }:{ item:NewsItem; manager:Manager; onMessage:(value:string)=>void }) {
  const submit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const form=new FormData(event.currentTarget);manager.moderate.mutate({id:item.id,decision:'approve',edit:{title:String(form.get('title')),summary:String(form.get('summary')),category:String(form.get('category'))}},{onSuccess:()=>onMessage('Noticia guardada y aprobada.'),onError:error=>onMessage(error.message)})}
  return <form onSubmit={submit} className="admin-editor">
    <label>Título<input name="title" defaultValue={item.title} required /></label>
    <label>Resumen<textarea name="summary" defaultValue={item.summary||'Sin resumen del medio.'} required /></label>
    <label>Categoría<select name="category" defaultValue={item.category}>{newsCategories.map(category=><option key={category}>{category}</option>)}</select></label>
    <button>Guardar y aprobar</button>
  </form>
}

export function NewsModerationPanel({manager}:{manager:Manager}) {
  const[message,setMessage]=useState('');const pending=(manager.pending.data??[]) as NewsItem[];const approved=(manager.approved.data??[]) as NewsItem[]
  const reject=(item:NewsItem)=>manager.moderate.mutate({id:item.id,decision:'reject',edit:{title:item.title,summary:item.summary||'Sin resumen del medio.',category:item.category}},{onSuccess:()=>setMessage('Noticia retirada.'),onError:error=>setMessage(error.message)})
  return <section id="noticias" className="admin-card"><h2>Noticias pendientes</h2><p>Edita título, resumen y categoría antes de publicar.</p>{pending.length===0?<div className="empty"><p>No hay noticias pendientes.</p></div>:<div className="admin-list">{pending.map(item=><article key={item.id}><small>{item.rock_news_sources?.name??'Fuente externa'} · {item.category}</small><a href={item.canonical_url} target="_blank" rel="noreferrer">Vista en la fuente</a><NewsEditor item={item} manager={manager} onMessage={setMessage}/><button onClick={()=>{if(confirm('¿Rechazar esta noticia?'))reject(item)}}>Rechazar</button></article>)}</div>}<h3>Publicadas</h3>{approved.length===0?<p>No hay noticias aprobadas.</p>:<ol className="approved-list">{approved.map((item,index)=><li key={item.id}><details><summary>{item.title}</summary><NewsEditor item={item} manager={manager} onMessage={setMessage}/></details><button disabled={item.featured} onClick={()=>manager.feature.mutate(item.id)}>{item.featured?'Principal':'Hacer principal'}</button><button disabled={index===0} onClick={()=>{const ids=approved.map(row=>row.id);[ids[index-1],ids[index]]=[ids[index],ids[index-1]];manager.reorder.mutate(ids)}}>Subir</button><button onClick={()=>reject(item)}>Retirar</button></li>)}</ol>}<p role="status">{message}</p></section>
}
