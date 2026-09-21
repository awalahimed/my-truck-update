import { z } from 'zod';
import { adminProcedure } from '../../middlewares/auth-admin.js';
import { db } from '../../database/db.js';
import { transaction, transactionType, paymentStatus } from '../../database/schema/payment-schema.js';
import { wallet } from '../../database/schema/wallet-schema.js';
import { order } from '../../database/schema/order-schema.js';
import { user } from '../../database/schema/auth-schema.js';
import { sql, eq, and, gte, lte, desc } from 'drizzle-orm';
import { logger } from '../../utils/logger.js';
// Platform user ID (should match the one in order controller)
const PLATFORM_USER_ID = 'platform';
/**
 * Get platform wallet statistics
 */
const getStats = adminProcedure.handler(async () => {
    try {
        console.log('[adminWallet.getStats] Fetching platform wallet...');
        // Get platform wallet balance
        const platformWallet = await db
            .select()
            .from(wallet)
            .where(eq(wallet.userId, PLATFORM_USER_ID))
            .limit(1);
        console.log('[adminWallet.getStats] Platform wallet query result:', {
            found: platformWallet.length > 0,
            userId: PLATFORM_USER_ID,
            wallet: platformWallet[0] || null,
        });
        // If wallet doesn't exist, return empty stats
        if (platformWallet.length === 0) {
            console.log('[adminWallet.getStats] ❌ Platform wallet not found');
            return {
                success: false,
                message: 'Platform wallet not found. Please create it first.',
                stats: null,
            };
        }
        console.log('[adminWallet.getStats] ✅ Platform wallet found, fetching stats...');
        const currentBalance = parseFloat(platformWallet[0]?.balance || '0');
        console.log('[adminWallet.getStats] Current platform balance:', currentBalance);
        // Get total platform fees collected (all time)
        const totalFeesResult = await db
            .select({
            total: sql `SUM(${transaction.amount})`,
            count: sql `COUNT(*)`,
        })
            .from(transaction)
            .where(and(eq(transaction.type, transactionType.AGENT_FEE), eq(transaction.status, paymentStatus.SUCCESS)));
        console.log('[adminWallet.getStats] Total fees query result:', totalFeesResult);
        const totalFeesCollected = parseFloat(totalFeesResult[0]?.total?.toString() || '0');
        const totalFeesCount = Number(totalFeesResult[0]?.count || 0);
        console.log('[adminWallet.getStats] Total fees collected:', totalFeesCollected, 'from', totalFeesCount, 'transactions');
        // Get this month's fees
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        const monthlyFeesResult = await db
            .select({
            total: sql `SUM(${transaction.amount})`,
        })
            .from(transaction)
            .where(and(eq(transaction.type, transactionType.AGENT_FEE), eq(transaction.status, paymentStatus.SUCCESS), gte(transaction.createdAt, firstDayOfMonth)));
        console.log('[adminWallet.getStats] Monthly fees query result:', monthlyFeesResult);
        const monthlyFees = parseFloat(monthlyFeesResult[0]?.total?.toString() || '0');
        console.log('[adminWallet.getStats] Monthly fees:', monthlyFees);
        // Get today's fees
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const todayFeesResult = await db
            .select({
            total: sql `SUM(${transaction.amount})`,
        })
            .from(transaction)
            .where(and(eq(transaction.type, transactionType.AGENT_FEE), eq(transaction.status, paymentStatus.SUCCESS), gte(transaction.createdAt, startOfDay)));
        console.log('[adminWallet.getStats] Today fees query result:', todayFeesResult);
        const todayFees = parseFloat(todayFeesResult[0]?.total?.toString() || '0');
        console.log('[adminWallet.getStats] Today fees:', todayFees);
        // Get total completed orders count
        const completedOrdersResult = await db
            .select({
            count: sql `count(*)`,
        })
            .from(order)
            .where(sql `${order.agentFee} IS NOT NULL`);
        const totalOrders = Number(completedOrdersResult[0]?.count || 0);
        // Get fees by day for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const feesByDay = await db
            .select({
            date: sql `DATE(${transaction.createdAt})`,
            total: sql `SUM(${transaction.amount})`,
            count: sql `count(*)`,
        })
            .from(transaction)
            .where(and(eq(transaction.type, transactionType.AGENT_FEE), eq(transaction.status, paymentStatus.SUCCESS), gte(transaction.createdAt, thirtyDaysAgo)))
            .groupBy(sql `DATE(${transaction.createdAt})`)
            .orderBy(sql `DATE(${transaction.createdAt})`);
        const earningsByDay = feesByDay.reduce((acc, item) => {
            acc[item.date] = {
                amount: parseFloat(item.total?.toString() || '0'),
                count: Number(item.count || 0),
            };
            return acc;
        }, {});
        console.log('[adminWallet.getStats] ✅ Stats calculated successfully:', {
            currentBalance: currentBalance.toFixed(2),
            totalFeesCollected: totalFeesCollected.toFixed(2),
            totalOrders,
        });
        return {
            success: true,
            stats: {
                currentBalance: currentBalance.toFixed(2),
                totalFeesCollected: totalFeesCollected.toFixed(2),
                monthlyFees: monthlyFees.toFixed(2),
                todayFees: todayFees.toFixed(2),
                totalOrders,
                earningsByDay,
            },
        };
    }
    catch (error) {
        logger.error('Failed to get platform wallet stats:', { error });
        console.error('[adminWallet.getStats] ❌ Error:', error);
        throw error;
    }
});
/**
 * Get platform fee transactions with filters
 */
