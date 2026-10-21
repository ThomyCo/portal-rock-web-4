import { hasSupabase, supabase } from '../../lib/supabase'

type AuthErrorLike = { message?: string; code?: string; status?: number }

export function authErrorMessage(error: AuthErrorLike | unknown) {
  const detail = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Error desconocido'
  const message = detail.toLocaleLowerCase()
  if (message.includes('failed to fetch') || message.includes('fetch failed') || message.includes('network')) return 'No pudimos conectar con Supabase. Revisa que el proyecto esté activo, la URL sea correcta y reinicia la aplicación.'
  if (message.includes('database error saving new user')) return 'Supabase creó el acceso, pero no pudo crear el perfil. Revisa el disparador on_auth_user_created en la base de datos.'
  if (message.includes('signup') && message.includes('disabled')) return 'El registro por correo está deshabilitado en Supabase Authentication → Providers → Email.'
  if (message.includes('already registered') || message.includes('already exists')) return 'Ese correo o nombre de usuario ya está registrado.'
  if (message.includes('rate limit')) return 'Se alcanzó temporalmente el límite de correos de registro. Espera unos minutos e inténtalo otra vez.'
  if (message.includes('invalid email')) return 'El correo electrónico no tiene un formato válido.'
  return `No fue posible crear la cuenta. Detalle de Supabase: ${detail}`
}

export const validatePassword = (password: string) => password.length >= 10
export async function register(email:string,password:string,username:string,displayName:string) {
  if (!validatePassword(password)) throw new Error('La contraseña debe tener al menos 10 caracteres.')
  if (!hasSupabase) throw new Error('Supabase no está configurado. Revisa .env.local y reinicia la aplicación.')
  try {
    const { data,error } = await supabase.auth.signUp({ email,password,options:{ data:{ username,display_name:displayName } } })
    if (error) throw new Error(authErrorMessage(error))
    return data
  } catch (error) {
    if (error instanceof Error && !error.message.startsWith('No fue posible') && !error.message.startsWith('No pudimos') && !error.message.startsWith('Supabase') && !error.message.startsWith('El registro') && !error.message.startsWith('Ese correo') && !error.message.startsWith('Se alcanzó')) throw new Error(authErrorMessage(error))
    throw error
  }
}
export async function login(email:string,password:string) { const {data,error}=await supabase.auth.signInWithPassword({email,password}); if(error) throw new Error('Correo o contraseña incorrectos.'); return data }
export async function requestPasswordReset(email:string) { const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${location.origin}/perfil`}); if(error) throw new Error('No fue posible enviar el enlace.'); }
export function safeNext(value:string|null) { return value && value.startsWith('/') && !value.startsWith('//') ? value : '/' }
