import { db } from '../db.js';
import { user } from '../schema/auth-schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '../../utils/logger.js';
import { auth } from '../../utils/auth.js';
const defaultUsers = [
    {
        email: 'admin@example.com',
        password: 'Admin@123',
        name: 'Admin User',
        role: 'admin',
        phoneNumber: '+251912345679',
    },
    {
        email: 'admin@call.com',
        password: 'Admin@123',
        name: 'Admin User',
        role: 'call_center',
        phoneNumber: '+251912345677',
    },
];
export async function seedAdmin() {
    try {
        for (const userData of defaultUsers) {
            const existingUser = await db
                .select()
                .from(user)
                .where(eq(user.email, userData.email))
                .limit(1);
            if (existingUser.length > 0) {
                logger.info(`${userData.role} user already exists, skipping`);
                continue;
            }
            // Create user through better-auth
            const result = await auth.api.createUser({
                body: {
                    email: userData.email,
                    password: userData.password,
                    name: userData.name,
                    role: userData.role,
                    emailVerified: true,
                }
            });
            // Update user with phone number and set active status
            if (result?.user?.id) {
                await db.update(user)
                    .set({
                    phoneNumber: userData.phoneNumber,
                    phoneNumberVerified: true,
                    accountStatus: 'active',
                })
                    .where(eq(user.id, result.user.id));
                logger.info(`${userData.role} user created and phone number set successfully`);
            }
            else {
                logger.info(`${userData.role} user created successfully`);
            }
        }
    }
    catch (error) {
        logger.error('Failed to seed users:', error);
    }
}
//# sourceMappingURL=admin-seed.js.map