const getTransactions = adminProcedure
    .input(z.object({
    limit: z.number().default(50),
    offset: z.number().default(0),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
}))
    .handler(async ({ input }) => {
    try {
        const { limit, offset, startDate, endDate } = input;
        // Build query conditions
        const conditions = [
            eq(transaction.type, transactionType.AGENT_FEE),
            eq(transaction.status, paymentStatus.SUCCESS),
        ];
        if (startDate) {
            conditions.push(gte(transaction.createdAt, new Date(startDate)));
        }
        if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            conditions.push(lte(transaction.createdAt, endDateTime));
        }
        // Get transactions with driver info (name, phone, profile photo)
        const transactions = await db
            .select({
            id: transaction.id,
            amount: transaction.amount,
            txRef: transaction.txRef,
            description: transaction.description,
            meta: transaction.meta,
            createdAt: transaction.createdAt,
            fromUserName: user.name,
            fromUserPhone: user.phoneNumber,
            fromUserProfilePhoto: user.image,
        })
            .from(transaction)
            .leftJoin(user, eq(transaction.fromUserId, user.id))
            .where(and(...conditions))
            .orderBy(desc(transaction.createdAt))
            .limit(limit)
            .offset(offset);
        // Get total count
        const totalCountResult = await db
            .select({
            count: sql `count(*)`,
        })
            .from(transaction)
            .where(and(...conditions));
        const totalCount = totalCountResult[0]?.count || 0;
        return {
            success: true,
            transactions,
            total: totalCount,
            limit,
            offset,
        };
    }
    catch (error) {
        logger.error('Failed to get platform transactions:', { error });
        throw error;
    }
});
/**
 * Get withdrawal history (if admin withdraws from platform wallet)
 */
const getWithdrawals = adminProcedure
    .input(z.object({
    limit: z.number().default(20),
    offset: z.number().default(0),
}))
    .handler(async ({ input }) => {
    try {
        const { limit, offset } = input;
        // Get withdrawal transactions from platform wallet
        const withdrawals = await db
            .select({
            id: transaction.id,
            amount: transaction.amount,
            txRef: transaction.txRef,
            description: transaction.description,
            status: transaction.status,
            createdAt: transaction.createdAt,
        })
            .from(transaction)
            .where(and(eq(transaction.fromUserId, PLATFORM_USER_ID), eq(transaction.type, transactionType.WITHDRAWAL)))
            .orderBy(desc(transaction.createdAt))
            .limit(limit)
            .offset(offset);
        // Get total count
        const totalCountResult = await db
            .select({
            count: sql `count(*)`,
        })
            .from(transaction)
            .where(and(eq(transaction.fromUserId, PLATFORM_USER_ID), eq(transaction.type, transactionType.WITHDRAWAL)));
        const totalCount = totalCountResult[0]?.count || 0;
        return {
            success: true,
            withdrawals,
            total: totalCount,
            limit,
            offset,
        };
    }
    catch (error) {
        logger.error('Failed to get platform withdrawals:', { error });
        throw error;
    }
});
/**
 * Create platform wallet (one-time setup)
 */
const createPlatformWallet = adminProcedure.handler(async () => {
    try {
        console.log('[adminWallet.createPlatformWallet] Starting wallet creation...');
        // Check if platform user exists
        const existingUser = await db
            .select()
            .from(user)
            .where(eq(user.id, PLATFORM_USER_ID))
            .limit(1);
        console.log('[adminWallet.createPlatformWallet] Platform user check:', {
            exists: existingUser.length > 0,
            userId: PLATFORM_USER_ID,
        });
        if (existingUser.length === 0) {
            console.log('[adminWallet.createPlatformWallet] Creating platform user...');
            // Create platform user
            await db.insert(user).values({
                id: PLATFORM_USER_ID,
                name: 'Platform',
                phoneNumber: '+251000000000',
                role: 'admin',
                accountStatus: 'active',
                emailVerified: true,
                banned: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('[adminWallet.createPlatformWallet] ✅ Platform user created');
        }
        // Check if platform wallet exists
        const existingWallet = await db
            .select()
            .from(wallet)
            .where(eq(wallet.userId, PLATFORM_USER_ID))
            .limit(1);
        console.log('[adminWallet.createPlatformWallet] Platform wallet check:', {
            exists: existingWallet.length > 0,
            wallet: existingWallet[0] || null,
        });
        if (existingWallet.length > 0) {
            console.log('[adminWallet.createPlatformWallet] ⚠️ Platform wallet already exists');
            return {
                success: false,
                message: 'Platform wallet already exists',
            };
        }
        console.log('[adminWallet.createPlatformWallet] Creating platform wallet...');
        // Create platform wallet
        await db.insert(wallet).values({
            id: `wallet_${PLATFORM_USER_ID}`,
            userId: PLATFORM_USER_ID,
            balance: '0.00',
            totalTopup: '0.00',
            totalWithdrawn: '0.00',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        logger.info('Platform wallet created successfully');
        console.log('[adminWallet.createPlatformWallet] ✅ Platform wallet created successfully');
        return {
            success: true,
            message: 'Platform wallet created successfully',
        };
    }
    catch (error) {
        logger.error('Failed to create platform wallet:', { error });
        console.error('[adminWallet.createPlatformWallet] ❌ Error:', error);
        throw error;
    }
});
export const adminWalletController = {
    getStats,
    getTransactions,
    getWithdrawals,
    createPlatformWallet,
};
//# sourceMappingURL=wallet.js.map