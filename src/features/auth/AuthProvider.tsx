import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { hasSupabase, supabase } from '../../lib/supabase'

type Profile={id:string;username:string;display_name:string;role:'member'|'moderator'|'admin'}
type AuthState={user:User|null;profile:Profile|null;loading:boolean;signOut:()=>Promise<void>}
const AuthContext=createContext<AuthState|undefined>(undefined)
export function AuthProvider({children}:{children:ReactNode}){
 const [user,setUser]=useState<User|null>(null),[profile,setProfile]=useState<Profile|null>(null),[loading,setLoading]=useState(hasSupabase)
 useEffect(()=>{if(!hasSupabase)return; supabase.auth.getSession().then(({data})=>setUser(data.session?.user??null)).finally(()=>setLoading(false)); const {data}=supabase.auth.onAuthStateChange(async(_,session)=>{setUser(session?.user??null);if(session?.user){const result=await supabase.from('profiles').select('id,username,display_name,role').eq('id',session.user.id).single();setProfile(result.data as Profile)}else setProfile(null)});return()=>data.subscription.unsubscribe()},[])
 const value=useMemo(()=>({user,profile,loading,signOut:async()=>{await supabase.auth.signOut()}}),[user,profile,loading])
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useAuth requiere AuthProvider');return value}
