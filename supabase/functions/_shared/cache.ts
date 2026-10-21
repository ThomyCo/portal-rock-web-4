type Entry<T>={value:T;expires:number}
const memory=new Map<string,Entry<unknown>>()
export function cached<T>(key:string){const e=memory.get(key)as Entry<T>|undefined;return e&&e.expires>Date.now()?e.value:null}
export function storeCache<T>(key:string,value:T,ttlMs=7*24*60*60*1000){memory.set(key,{value,expires:Date.now()+ttlMs});return value}
