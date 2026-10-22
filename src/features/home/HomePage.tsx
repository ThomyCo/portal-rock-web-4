import { Link } from 'react-router-dom'
import { EventCard } from './EventCard'
import { HomeImage } from './HomeImage'
import { NewsTabs } from './NewsTabs'
import { useHomeContent } from './useHomeContent'
import { MexicoEvents } from './MexicoEvents'
import './home.css'

export function HomePage(){const{data,isLoading,error}=useHomeContent();if(isLoading)return <main className="news-home"><p role="status">Preparando la edición de hoy…</p></main>;const content=data??{news:[],mexicoEvents:[],internationalEvents:[]};const lead=content.news.find(item=>item.featured)??content.news[0];return <main className="news-home">
  <header className="edition-header"><div><p>PORTAL ROCK · EDICIÓN DIGITAL</p><h1>Ruido, escenario y actualidad</h1></div><time>{new Intl.DateTimeFormat('es-MX',{dateStyle:'full'}).format(new Date())}</time></header>
  {error&&<p className="content-warning" role="status">Mostramos la última edición disponible.</p>}
  {lead?<section className="lead-layout" aria-label="Historia principal"><article className="lead-story"><HomeImage src={lead.imageUrl} alt={`Imagen de ${lead.title}`} className="lead-image"/><div className="lead-copy"><span>{lead.category}</span><h2>{lead.title}</h2><p>{lead.summary}</p><small>{lead.sourceName}</small><a href={lead.url} target="_blank" rel="noreferrer">Leer en la fuente</a></div></article><NewsTabs news={content.news}/></section>:<section className="empty-editorial"><p className="eyebrow">PRÓXIMA EDICIÓN</p><h2>Preparamos la próxima edición</h2><p>Las noticias aparecerán aquí después de la revisión editorial.</p></section>}
  {content.news.length>0&&<section className="news-section" aria-labelledby="news-title"><div className="section-heading"><p>ARCHIVO RECIENTE</p><h2 id="news-title">Noticias destacadas</h2></div><div className="news-card-grid">{content.news.filter(item=>item.id!==lead?.id).slice(0,3).map(item=><article className="news-card" key={item.id}><HomeImage src={item.imageUrl} alt={`Imagen de ${item.title}`}/><span>{item.category}</span><h3>{item.title}</h3><p>{item.summary}</p><small>{item.sourceName}</small><a href={item.url} target="_blank" rel="noreferrer">Abrir noticia</a></article>)}</div></section>}
  <section className="events-section" aria-labelledby="mx-events"><div className="section-heading"><p>AGENDA NACIONAL</p><h2 id="mx-events">Conciertos en México</h2></div>{content.mexicoEvents.length?<MexicoEvents events={content.mexicoEvents}/>:<p>No hay conciertos próximos disponibles. Explora el mapa para descubrir más escenas.</p>}</section>
  {content.internationalEvents.length>0&&<section className="events-section international" aria-labelledby="world-events"><div className="section-heading"><p>FUERA DE MÉXICO</p><h2 id="world-events">Selección internacional</h2></div><div className="event-rail" tabIndex={0} aria-label="Conciertos internacionales">{content.internationalEvents.map(event=><EventCard key={event.id} event={event}/>)}</div></section>}
  <section className="portal-links" aria-label="Explora Portal Rock"><div><p className="eyebrow">GEOGRAFÍA MUSICAL</p><h2>De la noticia al lugar donde comenzó todo</h2></div><div><Link className="button button-primary" to="/mapa" aria-label="Explorar mapa interactivo">Explorar mapa</Link><Link className="button button-ghost" to="/comunidad">Entrar a la comunidad</Link></div></section>
  </main>}
