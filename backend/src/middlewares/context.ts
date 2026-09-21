// @ts-nocheck
import { db } from '../database/db.js'
import { user as userTable, account as accountTable } from '../database/schema/auth-schema.js'
import { eq, and, gt } from 'drizzle-orm'
import type { LoggerContext } from '@orpc/experimental-pino'
import { verifyToken } from '../utils/jwt.js'

export interface CreateContextOptions {
  req: Request;
  res?: Response;
}

export interface Context extends LoggerContext {
  req: Request;
  res?: Response;
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    phoneNumber?: string;
    phoneNumberVerified?: boolean;
    emailVerified?: boolean;
  };
  session?: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
  };
  expired?: boolean;
}

export const createContext = async ({ req, res }: CreateContextOptions): Promise<Context> => {
  const context: Context = { req, res };

  try {
    // First, try Better Auth session (cookies)
    const { auth } = await import('../utils/auth.js');
    
    console.log('[createContext] Checking Better Auth session...');
    console.log('[createContext] Request headers:', Object.fromEntries(req.headers.entries()));
    
    const sessionData = await auth.api.getSession({
      headers: req.headers,
    });

    console.log('[createContext] Better Auth session data:', sessionData ? 'Found' : 'Not found');

    if (sessionData?.user && sessionData?.session) {
      console.log('[createContext] User authenticated via Better Auth:', sessionData.user.id);
      
      context.user = {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name,
        role: sessionData.user.role,
        phoneNumber: sessionData.user.phoneNumber,
        phoneNumberVerified: sessionData.user.phoneNumberVerified || false,
        emailVerified: sessionData.user.emailVerified || false,
      };

      context.session = {
        id: sessionData.session.id,
        userId: sessionData.session.userId,
        token: sessionData.session.token || '',
        expiresAt: new Date(sessionData.session.expiresAt),
      };

      return context;
    }

    // Fallback to Bearer token (for mobile app)
    const authHeader = req.headers.get('authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');

      // First, verify the JWT token
      const payload = await verifyToken(token);

      if (payload && payload.type === 'access') {
        // If JWT is valid, we can trust the basic user info from the payload
        // This avoids race conditions during token refresh where the DB might be updated
        context.user = {
          id: payload.userId,
          email: payload.email,
          name: payload.name as string,
          role: payload.role as string,
          phoneNumber: payload.phoneNumber as string,
          phoneNumberVerified: payload.phoneNumberVerified as boolean,
          emailVerified: payload.emailVerified as boolean || false,
        };

        // We still provide session info if possible, but we don't block if not in DB
        // (Stateless JWT approach)
        context.session = {
          id: 'jwt-session', // Placeholder or from payload if added
          userId: payload.userId,
          token: token,
          expiresAt: new Date((payload.exp as number) * 1000),
        };

        console.log('[createContext] User authenticated from JWT:', payload.userId);
        return context;
      }

      // Check if token was actually present but verification returned null (likely expired)
      if (token) {
        context.expired = true;
      }

      // Fallback: Look up account directly in the database (for legacy or non-JWT tokens if any)
      const accountResult = await db.query.account.findFirst({
        where: and(
          eq(accountTable.accessToken, token),
          gt(accountTable.accessTokenExpiresAt, new Date())
        ),
      });

      if (accountResult) {
        console.log('[createContext] Account found in DB, userId:', accountResult.userId);

        const userResult = await db.query.user.findFirst({
          where: eq(userTable.id, accountResult.userId),
        });

        if (userResult) {
          context.user = {
            id: userResult.id,
            email: userResult.email || '',
            name: userResult.name,
            role: userResult.role,
            phoneNumber: userResult.phoneNumber,
            phoneNumberVerified: userResult.phoneNumberVerified || false,
            emailVerified: userResult.emailVerified,
          };

          context.session = {
            id: accountResult.id,
            userId: accountResult.userId,
            token: accountResult.accessToken || '',
            expiresAt: accountResult.accessTokenExpiresAt || new Date(),
          };
        }
      } else {
        console.log('[createContext] No valid session found for token');
      }
    } else {
      console.log('[createContext] No Bearer token in request');
    }
  } catch (error) {
    console.error("[createContext] Error:", error);
  }

  return context;
};
