import { os } from '@orpc/server';
import { z } from 'zod';
import { db } from '../../database/db.js';
import { user, account, verification } from '../../database/schema/auth-schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { hashPassword } from '../../utils/password.js';
import { ORPCError } from '@orpc/server';
// Generate 8-digit random password
function generatePassword() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}
export const resetPassword = os
    .input(z.object({
    phoneNumber: z.string(),
    code: z.string(),
    newPassword: z.string().optional(), // Make optional
}))
    .handler(async ({ input }) => {
    try {
        const { phoneNumber, code } = input;
        let { newPassword } = input;
        // Generate password if not provided
        if (!newPassword || newPassword.trim() === '') {
            newPassword = generatePassword();
        }
        const userRecord = await db.query.user.findFirst({
            where: eq(user.phoneNumber, phoneNumber),
        });
        if (!userRecord) {
            throw new ORPCError('NOT_FOUND', {
                message: 'User not found',
            });
        }
        const verificationRecord = await db.query.verification.findFirst({
            where: and(eq(verification.identifier, phoneNumber), eq(verification.value, code), gt(verification.expiresAt, new Date())),
        });
        if (!verificationRecord) {
            throw new ORPCError('BAD_REQUEST', {
                message: 'Invalid or expired OTP code',
            });
        }
        await db.delete(verification).where(eq(verification.id, verificationRecord.id));
        const hashedPassword = await hashPassword(newPassword);
        // Log new password in development mode (simulating SMS)
        if (process.env.NODE_ENV === 'development') {
            console.log(`[RESET PASSWORD] New password for ${phoneNumber}: ${newPassword}`);
            console.log('[RESET PASSWORD] Password would be sent via SMS in production');
        }
        const existingAccount = await db.query.account.findFirst({
            where: and(eq(account.userId, userRecord.id), eq(account.providerId, 'credential')),
        });
        if (existingAccount) {
            await db.update(account)
                .set({ password: hashedPassword })
                .where(eq(account.id, existingAccount.id));
        }
        else {
            await db.insert(account).values({
                id: crypto.randomUUID(),
                userId: userRecord.id,
                providerId: 'credential',
                accountId: userRecord.id,
                password: hashedPassword,
            });
        }
        return {
            success: true,
            message: 'Password reset successfully',
            newPassword: process.env.NODE_ENV === 'development' ? newPassword : undefined,
        };
    }
    catch (error) {
        if (error instanceof ORPCError)
            throw error;
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: 'An unexpected error occurred',
        });
    }
});
//# sourceMappingURL=resetPassword.js.map