import { eq } from 'drizzle-orm';
import { db } from '../../database/db.js';
import { user, session, accountStatus } from '../../database/schema/auth-schema.js';
import { logger } from '../../utils/logger.js';
import { authProcedure } from '../../middlewares/auth.js';
// Soft delete user account
export const softDeleteAccount = authProcedure.handler(async (ctx) => {
    try {
        const userId = ctx.context.user.id;
        logger.info(`[SoftDelete] ========== STARTING SOFT DELETE ==========`);
        logger.info(`[SoftDelete] User ID from context: ${userId}`);
        logger.info(`[SoftDelete] User role: ${ctx.context.user.role}`);
        // Check if user exists
        const existingUser = await db
            .select({
            id: user.id,
            name: user.name,
            deletedAt: user.deletedAt,
            accountStatus: user.accountStatus
        })
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);
        logger.info(`[SoftDelete] Query result length: ${existingUser.length}`);
        if (!existingUser.length) {
            logger.error(`[SoftDelete] User not found: ${userId}`);
            throw new Error('User not found');
        }
        const userData = existingUser[0];
        if (!userData) {
            logger.error(`[SoftDelete] User data is undefined: ${userId}`);
            throw new Error('User not found');
        }
        logger.info(`[SoftDelete] Current user data:`, {
            id: userData.id,
            name: userData.name,
            status: userData.accountStatus,
            deletedAt: userData.deletedAt
        });
        // If already deleted (check status, not just deletedAt since restore only changes status)
        if (userData.accountStatus === accountStatus.DELETED) {
            logger.info(`[SoftDelete] Account already deleted: ${userId}`);
            return {
                success: true,
                message: 'Account already deleted',
            };
        }
        // Soft delete the user - set both deletedAt and accountStatus
        logger.info(`[SoftDelete] Executing UPDATE query...`);
        logger.info(`[SoftDelete] Setting accountStatus to: "${accountStatus.DELETED}"`);
        const updateResult = await db
            .update(user)
            .set({
            accountStatus: accountStatus.DELETED,
            deletedAt: new Date(),
            updatedAt: new Date(),
        })
            .where(eq(user.id, userId));
        logger.info(`[SoftDelete] Update result:`, updateResult);
        // Verify the update
        const updatedUser = await db
            .select({
            id: user.id,
            accountStatus: user.accountStatus,
            deletedAt: user.deletedAt
        })
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);
        logger.info(`[SoftDelete] Verified updated status:`, {
            id: updatedUser[0]?.id,
            accountStatus: updatedUser[0]?.accountStatus,
            deletedAt: updatedUser[0]?.deletedAt
        });
        // Delete all user sessions to log them out
        logger.info(`[SoftDelete] Deleting all sessions for user: ${userId}`);
        const sessionDeleteResult = await db
            .delete(session)
            .where(eq(session.userId, userId));
        logger.info(`[SoftDelete] Session delete result:`, sessionDeleteResult);
        logger.info(`[SoftDelete] ========== SOFT DELETE COMPLETED ==========`);
        return {
            success: true,
            message: 'Account deleted successfully',
        };
    }
    catch (error) {
        logger.error('[SoftDelete] ========== ERROR IN SOFT DELETE ==========');
        logger.error('[SoftDelete] Error details:', error);
        throw new Error('Failed to delete account');
    }
});
//# sourceMappingURL=softdelete.js.map