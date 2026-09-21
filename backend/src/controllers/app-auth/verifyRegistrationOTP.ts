import { os } from '@orpc/server'
import { z } from 'zod'
import { db } from '../../database/db.js'
import { user, account, verification } from '../../database/schema/auth-schema.js'
import { eq, and, gt } from 'drizzle-orm'
import { generateTokenPair } from '../../utils/jwt.js'
import { ORPCError } from '@orpc/server'

export const verifyRegistrationOTP = os
  .input(z.object({
    phoneNumber: z.string(),
    code: z.string(),
  }))
  .handler(async ({ input }) => {
    try {
      const { phoneNumber, code } = input

      const userRecord = await db.query.user.findFirst({
        where: eq(user.phoneNumber, phoneNumber),
      })

      if (!userRecord) {
        throw new ORPCError('NOT_FOUND', {
          message: 'User not found. Please register first.',
        })
      }

      const verificationRecord = await db.query.verification.findFirst({
        where: and(
          eq(verification.identifier, phoneNumber),
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

      // Mark phone as verified
      await db.update(user)
        .set({ phoneNumberVerified: true })
        .where(eq(user.id, userRecord.id))

      // Generate tokens for the newly verified user
      const { accessToken, refreshToken } = await generateTokenPair({
        id: userRecord.id,
        email: userRecord.email || '',
        name: userRecord.name,
        role: userRecord.role,
        phoneNumber: userRecord.phoneNumber,
        phoneNumberVerified: true,
        banned: userRecord.banned ?? false,
        accountStatus: userRecord.accountStatus,
      })

      const now = new Date()
      const accessTokenExpiresAt = new Date(now.getTime() + 15 * 60 * 1000)
      const refreshTokenExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      // Create or update account record with tokens
      const existingAccount = await db.query.account.findFirst({
        where: eq(account.userId, userRecord.id),
      })

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
        message: 'Phone number verified successfully',
        accessToken,
        refreshToken,
        user: {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email || '',
          image: userRecord.image || null,
          phoneNumber: userRecord.phoneNumber,
          phoneNumberVerified: true,
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
