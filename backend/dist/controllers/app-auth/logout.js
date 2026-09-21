import { os } from '@orpc/server';
import { z } from 'zod';
import { db } from '../../database/db.js';
import { account } from '../../database/schema/auth-schema.js';
import { eq } from 'drizzle-orm';
export const logout = os
    .input(z.object({
    userId: z.string(),
}))
    .handler(async ({ input }) => {
    try {
        const { userId } = input;
        await db.update(account)
            .set({
            refreshToken: null,
        })
            .where(eq(account.userId, userId));
        return {
            success: true,
            message: 'Logged out successfully',
        };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Logout failed');
    }
});
//# sourceMappingURL=logout.js.map