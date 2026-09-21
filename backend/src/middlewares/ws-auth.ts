import { os, ORPCError } from '@orpc/server'
import { userRoles, type UserRole } from '../database/schema/auth-schema.js'

// WebSocket context type
type WSContext = {
  user: {
    id: string
    name: string
    email: string | null
    role: UserRole
    phoneNumber: string
  } | null
  authenticated: boolean
}

// Base WebSocket auth procedure
export const wsAuthProcedure = os
  .$context<WSContext>()
  .use(async ({ context, next }) => {
    if (!context.user) {
      throw new ORPCError('UNAUTHORIZED')
    }
    return next({ context: { user: context.user } })
  })

// WebSocket driver procedure
export const wsDriverProcedure = wsAuthProcedure.use(async ({ context, next }) => {
  if (context.user.role !== userRoles.DRIVER) {
    throw new ORPCError('FORBIDDEN', { message: 'Driver access required' })
  }
  return next({})
})

// WebSocket owner procedure
export const wsOwnerProcedure = wsAuthProcedure.use(async ({ context, next }) => {
  if (context.user.role !== userRoles.OWNER_SHOP) {
    throw new ORPCError('FORBIDDEN', { message: 'Owner access required' })
  }
  return next({})
})
