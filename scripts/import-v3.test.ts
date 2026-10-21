import{parseV3Messages,parseV3Users}from'./import-v3'
it('reserves valid unique usernames without importing hashes',()=>{const result=parseV3Users('ana|pbkdf2:secret\nANA|other\nro');expect(result).toEqual([{username:'ana',legacyKey:'user:0:ana'}]);expect(JSON.stringify(result)).not.toContain('pbkdf2')})
it('drops malformed and oversized messages',()=>{expect(parseV3Messages(`ana|2020-01-01|Hola\nana|date|${'x'.repeat(1201)}`)).toHaveLength(1);expect(parseV3Messages('')).toEqual([])})
