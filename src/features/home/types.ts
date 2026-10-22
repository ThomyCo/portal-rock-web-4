export type NewsCategory = 'mexico' | 'international' | 'releases' | 'festivals' | 'other'
export type HomeNewsItem = { id:string;title:string;summary:string;url:string;imageUrl:string|null;publishedAt:string;category:NewsCategory;featured:boolean;editorialOrder:number|null;sourceName:string }
export type HomeEvent = { id:string;name:string;artistName:string;startsAt:string;venueName:string;city:string;state:string|null;countryCode:string;imageUrl:string|null;ticketUrl:string;scope:'mexico'|'international';status:'scheduled'|'postponed'|'cancelled'|'completed';genres:string[];bandSlug:string|null }
export type HomeContent = { news:HomeNewsItem[];mexicoEvents:HomeEvent[];internationalEvents:HomeEvent[] }
