import { z } from 'zod';
import { os, ORPCError } from '@orpc/server';
import { adminProcedure } from '../../middlewares/auth-admin.js';
import { db } from '../../database/db.js';
import { user, accountStatus } from '../../database/schema/auth-schema.js';
import { townManager } from '../../database/schema/manager-schema.js';
import { eq } from 'drizzle-orm';
console.log('[Admin User Controller] Loading user controller...');
export const adminUserController = os.router({
    // Create a town manager user via BetterAuth + Drizzle
    createManager: adminProcedure
        .input(z.object({
        name: z.string().min(1),
        phoneNumber: z.string().min(1),
        password: z.string().min(8),
        townName: z.string().min(1),
        cityName: z.string().min(1),
        region: z.string().min(1),
    }))
        .handler(async ({ input }) => {
        try {
            const { auth } = await import('../../utils/auth.js');
            // Check for duplicate phone number in user metadata
            const existingUser = await db.select({ id: user.id })
                .from(user)
                .where(eq(user.phoneNumber, input.phoneNumber))
                .limit(1);
            if (existingUser.length > 0) {
                throw new ORPCError('BAD_REQUEST', { message: 'Phone number already exists' });
            }
            // Create user via BetterAuth admin API
            const createdUser = await auth.api.createUser({
                body: {
                    email: `${input.name.toLowerCase().replace(/\s+/g, '.')}@temp.com`,
                    password: input.password,
                    name: input.name,
                    role: 'town_manager',
                    data: {
                        phoneNumber: input.phoneNumber,
                        phoneNumberVerified: true,
                        emailVerified: true,
                        accountStatus: 'approved',
                    },
                },
            });
            if (!createdUser?.user?.id) {
                throw new Error('Failed to create user via BetterAuth');
            }
            const userId = createdUser.user.id;
            const managerId = crypto.randomUUID();
            // Create town_manager profile record
            await db.insert(townManager).values({
                id: managerId,
                userId,
                townName: input.townName,
                cityName: input.cityName,
                region: input.region,
                status: 'active',
                approvalStatus: 'approved',
                contactPhone: input.phoneNumber,
            });
            return {
                success: true,
                message: 'Manager created successfully',
                userId,
                managerId,
            };
        }
        catch (error) {
            console.error('[Admin] Failed to create manager:', error);
            if (error.constructor?.name === 'InternalAPIError' || error.status === 500) {
                const message = error.message || error.body?.message || 'User creation failed';
                if (message.toLowerCase().includes('phone') || message.toLowerCase().includes('phone_number')) {
                    throw new ORPCError('BAD_REQUEST', { message: 'Phone number already exists' });
                }
                if (message.toLowerCase().includes('email')) {
                    throw new ORPCError('BAD_REQUEST', { message: 'Email already exists' });
                }
                throw new ORPCError('BAD_REQUEST', { message });
            }
            if (error instanceof ORPCError)
                throw error;
            throw new ORPCError('BAD_REQUEST', { message: error?.message || 'Failed to create manager' });
        }
    }),
    // Soft delete user (mark as deleted instead of removing)
    softDeleteUser: adminProcedure
        .input(z.object({ userId: z.string() }))
        .handler(async ({ input }) => {
        const { userId } = input;
        // Update user status to deleted
        await db.update(user)
            .set({
            accountStatus: accountStatus.DELETED,
            deletedAt: new Date(),
        })
            .where(eq(user.id, userId));
        return { success: true, message: 'User marked as deleted' };
    }),
    // Restore deleted user (undelete)
    restoreUser: adminProcedure
        .input(z.object({ userId: z.string() }))
        .handler(async ({ input }) => {
        try {
            console.log('[Admin] restoreUser called for:', input.userId);
            const { userId } = input;
            // Get user to check current status
            const userData = await db.select()
                .from(user)
                .where(eq(user.id, userId))
                .limit(1);
            if (!userData.length) {
                console.log('[Admin] User not found:', userId);
                throw new Error('User not found');
            }
            console.log('[Admin] Current user status:', userData[0].accountStatus);
            // Restore user - change accountStatus and clear deletedAt
            await db.update(user)
                .set({
                accountStatus: accountStatus.ACTIVE,
                deletedAt: null,
            })
                .where(eq(user.id, userId));
            console.log('[Admin] User restored successfully:', userId);
            return { success: true, message: 'User restored successfully' };
        }
        catch (error) {
            console.error('[Admin] Error restoring user:', error);
            throw error;
        }
    }),
});
console.log('[Admin User Controller] User controller created successfully');
//# sourceMappingURL=user.js.map