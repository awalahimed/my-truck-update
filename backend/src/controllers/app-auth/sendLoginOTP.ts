import { os } from '@orpc/server'
import { z } from 'zod'
import { db } from '../../database/db.js'
import { user, account, verification, accountStatus } from '../../database/schema/auth-schema.js'
import { eq, or } from 'drizzle-orm'
import { verifyPassword } from '../../utils/password.js'
import { sendOTPSMS } from '../../utils/sms.js'
import { ORPCError } from '@orpc/server'

const OTP_EXPIRY_MINUTES = 15

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const sendLoginOTP = os
  .input(z.object({
    phoneNumber: z.string(),
    password: z.string().optional(),
  }))
  .handler(async ({ input }) => {
    try {
      const { phoneNumber, password } = input

      // Simple normalization: ensure we have a common format for lookup
      let userRecord = await db.query.user.findFirst({
        where: (users, { eq, or }) => or(
          eq(users.phoneNumber, phoneNumber),
          phoneNumber.startsWith('+') ? undefined : eq(users.phoneNumber, `+${phoneNumber}`),
          phoneNumber.startsWith('+') ? eq(users.phoneNumber, phoneNumber.substring(1)) : undefined,
          phoneNumber.startsWith('0') ? eq(users.phoneNumber, `+251${phoneNumber.substring(1)}`) : undefined,
          phoneNumber.length === 9 ? eq(users.phoneNumber, `+251${phoneNumber}`) : undefined,
        ),
      })

      if (!userRecord) {
        // If password is provided but user doesn't exist, they definitely need to register first
        // to set a password. We'll throw NOT_FOUND here to guide them.
        if (password) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Account not found. Please register to create your account.',
          })
        }

        // For OTP-only or initial step, we can create the user record
        const userId = crypto.randomUUID()
        const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber :
                               (phoneNumber.startsWith('0') ? `+251${phoneNumber.substring(1)}` :
                               (phoneNumber.length === 9 ? `+251${phoneNumber}` : phoneNumber))

        await db.insert(user).values({
          id: userId,
          phoneNumber: normalizedPhone,
          phoneNumberVerified: false,
          role: 'unknown',
          name: normalizedPhone,
        })

        userRecord = await db.query.user.findFirst({
          where: eq(user.id, userId),
        })
      }

      if (!userRecord) {
         throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to create user record' })
      }

      // Check if account is deleted
      if (userRecord.accountStatus === accountStatus.DELETED) {
        throw new ORPCError('FORBIDDEN', {
          message: 'This account has been deleted and cannot be used.',
        })
      }

      const existingUser = userRecord;

      if (password) {
        const credentialAccount = await db.query.account.findFirst({
          where: (accounts, { eq, and }) => and(
            eq(accounts.userId, existingUser.id),
            eq(accounts.providerId, 'credential')
          ),
        })

        if (!credentialAccount?.password) {
          throw new ORPCError('BAD_REQUEST', {
            message: 'No password set for this account. Please use OTP or reset password.',
          })
        }

        const isValid = await verifyPassword(password, credentialAccount.password)
        if (!isValid) {
          throw new ORPCError('UNAUTHORIZED', {
            message: 'Invalid phone number or password',
          })
        }
      }

      const code = generateOTP()
      console.log("resend otp code:", code);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

      // Use the normalized phone number for the verification record
      const verificationIdentifier = existingUser.phoneNumber

      await db.insert(verification).values({
        id: crypto.randomUUID(),
        identifier: verificationIdentifier,
        value: code,
        expiresAt,
      })

      // Send SMS with OTP
      const smsResult = await sendOTPSMS(existingUser.phoneNumber, code)
      if (!smsResult.success) {
        console.error('Failed to send SMS:', smsResult.message)
        // Don't throw error here - OTP is still valid even if SMS fails
      }

      return {
        success: true,
        message: 'OTP sent successfully',
        expiresIn: OTP_EXPIRY_MINUTES,
      }
    } catch (error) {
      if (error instanceof ORPCError) throw error
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'An unexpected error occurred',
      })
    }
  })
