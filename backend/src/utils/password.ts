import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'

const BETTER_AUTH_CONFIG = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
  maxmem: 128 * 16384 * 16 * 2,
}

/**
 * Hash a password using scrypt (compatible with Better Auth)
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = randomBytes(16)
    const derivedKey = scryptSync(password.normalize('NFKC'), salt, BETTER_AUTH_CONFIG.dkLen, {
      N: BETTER_AUTH_CONFIG.N,
      r: BETTER_AUTH_CONFIG.r,
      p: BETTER_AUTH_CONFIG.p,
      maxmem: BETTER_AUTH_CONFIG.maxmem,
    })
    return `${salt.toString('hex')}:${derivedKey.toString('hex')}`
  } catch (error) {
    console.error('[password] hashPassword Error:', error)
    throw error
  }
}

/**
 * Verify a password against a hash (supports both Better Auth 'salt:key' and legacy formats)
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    if (!hash || !password) return false

    // Check if it's Better Auth's standard "salt:key" format
    if (hash.includes(':')) {
      const [saltHex, keyHex] = hash.split(':')
      if (!saltHex || !keyHex) return false
      const salt = Buffer.from(saltHex, 'hex')
      const expectedKey = Buffer.from(keyHex, 'hex')

      const derivedKey = scryptSync(password.normalize('NFKC'), salt, expectedKey.length, {
        N: BETTER_AUTH_CONFIG.N,
        r: BETTER_AUTH_CONFIG.r,
        p: BETTER_AUTH_CONFIG.p,
        maxmem: BETTER_AUTH_CONFIG.maxmem,
      })

      if (derivedKey.length !== expectedKey.length) return false
      return timingSafeEqual(derivedKey, expectedKey)
    }

    // Fallback: raw hex (16-byte salt + derived key)
    const hashBuffer = Buffer.from(hash, 'hex')
    if (hashBuffer.length < 16) return false
    const salt = hashBuffer.subarray(0, 16)
    const derivedKey = hashBuffer.subarray(16)

    const targetKey = scryptSync(password, salt, derivedKey.length)
    if (derivedKey.length !== targetKey.length) return false
    return timingSafeEqual(derivedKey, targetKey)
  } catch (error) {
    console.error('[password] verifyPassword Error:', error)
    return false
  }
}
