import { Link } from 'react-router-dom'
import type { HomeEvent } from './types'
import { HomeImage } from './HomeImage'

const labels={scheduled:'Programado',postponed:'Pospuesto',cancelled:'Cancelado',completed:'Finalizado'} as const
export function EventCard({event}:{event:HomeEvent}){const actionable=event.status==='scheduled';return <article className="event-card">
  <HomeImage src={event.imageUrl} alt={`Imagen de ${event.artistName}`}/><div className="event-date"><strong>{new Intl.DateTimeFormat('es-MX',{day:'2-digit'}).format(new Date(event.startsAt))}</strong><span>{new Intl.DateTimeFormat('es-MX',{month:'short'}).format(new Date(event.startsAt))}</span></div>
  <div><span className={`event-status status-${event.status}`}>{labels[event.status]}</span><h3>{event.name}</h3><p>{event.venueName} · {event.city}</p><div className="event-actions">{actionable&&<a href={event.ticketUrl} target="_blank" rel="noreferrer" aria-label={`Boletos para ${event.name}`}>Boletos</a>}{event.bandSlug&&<Link to={`/bandas/${event.bandSlug}`} aria-label={`Ver perfil de ${event.artistName}`}>Perfil</Link>}</div></div>
  </article>}
