import 'dotenv/config'

function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false
  return fallback
}

function toNumber(value: string | undefined, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export type OtpConfig = {
  enabled: boolean
}

export const otpConfig: OtpConfig = {
  enabled: toBoolean(process.env.PHONE_OTP_REQUIRED, true),
}

export const betterauthConfig = {
  otp: otpConfig,
  baseURL: process.env.BETTERAUTH_BASE_URL,
  rateLimit: {
    window: toNumber(process.env.RATE_LIMIT_WINDOW_SECONDS, 60),
    max: toNumber(process.env.RATE_LIMIT_MAX, 100),
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  },
}
export type BetterAuthConfig = typeof betterauthConfig



