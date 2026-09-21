import { os, ORPCError } from '@orpc/server'
import { createAdminContext } from './context-admin.js'

// Admin auth middleware that creates context from cookies
export const adminProcedure = os
  .$context<{ req?: Request }>()
  .use(async ({ context, next, path }) => {
    console.log('[adminProcedure] Path:', path)

    if (!context.req) {
      console.log('[adminProcedure] No request in context')
      throw new ORPCError('UNAUTHORIZED')
    }

    const adminContext = await createAdminContext({
      req: context.req,
      res: new Response()
    })

    if (!adminContext.user) {
      console.log('[adminProcedure] No user found');
      throw new ORPCError('UNAUTHORIZED', {
        message: 'Not authenticated'
      });
    }

    if (adminContext.user.role !== 'admin' && adminContext.user.role !== 'call_center') {
      console.log('[adminProcedure] User is not admin or call_center:', adminContext.user.role);
      throw new ORPCError('FORBIDDEN', {
        message: 'Admin or Call Center access required'
      });
    }

    console.log('[adminProcedure] Admin/CallCenter authenticated:', adminContext.user.id, adminContext.user.role)

    return next({
      context: {
        user: adminContext.user,
        session: adminContext.session,
        role: adminContext.user.role
      }
    })
  })
