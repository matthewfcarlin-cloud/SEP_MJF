/**
 * The server's cryptography, all from node:crypto.
 *  - Sign-in codes and sharing codes are short, so they are stored as an HMAC under AUTH_SECRET:
 *    a copy of the database alone cannot be used to guess them.
 *  - Session tokens are 256 random bits; only their SHA-256 is stored.
 *  - Records and plans are sealed with AES-256-GCM under DATA_KEY, which lives in the server's
 *    environment and never in the database.
 */
import { SIGN_IN_CODE_DIGITS } from '@reco/core'

import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'

const CODE_DIGITS = SIGN_IN_CODE_DIGITS
const TOKEN_BYTES = 32
const IV_BYTES = 12
const TAG_BYTES = 16
const SEAL_VERSION = 'v1'
/** No 0/O, 1/I/L: a code read aloud or typed from a sticky note stays unambiguous. */
const INVITE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const INVITE_LENGTH = 8

export const newSignInCode = (): string => String(randomInt(0, 10 ** CODE_DIGITS)).padStart(CODE_DIGITS, '0')

export const newInviteCode = (): string =>
  Array.from({ length: INVITE_LENGTH }, () => INVITE_ALPHABET[randomInt(0, INVITE_ALPHABET.length)]).join('')

/** Codes are typed by hand: ignore case, spaces and dashes. */
export const normaliseInviteCode = (raw: string): string => raw.toUpperCase().replace(/[^A-Z0-9]/g, '')

export const newSessionToken = (): string => randomBytes(TOKEN_BYTES).toString('base64url')

export const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex')

export const keyedHash = (secret: string, purpose: string, value: string): string =>
  createHmac('sha256', secret).update(`${purpose}:${value}`).digest('hex')

export function sameHash(a: string, b: string): boolean {
  const x = Buffer.from(a, 'hex')
  const y = Buffer.from(b, 'hex')
  return x.length === y.length && timingSafeEqual(x, y)
}

/** Seals JSON. `context` binds the ciphertext to its row, so a sealed record cannot be moved to another patient. */
export function seal(key: Buffer, context: string, value: unknown): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  cipher.setAAD(Buffer.from(context))
  const body = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()])
  return [SEAL_VERSION, iv.toString('base64'), cipher.getAuthTag().toString('base64'), body.toString('base64')].join('.')
}

export function unseal(key: Buffer, context: string, sealed: string): unknown {
  const [version, iv, tag, body] = sealed.split('.')
  if (version !== SEAL_VERSION || !iv || !tag || body === undefined) throw new Error('RECO server: a stored record is not in a format this version can read')
  const tagBytes = Buffer.from(tag, 'base64')
  if (tagBytes.length !== TAG_BYTES) throw new Error('RECO server: a stored record has a damaged seal')
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'))
  decipher.setAAD(Buffer.from(context))
  decipher.setAuthTag(tagBytes)
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(body, 'base64')), decipher.final()]).toString('utf8'))
}
