import { describeSyncError, validateNewsEdit, validateNewsSource } from './contentAdminApi'

test('validates editorial fields and accepted categories',()=>{
  expect(()=>validateNewsEdit({title:'',summary:'Texto',category:'mexico'})).toThrow('título')
  expect(()=>validateNewsEdit({title:'Nota',summary:'',category:'mexico'})).toThrow('resumen')
  expect(()=>validateNewsEdit({title:'Nota',summary:'Texto',category:'sports'})).toThrow('categoría')
  expect(()=>validateNewsEdit({title:'Nota',summary:'Texto',category:'releases'})).not.toThrow()
})

test('requires HTTPS and at least one category for RSS sources',()=>{
  expect(()=>validateNewsSource({name:'Feed',feedUrl:'http://x.test/rss',siteUrl:'https://x.test',countryCode:'MX',languageCode:'es',allowedCategories:['mexico'],active:true})).toThrow('HTTPS')
  expect(()=>validateNewsSource({name:'Feed',feedUrl:'https://x.test/rss',siteUrl:'https://x.test',countryCode:'MX',languageCode:'es',allowedCategories:[],active:true})).toThrow('categoría')
})

test('turns a synchronization conflict into an actionable message',()=>{
  expect(describeSyncError({context:{status:409}})).toBe('Ya hay una sincronización en curso')
})
