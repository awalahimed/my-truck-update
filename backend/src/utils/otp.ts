// @ts-nocheck
import { db } from '../database/db.js'
import { user, account, verification } from '../database/schema/auth-schema.js'
import { eq, and, gt, or, like, ne } from 'drizzle-orm'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { config } from '../config/env_config.js'
import { sendOTPSMS, sendPasswordResetOTPSMS } from '../utils/sms.js'
import { logger } from '../utils/logger.js'
import * as crypto from 'crypto'

const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 10

interface OTPResult {
  otp: string
  expiresAt: Date
}

/**
 * Create OTP for phone verification
 */
export async function createOTP(params: {
  phoneNumber: string
  type: string
}): Promise<OTPResult> {
  const { phoneNumber, type } = params

  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  // Delete any existing OTPs for this phone and type
  await db
    .delete(verification)
    .where(
      and(
        eq(verification.identifier, `${type}:${phoneNumber}`),
        gt(verification.expiresAt, new Date())
      )
    )

  // Store new OTP
  await db.insert(verification).values({
    id: crypto.randomUUID(),
    identifier: `${type}:${phoneNumber}`,
    value: otp,
    expiresAt,
  })

  // In development, log the OTP
  if (config.env === 'development') {
    logger.info(`[OTP] ${type} OTP for ${phoneNumber}: ${otp}`)
  }

  // Send OTP via SMS
  try {
    if (type === 'reset-password') {
      await sendPasswordResetOTPSMS(phoneNumber, otp)
    } else {
      await sendOTPSMS(phoneNumber, otp)
    }
    logger.info(`[OTP] SMS sent successfully to ${phoneNumber}`)
  } catch (error) {
    logger.error('[OTP] Failed to send SMS:', error)
    // Don't throw error - OTP is still valid even if SMS fails
  }

  return { otp, expiresAt }
}

/**
 * Verify OTP
 */
export async function verifyOTP(params: {
  phoneNumber: string
  otp: string
  type: string
}): Promise<boolean> {
  const { phoneNumber, otp, type } = params

  const identifier = `${type}:${phoneNumber}`
  logger.info('[verifyOTP] Looking for:', { identifier, otp })

  // Find the OTP
  const [record] = await db
    .select()
    .from(verification)
    .where(
      and(
        eq(verification.identifier, identifier),
        eq(verification.value, otp),
        gt(verification.expiresAt, new Date())
      )
    )
    .limit(1)

  logger.info('[verifyOTP] Found record:', record ? 'Yes' : 'No')

  if (!record) {
    // Check if there's any record with this identifier
    const [anyRecord] = await db
      .select()
      .from(verification)
      .where(eq(verification.identifier, identifier))
      .limit(1)
    
    logger.info('[verifyOTP] Any record with identifier:', anyRecord ? 'Yes' : 'No')
    return false
  }

  return true
}

/**
 * Delete OTP after successful verification
 */
export async function deleteOTP(params: {
  phoneNumber: string
  type: string
}): Promise<void> {
  const { phoneNumber, type } = params
  const identifier = `${type}:${phoneNumber}`

  await db
    .delete(verification)
    .where(eq(verification.identifier, identifier))
}

/**
 * Check if phone number already exists
 */
export async function phoneNumberExists(phoneNumber: string, excludeUserId?: string): Promise<boolean> {
  const query = eq(user.phoneNumber, phoneNumber)

  if (excludeUserId) {
    const [existingUser] = await db
      .select()
      .from(user)
      .where(and(query, ne(user.id, excludeUserId)))
      .limit(1)
    return !!existingUser
  }

  const [existingUser] = await db
    .select()
    .from(user)
    .where(query)
    .limit(1)

  return !!existingUser
}
