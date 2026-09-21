import { os, ORPCError } from '@orpc/server'
import { z } from 'zod'
import { db } from '../../database/db.js'
import { user, account } from '../../database/schema/auth-schema.js'
import { order, orderStatus } from '../../database/schema/order-schema.js'
import { eq, and, or } from 'drizzle-orm'
import { verifyToken, generateAccessToken, shouldRefreshToken } from '../../utils/jwt.js'

export const getSession = os
  .input(z.object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
  }))
  .handler(async ({ input }) => {
    try {
      const { accessToken, refreshToken } = input

      let payload = await verifyToken(accessToken)

      // If access token is expired, try to use refresh token
      if (!payload && refreshToken) {
        const refreshPayload = await verifyToken(refreshToken)
        if (!refreshPayload || refreshPayload.type !== 'refresh') {
          throw new ORPCError('UNAUTHORIZED', {
            message: 'Refresh token expired',
          })
        }

        // Get user to generate new access token
        const userRecord = await db.query.user.findFirst({
          where: eq(user.id, refreshPayload.userId),
        })

        if (!userRecord) {
          throw new ORPCError('NOT_FOUND', {
            message: 'User not found',
          })
        }

        if (userRecord.banned) {
          throw new ORPCError('FORBIDDEN', {
            message: 'User is banned',
          })
        }

        // Generate new access token
        const newAccessToken = await generateAccessToken({
          id: userRecord.id,
          email: userRecord.email || '',
          name: userRecord.name,
          role: userRecord.role,
          phoneNumber: userRecord.phoneNumber,
          phoneNumberVerified: userRecord.phoneNumberVerified ?? false,
          banned: userRecord.banned ?? false,
          accountStatus: userRecord.accountStatus,
        })

        // Update account with new access token
        const existingAccount = await db.query.account.findFirst({
          where: eq(account.userId, userRecord.id),
        })

        if (existingAccount) {
          await db.update(account)
            .set({ accessToken: newAccessToken })
            .where(eq(account.id, existingAccount.id))
        }

        // Check if driver has assigned orders
        let hasAssignedOrder = false
        if (userRecord.role === 'driver') {
          const assignedOrders = await db
            .select({ id: order.id })
            .from(order)
            .where(
              and(
                eq(order.driverId, userRecord.id),
                or(
                  eq(order.status, orderStatus.ASSIGNED),
                  eq(order.status, orderStatus.ON_THE_WAY),
                  eq(order.status, orderStatus.DELIVERED)
                )
              )
            )
            .limit(1)
          
          hasAssignedOrder = assignedOrders.length > 0
        }

        return {
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
            rejectionReason: userRecord.rejectionReason,
            rejectedDocument: userRecord.rejectedDocument,
            rejectedAt: userRecord.rejectedAt,
            hasAssignedOrder,
          },
          session: {
            token: newAccessToken,
          },
        }
      }

      if (!payload) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Invalid or expired access token',
        })
      }

      const userRecord = await db.query.user.findFirst({
        where: eq(user.id, payload.userId),
      })

      if (!userRecord) {
        throw new ORPCError('NOT_FOUND', {
          message: 'User not found',
        })
      }

      if (userRecord.banned) {
        throw new ORPCError('FORBIDDEN', {
          message: 'User is banned',
        })
      }

      if (shouldRefreshToken(payload)) {
        const newAccessToken = await generateAccessToken({
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

        if (existingAccount) {
          await db.update(account)
            .set({ accessToken: newAccessToken })
            .where(eq(account.id, existingAccount.id))
        }

        // Check if driver has assigned orders
        let hasAssignedOrder = false
        if (userRecord.role === 'driver') {
          const assignedOrders = await db
            .select({ id: order.id })
            .from(order)
            .where(
              and(
                eq(order.driverId, userRecord.id),
                or(
                  eq(order.status, orderStatus.ASSIGNED),
                  eq(order.status, orderStatus.ON_THE_WAY),
                  eq(order.status, orderStatus.DELIVERED)
                )
              )
            )
            .limit(1)
          
          hasAssignedOrder = assignedOrders.length > 0
        }

        return {
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
            rejectionReason: userRecord.rejectionReason,
            rejectedDocument: userRecord.rejectedDocument,
            rejectedAt: userRecord.rejectedAt,
            hasAssignedOrder,
          },
          session: {
            token: newAccessToken,
          },
        }
      }

      // Check if driver has assigned orders
      let hasAssignedOrder = false
      if (userRecord.role === 'driver') {
        const assignedOrders = await db
          .select({ id: order.id })
          .from(order)
          .where(
            and(
              eq(order.driverId, userRecord.id),
              or(
                eq(order.status, orderStatus.ASSIGNED),
                eq(order.status, orderStatus.ON_THE_WAY),
                eq(order.status, orderStatus.DELIVERED)
              )
            )
          )
          .limit(1)
        
        hasAssignedOrder = assignedOrders.length > 0
      }

      return {
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
          rejectionReason: userRecord.rejectionReason,
          rejectedDocument: userRecord.rejectedDocument,
          rejectedAt: userRecord.rejectedAt,
          hasAssignedOrder,
        },
        session: {
          token: accessToken,
        },
      }
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error
      }
      if (error instanceof Error) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: error.message,
        })
      }
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Session validation failed',
      })
    }
  })
