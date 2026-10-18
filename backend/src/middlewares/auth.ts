// @ts-nocheck
import { os, ORPCError } from '@orpc/server'
import { createContext } from './context.js'
import { userRoles } from '../database/schema/auth-schema.js'

// Auth middleware that creates context from request
export const authProcedure = os
  .$context<{ req?: Request }>()
  .use(async ({ context, next, path }) => {
    console.log('[authProcedure] Path:', path)

    if (context.user) {
      return next({
        context: {
          user: context.user,
          session: context.session,
          role: context.user.role,
        },
      });
    }

    if (!context.req) {
      console.log('[authProcedure] No request in context')
      throw new ORPCError('UNAUTHORIZED')
    }

    const authContext = await createContext({
      req: context.req,
      res: new Response()
    })

    if (!authContext.user) {
      console.log('[authProcedure] No user found');
      if (authContext.expired) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Session expired',
          code: 'SESSION_EXPIRED' as any,
        });
      }
      throw new ORPCError('UNAUTHORIZED');
    }

    console.log('[authProcedure] User authenticated:', authContext.user.id)

    return next({
      context: {
        user: authContext.user,
        session: authContext.session,
        role: authContext.user.role
      }
    })
  })

// Admin only procedure
export const adminProcedure = authProcedure.use(async ({ context, next }) => {
  if (context.role !== userRoles.ADMIN) {
    throw new ORPCError('FORBIDDEN', {
      message: 'Admin access required'
    })
  }
  return next({})
})

// Driver only procedure
export const driverProcedure = authProcedure.use(async ({ context, next }) => {
  if (context.role !== userRoles.DRIVER) {
    throw new ORPCError('FORBIDDEN', {
      message: 'Driver access required'
    })
  }
  return next({})
})

// Shop owner only procedure
export const ownerProcedure = authProcedure.use(async ({ context, next }) => {
  if (context.role !== userRoles.OWNER_SHOP) {
    throw new ORPCError('FORBIDDEN', {
      message: 'Owner access required'
    })
  }
  return next({})
})
