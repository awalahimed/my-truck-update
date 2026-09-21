import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import { db } from '../../database/db.js';
import { wallet } from '../../database/schema/wallet-schema.js';
import { transaction } from '../../database/schema/payment-schema.js';
import { user } from '../../database/schema/auth-schema.js';
import { authProcedure } from '../../middlewares/auth.js';
import { eq, desc } from 'drizzle-orm';
import crypto from 'node:crypto';
import { aliasedTable } from 'drizzle-orm';
export const walletController = {
    create: authProcedure.handler(async ({ context }) => {
        const userId = context.user.id;
        const existingWallet = await db.query.wallet.findFirst({
            where: eq(wallet.userId, userId),
        });
        if (existingWallet) {
            throw new ORPCError('BAD_REQUEST', { message: 'Wallet already exists' });
        }
        const newWallet = await db.insert(wallet).values({
            id: crypto.randomUUID(),
            userId,
            balance: '0.00',
            totalTopup: '0.00',
            totalWithdrawn: '0.00',
        });
        return { success: true, message: 'Wallet created successfully' };
    }),
    get: authProcedure.handler(async ({ context }) => {
        const userId = context.user.id;
        const userWallet = await db.query.wallet.findFirst({
            where: eq(wallet.userId, userId),
        });
        return { wallet: userWallet || null };
    }),
    getTransactions: authProcedure.handler(async ({ input, context }) => {
        const { limit = 20, offset = 0 } = z.object({
            limit: z.number().optional(),
            offset: z.number().optional(),
        }).parse(input);
        const userId = context.user.id;
        const fromUser = aliasedTable(user, 'from_user');
        const toUser = aliasedTable(user, 'to_user');
        const transactions = await db
            .select({
            id: transaction.id,
            txRef: transaction.txRef,
            amount: transaction.amount,
            type: transaction.type,
            status: transaction.status,
            description: transaction.description,
            createdAt: transaction.createdAt,
            fromUser: {
                id: fromUser.id,
                name: fromUser.name,
                profilePhoto: fromUser.image, // Use image field from user table
            },
            toUser: {
                id: toUser.id,
                name: toUser.name,
                profilePhoto: toUser.image, // Use image field from user table
            },
        })
            .from(transaction)
            .leftJoin(fromUser, eq(transaction.fromUserId, fromUser.id))
            .leftJoin(toUser, eq(transaction.toUserId, toUser.id))
            .where(eq(transaction.userId, userId))
            .orderBy(desc(transaction.createdAt))
            .limit(limit)
            .offset(offset);
        return { transactions };
    }),
};
//# sourceMappingURL=index.js.map