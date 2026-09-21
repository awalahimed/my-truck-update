import { z } from 'zod';
import { adminProcedure } from '../../middlewares/auth-admin.js';
import { db } from '../../database/db.js';
import { referral, referralConfig, referralStatus } from '../../database/schema/referral-schema.js';
import { user } from '../../database/schema/auth-schema.js';
import { eq, desc, sql, and } from 'drizzle-orm';
import { logger } from '../../utils/logger.js';
/**
 * Get referral analytics
 */
const getAnalytics = adminProcedure.handler(async () => {
    try {
        // Get all referrals
        const allReferrals = await db.select().from(referral);
        const totalReferrals = allReferrals.length;
        const completedReferrals = allReferrals.filter(r => r.status === referralStatus.COMPLETED).length;
        const pendingReferrals = allReferrals.filter(r => r.status === referralStatus.PENDING).length;
        const expiredReferrals = allReferrals.filter(r => r.status === referralStatus.EXPIRED).length;
        // Calculate total rewards paid
        const totalRewardsPaid = allReferrals
            .filter(r => r.status === referralStatus.COMPLETED)
            .reduce((sum, r) => {
            const referrerReward = parseFloat(r.referrerReward || '0');
            const refereeReward = parseFloat(r.refereeReward || '0');
            return sum + referrerReward + refereeReward;
        }, 0);
        // Calculate conversion rate
        const conversionRate = totalReferrals > 0
            ? ((completedReferrals / totalReferrals) * 100).toFixed(2)
            : '0.00';
        // Get referrals by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const recentReferrals = allReferrals.filter(r => new Date(r.createdAt) >= sixMonthsAgo);
        // Group by month
        const referralsByMonth = recentReferrals.reduce((acc, r) => {
            const month = new Date(r.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short'
            });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});
        return {
            success: true,
            analytics: {
                totalReferrals,
                completedReferrals,
                pendingReferrals,
                expiredReferrals,
                totalRewardsPaid: totalRewardsPaid.toFixed(2),
                conversionRate,
                referralsByMonth,
            },
        };
    }
    catch (error) {
        logger.error('Failed to get referral analytics:', { error });
        throw error;
    }
});
/**
 * Get referral configuration
 */
const getConfig = adminProcedure.handler(async () => {
    try {
        const config = await db.select().from(referralConfig).limit(1);
        if (config.length === 0) {
            // Return default config
            return {
                success: true,
                config: {
                    referrerRewardAmount: '50.00',
                    refereeRewardAmount: '25.00',
                    minOrderAmount: '100.00',
                    expiryDays: 30,
                    enabled: true,
                },
            };
        }
        return {
            success: true,
            config: config[0],
        };
    }
    catch (error) {
        logger.error('Failed to get referral config:', { error });
        throw error;
    }
});
/**
 * Update referral configuration
 */
const updateConfig = adminProcedure
    .input(z.object({
    referrerRewardAmount: z.string().optional(),
    refereeRewardAmount: z.string().optional(),
    minOrderAmount: z.string().optional(),
    expiryDays: z.number().optional(),
    enabled: z.boolean().optional(),
}))
    .handler(async ({ input }) => {
    try {
        const existingConfig = await db.select().from(referralConfig).limit(1);
        if (existingConfig.length === 0) {
            // Create new config
            await db.insert(referralConfig).values({
                id: crypto.randomUUID(),
                ...input,
            });
        }
        else {
            // Update existing config
            await db
                .update(referralConfig)
                .set(input)
                .where(eq(referralConfig.id, existingConfig[0].id));
        }
        logger.info('Referral config updated', input);
        return {
            success: true,
            message: 'Configuration updated successfully',
        };
    }
    catch (error) {
        logger.error('Failed to update referral config:', { error });
        throw error;
    }
});
/**
 * Get top referrers
 */
const getTopReferrers = adminProcedure
    .input(z.object({
    limit: z.number().default(10),
}))
    .handler(async ({ input }) => {
    try {
        const { limit } = input;
        // Get users with highest referral counts
        const topReferrers = await db
            .select({
            userId: user.id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            referralCode: user.referralCode,
            referralCount: user.referralCount,
        })
            .from(user)
            .where(sql `${user.referralCount} > 0`)
            .orderBy(desc(user.referralCount))
            .limit(limit);
        // Calculate total earned for each referrer
        const referrersWithEarnings = await Promise.all(topReferrers.map(async (referrer) => {
            const referrals = await db
                .select()
                .from(referral)
                .where(and(eq(referral.referrerId, referrer.userId), eq(referral.status, referralStatus.COMPLETED)));
            const totalEarned = referrals.reduce((sum, r) => sum + parseFloat(r.referrerReward || '0'), 0);
            return {
                ...referrer,
                totalEarned: totalEarned.toFixed(2),
                completedReferrals: referrals.length,
            };
        }));
        return {
            success: true,
            topReferrers: referrersWithEarnings,
        };
    }
    catch (error) {
        logger.error('Failed to get top referrers:', { error });
        throw error;
    }
});
/**
 * Get all referrals with filters
 */
const getAllReferrals = adminProcedure
    .input(z.object({
    status: z.enum(['pending', 'completed', 'expired', 'cancelled']).optional(),
    limit: z.number().default(50),
    offset: z.number().default(0),
}))
    .handler(async ({ input }) => {
    try {
        const { status, limit, offset } = input;
        // Build query
        let query = db
            .select({
            id: referral.id,
            status: referral.status,
            referrerReward: referral.referrerReward,
            refereeReward: referral.refereeReward,
            completedAt: referral.completedAt,
            createdAt: referral.createdAt,
            referrerName: sql `referrer.name`,
            referrerPhone: sql `referrer.phone_number`,
            refereeName: sql `referee.name`,
            refereePhone: sql `referee.phone_number`,
        })
            .from(referral)
            .leftJoin(sql `user as referrer`, sql `referrer.id = ${referral.referrerId}`)
            .leftJoin(sql `user as referee`, sql `referee.id = ${referral.refereeId}`)
            .orderBy(desc(referral.createdAt))
            .limit(limit)
            .offset(offset);
        // Apply status filter if provided
        if (status) {
            query = query.where(eq(referral.status, status));
        }
        const referrals = await query;
        // Get total count
        const totalCount = await db
            .select({ count: sql `count(*)` })
            .from(referral)
            .where(status ? eq(referral.status, status) : sql `1=1`);
        return {
            success: true,
            referrals,
            total: totalCount[0]?.count || 0,
            limit,
            offset,
        };
    }
    catch (error) {
        logger.error('Failed to get all referrals:', { error });
        throw error;
    }
});
export const adminReferralController = {
    getAnalytics,
    getConfig,
    updateConfig,
    getTopReferrers,
    getAllReferrals,
};
//# sourceMappingURL=referral.js.map