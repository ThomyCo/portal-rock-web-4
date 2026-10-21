const { TextDecoder, TextEncoder } = require('node:util')
const { webcrypto } = require('node:crypto')

Object.assign(globalThis, { TextDecoder, TextEncoder })
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true })
