// @ts-nocheck
import { ORPCError, os } from '@orpc/server'
import { z } from 'zod'
import { db } from '../../database/db.js'
import { user, account } from '../../database/schema/auth-schema.js'
import { eq, and } from 'drizzle-orm'
import { hashPassword } from '../../utils/password.js'

export const setPassword = os
  .input(z.object({
    phoneNumber: z.string(),
    newPassword: z.string(),
  }))
  .handler(async ({ input }) => {
    try {
      const { phoneNumber, newPassword } = input

      const existingUser = await db.query.user.findFirst({
        where: eq(user.phoneNumber, phoneNumber),
      })

      if (existingUser?.phoneNumberVerified) {
        throw new ORPCError("UNAUTHORIZED", {"message": 'Phone number already registered'})
      }

      const hashedPassword = await hashPassword(newPassword)

      if (existingUser) {
        const existingAccount = await db.query.account.findFirst({
          where: and(
            eq(account.userId, existingUser.id),
            eq(account.providerId, 'credential'),
          ),
        })

        if (existingAccount) {
          await db.update(account)
            .set({ password: hashedPassword })
            .where(eq(account.id, existingAccount.id))
        } else {
          await db.insert(account).values({
            id: crypto.randomUUID(),
            userId: existingUser.id,
            providerId: 'credential',
            accountId: existingUser.id,
            password: hashedPassword,
          })
        }
      } else {
        const userId = crypto.randomUUID()
        await db.insert(user).values({
          id: userId,
          phoneNumber,
          phoneNumberVerified: false,
          role: 'unknown',
          name: phoneNumber,
        })

        await db.insert(account).values({
          id: crypto.randomUUID(),
          userId,
          providerId: 'credential',
          accountId: userId,
          password: hashedPassword,
        })
      }

      return {
        success: true,
        message: 'Password set successfully',
      }
    } catch (error) {
      console.error('[setPassword] Error:', error)
      if (error instanceof ORPCError) throw error
      throw new ORPCError('INTERNAL_SERVER_ERROR', 'An unexpected error occurred')
    }
  })
