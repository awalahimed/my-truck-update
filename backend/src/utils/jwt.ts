import { SignJWT, jwtVerify } from 'jose'
import { config } from '../config/env_config.js'

export interface JWTPayload extends Record<string, unknown> {
  userId: string
  email: string
  name: string
  role: string
  phoneNumber: string
  phoneNumberVerified: boolean
  emailVerified?: boolean
  banned?: boolean
  accountStatus?: string | undefined
  type: 'access' | 'refresh'
  iat: number // Issued at (seconds)
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

/**
 * Generate an access token (15 minutes expiry)
 */
export async function generateAccessToken(user: {
  id: string
  email: string
  name: string
  role: string
  phoneNumber: string
  phoneNumberVerified: boolean
  emailVerified?: boolean
  banned?: boolean
  accountStatus?: string
}): Promise<string> {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phoneNumber: user.phoneNumber,
    phoneNumberVerified: user.phoneNumberVerified,
    emailVerified: user.emailVerified ?? false,
    banned: user.banned ?? false,
    accountStatus: user.accountStatus,
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(config.jwt.expiry)
    .setIssuer(config.jwt.issuer)
    .setAudience(config.jwt.audience)
    .sign(new TextEncoder().encode(config.jwt.secret))

  return token
}

/**
 * Generate a refresh token (7 days expiry)
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  const payload: JWTPayload = {
    userId,
    email: '',
    name: '',
    role: '',
    phoneNumber: '',
    phoneNumberVerified: false,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(config.jwt.refreshExpiry)
    .setIssuer(config.jwt.issuer)
    .setAudience(config.jwt.audience)
    .sign(new TextEncoder().encode(config.jwt.secret))

  return token
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokenPair(user: {
  id: string
  email: string
  name: string
  role: string
  phoneNumber: string
  phoneNumberVerified: boolean
  banned?: boolean
  accountStatus?: string
}): Promise<TokenPair> {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(user),
    generateRefreshToken(user.id),
  ])

  return { accessToken, refreshToken }
}

/**
 * Verify and decode a JWT token
 * Returns null if invalid or expired
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(config.jwt.secret),
      {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      }
    )
    return payload as unknown as JWTPayload
  } catch (error) {
    if (error instanceof Error && error.name === 'JWTExpired') {
      console.log('[JWT] Token expired')
    } else {
      console.error('[JWT] Token verification failed:', error)
    }
    return null
  }
}

/**
 * Verify a refresh token (only checks type is 'refresh')
 */
export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  const payload = await verifyToken(token)
  if (!payload) return null
  if (payload.type !== 'refresh') return null
  return payload
}

/**
 * Extract token from Authorization header
 * Format: "Bearer <token>"
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }
  return parts[1] ?? null
}

/**
 * Check if token is expired
 */
export function isTokenExpired(payload: JWTPayload): boolean {
  const now = Math.floor(Date.now() / 1000)
  // Check 'exp' claim from JWT
  if ('exp' in payload && typeof payload.exp === 'number') {
    return payload.exp < now
  }
  return true // No exp claim means invalid/expired
}

/**
 * Check if token is about to expire (within 2 minutes)
 * Used to proactively refresh access token
 */
export function shouldRefreshToken(payload: JWTPayload): boolean {
  const now = Math.floor(Date.now() / 1000)
  if ('exp' in payload && typeof payload.exp === 'number') {
    return payload.exp - now < 120 // 2 minutes remaining
  }
  return true
}
