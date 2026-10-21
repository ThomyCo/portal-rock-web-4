export type Actor={id:string;role:'member'|'moderator'|'admin'}
export type SyncBandInput={bandId:string;musicbrainzId?:string;wikidataId?:string}
export type SyncResult={status:'ok'|'partial'|'error';created:string[];updated:string[];ignored:string[];warnings:string[]}
export type MusicBrainzArtist={id:string;name:string;country?:string;'life-span'?:{begin?:string;end?:string}}
export type WikidataBandData={qid:string;label?:string;description?:string;officialWebsite?:string}
