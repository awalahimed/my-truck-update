import { db } from '../database/db.js';
import { user as userTable } from '../database/schema/auth-schema.js';
import { eq } from 'drizzle-orm';
export const createAdminContext = async ({ req, res }) => {
    const context = { req };
    if (res)
        context.res = res;
    try {
        // Import auth dynamically to avoid circular dependencies
        const { auth } = await import('../utils/auth.js');
        console.log('[createAdminContext] Using better-auth to get session...');
        // Use better-auth's getSession to validate the session
        const sessionData = await auth.api.getSession({
            headers: req.headers,
        });
        if (!sessionData || !sessionData.user || !sessionData.session) {
            console.log('[createAdminContext] No valid session from better-auth');
            return context;
        }
        console.log('[createAdminContext] Session found, userId:', sessionData.user.id);
        // Get full user details from database to check role
        const userResult = await db.query.user.findFirst({
            where: eq(userTable.id, sessionData.user.id),
        });
        if (!userResult) {
            console.log('[createAdminContext] User not found in database');
            return context;
        }
        // Check if user is admin or call_center
        if (userResult.role !== 'admin' && userResult.role !== 'call_center') {
            console.log('[createAdminContext] User is not admin or call_center:', userResult.role);
            return context;
        }
        if (context.user) {
            context.user = {
                id: userResult.id,
                email: userResult.email || '',
                name: userResult.name,
                role: userResult.role,
                ...(userResult.phoneNumber && { phoneNumber: userResult.phoneNumber }),
                phoneNumberVerified: userResult.phoneNumberVerified || false,
                emailVerified: userResult.emailVerified,
            };
        }
        else {
            context.user = {
                id: userResult.id,
                email: userResult.email || '',
                name: userResult.name,
                role: userResult.role,
                ...(userResult.phoneNumber && { phoneNumber: userResult.phoneNumber }),
                phoneNumberVerified: userResult.phoneNumberVerified || false,
                emailVerified: userResult.emailVerified,
            };
        }
        context.session = {
            id: sessionData.session.id,
            userId: sessionData.session.userId,
            token: sessionData.session.token,
            expiresAt: new Date(sessionData.session.expiresAt),
        };
        console.log('[createAdminContext] Admin/CallCenter authenticated:', userResult.id, userResult.role);
    }
    catch (error) {
        console.error("[createAdminContext] Error:", error);
    }
    return context;
};
//# sourceMappingURL=context-admin.js.map