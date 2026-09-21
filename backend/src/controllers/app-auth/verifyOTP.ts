import { os } from '@orpc/server'
import { z } from 'zod'
import { db } from '../../database/db.js'
import { user, account, verification, accountStatus } from '../../database/schema/auth-schema.js'
import { eq, and, gt } from 'drizzle-orm'
import { generateTokenPair } from '../../utils/jwt.js'
import { ORPCError } from '@orpc/server'

export const verifyOTP = os
  .input(z.object({
    phoneNumber: z.string(),
    code: z.string(),
  }))
  .handler(async ({ input }) => {
    try {
      const { phoneNumber, code } = input

      // Use same flexible lookup as sendLoginOTP to find user
      const userRecord = await db.query.user.findFirst({
        where: (users, { eq, or }) => or(
          eq(users.phoneNumber, phoneNumber),
          phoneNumber.startsWith('+') ? undefined : eq(users.phoneNumber, `+${phoneNumber}`),
          phoneNumber.startsWith('+') ? eq(users.phoneNumber, phoneNumber.substring(1)) : undefined,
          phoneNumber.startsWith('0') ? eq(users.phoneNumber, `+251${phoneNumber.substring(1)}`) : undefined,
          phoneNumber.length === 9 ? eq(users.phoneNumber, `+251${phoneNumber}`) : undefined,
        ),
      })

      if (!userRecord) {
        throw new ORPCError('NOT_FOUND', {
          message: 'User not found with this phone number',
        })
      }

      // Check if account is deleted
      if (userRecord.accountStatus === accountStatus.DELETED) {
        throw new ORPCError('FORBIDDEN', {
          message: 'This account has been deleted and cannot be used.',
        })
      }

      // OTP verification itself serves as phone verification
      // Mark phone as verified if not already
      if (!userRecord.phoneNumberVerified) {
        await db.update(user)
          .set({ phoneNumberVerified: true })
          .where(eq(user.id, userRecord.id))
      }

      // Use normalized phone number from user record to lookup OTP
      // (since OTP was stored with the normalized phone as identifier)
      const verificationRecord = await db.query.verification.findFirst({
        where: and(
          eq(verification.identifier, userRecord.phoneNumber),
          eq(verification.value, code),
          gt(verification.expiresAt, new Date()),
        ),
      })

      if (!verificationRecord) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Invalid or expired OTP code',
        })
      }

      await db.delete(verification).where(eq(verification.id, verificationRecord.id))

      const { accessToken, refreshToken } = await generateTokenPair({
        id: userRecord.id,
        email: userRecord.email || '',
        name: userRecord.name,
        role: userRecord.role,
        phoneNumber: userRecord.phoneNumber,
        phoneNumberVerified: userRecord.phoneNumberVerified ?? false,
        banned: userRecord.banned ?? false,
        accountStatus: userRecord.accountStatus,
      })

      const existingAccount = await db.query.account.findFirst({
        where: eq(account.userId, userRecord.id),
      })

      const now = new Date()
      const accessTokenExpiresAt = new Date(now.getTime() + 15 * 60 * 1000)
      const refreshTokenExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      if (existingAccount) {
        await db.update(account)
          .set({
            accessToken,
            refreshToken,
            idToken: accessToken,
            accessTokenExpiresAt,
            refreshTokenExpiresAt,
          })
          .where(eq(account.id, existingAccount.id))
      } else {
        await db.insert(account).values({
          id: crypto.randomUUID(),
          userId: userRecord.id,
          providerId: 'credential',
          accountId: userRecord.id,
          accessToken,
          refreshToken,
          idToken: accessToken,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
        })
      }

      return {
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email || '',
          image: userRecord.image || null,
          phoneNumber: userRecord.phoneNumber,
          phoneNumberVerified: userRecord.phoneNumberVerified,
          role: userRecord.role,
          accountStatus: userRecord.accountStatus,
          banned: userRecord.banned,
        },
      }
    } catch (error) {
      if (error instanceof ORPCError) throw error
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'An unexpected error occurred',
      })
    }
  })
