import { os, ORPCError } from '@orpc/server';
import { z } from 'zod';
import { db } from '../../database/db.js';
import { user, account } from '../../database/schema/auth-schema.js';
import { eq } from 'drizzle-orm';
import { verifyRefreshToken, generateTokenPair } from '../../utils/jwt.js';
export const refreshTokens = os
    .input(z.object({
    refreshToken: z.string(),
}))
    .handler(async ({ input }) => {
    try {
        const { refreshToken } = input;
        const payload = await verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new ORPCError('UNAUTHORIZED', {
                message: 'Refresh token expired',
            });
        }
        const userRecord = await db.query.user.findFirst({
            where: eq(user.id, payload.userId),
        });
        if (!userRecord) {
            throw new ORPCError('NOT_FOUND', {
                message: 'User not found',
            });
        }
        if (userRecord.banned) {
            throw new ORPCError('FORBIDDEN', {
                message: 'User is banned',
            });
        }
        const { accessToken, refreshToken: newRefreshToken } = await generateTokenPair({
            id: userRecord.id,
            email: userRecord.email || '',
            name: userRecord.name,
            role: userRecord.role,
            phoneNumber: userRecord.phoneNumber,
            phoneNumberVerified: userRecord.phoneNumberVerified ?? false,
            banned: userRecord.banned ?? false,
            accountStatus: userRecord.accountStatus,
        });
        const existingAccount = await db.query.account.findFirst({
            where: eq(account.userId, userRecord.id),
        });
        if (existingAccount) {
            await db.update(account)
                .set({
                accessToken,
                refreshToken: newRefreshToken,
                idToken: accessToken,
            })
                .where(eq(account.id, existingAccount.id));
        }
        return {
            accessToken,
            refreshToken: newRefreshToken,
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
        };
    }
    catch (error) {
        if (error instanceof ORPCError) {
            throw error;
        }
        if (error instanceof Error) {
            throw new ORPCError('INTERNAL_SERVER_ERROR', {
                message: error.message,
            });
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: 'Token refresh failed',
        });
    }
});
//# sourceMappingURL=refreshTokens.js.map