import { supabase } from '../../lib/supabase'

export const newsCategories=['mexico','international','releases','festivals','other'] as const
export type NewsCategory=typeof newsCategories[number]
export type NewsEdit={title:string;summary:string;category:string}
export type NewsSourceInput={id?:string;name:string;feedUrl:string;siteUrl:string;countryCode:string;languageCode:string;allowedCategories:string[];active:boolean}

export function validateNewsEdit(input:NewsEdit){if(!input.title.trim())throw new Error('Agrega un título.');if(!input.summary.trim())throw new Error('Agrega un resumen.');if(!newsCategories.includes(input.category as NewsCategory))throw new Error('Selecciona una categoría válida.')}
export function validateNewsSource(input:NewsSourceInput){if(!input.feedUrl.startsWith('https://')||!input.siteUrl.startsWith('https://'))throw new Error('Las direcciones deben usar HTTPS.');if(!input.allowedCategories.length)throw new Error('Selecciona al menos una categoría.')}
export function describeSyncError(error:unknown){const status=(error as {context?:{status?:number}})?.context?.status;return status===409?'Ya hay una sincronización en curso':error instanceof Error?error.message:'No fue posible sincronizar.'}

export async function listPendingNews(){const{data,error}=await supabase.from('rock_news').select('*, rock_news_sources(name)').eq('status','pending').order('published_at',{ascending:false});if(error)throw error;return data??[]}
export async function listApprovedNews(){const{data,error}=await supabase.from('rock_news').select('*, rock_news_sources(name)').eq('status','approved').order('editorial_order',{ascending:true}).order('published_at',{ascending:false});if(error)throw error;return data??[]}
export async function moderateNews(id:string,decision:'approve'|'reject',edit:NewsEdit){validateNewsEdit(edit);const{data,error}=await supabase.rpc('moderate_rock_news',{news_id:id,decision,edited_title:edit.title,edited_summary:edit.summary,edited_category:edit.category});if(error)throw error;return data}
export async function featureNews(id:string){const{data,error}=await supabase.rpc('set_featured_rock_news',{news_id:id});if(error)throw error;return data}
export async function reorderNews(ids:string[]){const{error}=await supabase.rpc('reorder_rock_news',{news_ids:ids});if(error)throw error}
export async function listEventsForAdmin(){const{data,error}=await supabase.from('rock_events').select('*').order('starts_at',{ascending:true}).limit(100);if(error)throw error;return data??[]}
export async function setEventHidden(id:string,hidden:boolean){const{data,error}=await supabase.rpc('set_rock_event_hidden',{event_id:id,should_hide:hidden});if(error)throw error;return data}
export async function listNewsSources(){const{data,error}=await supabase.from('rock_news_sources').select('*').order('name');if(error)throw error;return data??[]}
export async function saveNewsSource(input:NewsSourceInput){validateNewsSource(input);const{data,error}=await supabase.rpc('set_rock_news_source',{source_id:input.id??null,source_name:input.name,feed_url:input.feedUrl,site_url:input.siteUrl,source_country:input.countryCode,source_language:input.languageCode,allowed_categories:input.allowedCategories,should_be_active:input.active});if(error)throw error;return data}
export async function requestContentSync(){const{data,error}=await supabase.functions.invoke('sync-rock-content',{body:{triggerKind:'manual'}});if(error)throw new Error(describeSyncError(error));return data}
export async function listContentSyncRuns(){const{data,error}=await supabase.from('content_sync_runs').select('*').order('started_at',{ascending:false}).limit(20);if(error)throw error;return data??[]}
