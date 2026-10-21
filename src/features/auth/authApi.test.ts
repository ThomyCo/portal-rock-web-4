import { authErrorMessage, safeNext, validatePassword } from './authApi'
it('requires ten character passwords',()=>{ expect(validatePassword('corta123')).toBe(false); expect(validatePassword('larga12345')).toBe(true) })
it('only accepts local redirect paths',()=>{ expect(safeNext('/favoritos')).toBe('/favoritos'); expect(safeNext('//evil.test')).toBe('/'); expect(safeNext('https://evil.test')).toBe('/') })
it('explains common Supabase registration failures',()=>{
  expect(authErrorMessage({message:'Failed to fetch'})).toContain('conectar')
  expect(authErrorMessage({message:'Database error saving new user'})).toContain('perfil')
  expect(authErrorMessage({message:'Email signups are disabled'})).toContain('deshabilitado')
})
