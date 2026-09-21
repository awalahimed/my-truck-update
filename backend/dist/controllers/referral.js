import { os } from '@orpc/server';
import { z } from 'zod';
import { authProcedure } from '../middlewares/auth.js';
import { createUserReferralCode, applyReferralCode, getReferralStats, getReferralHistory, getReferralConfig, } from '../services/referral.js';
import { isReferralCodeValid } from '../services/referral-code-generator.js';
import { logger } from '../utils/logger.js';
/**
 * Get user's referral code
 */
const getMyReferralCode = authProcedure.handler(async ({ context }) => {
    const userId = context.user.id;
    const code = await createUserReferralCode(userId);
    // Generate share URL (you can customize this)
    const shareUrl = `${process.env.APP_URL || 'https://mytrack.app'}/ref/${code}`;
    return {
        success: true,
        code,
        shareUrl,
    };
});
/**
 * Validate referral code
 */
const validateCode = os.handler(async (ctx) => {
    const input = z.object({
        code: z.string().length(6),
    }).parse(ctx.input);
    // Check if program is enabled first
    const config = await getReferralConfig();
    if (!config.enabled) {
        return {
            success: true,
            valid: false,
            message: 'Referral program is currently disabled',
        };
    }
    const isValid = await isReferralCodeValid(input.code);
    if (isValid) {
        return {
            success: true,
            valid: true,
            reward: config.refereeRewardAmount,
            message: `You'll earn ${config.refereeRewardAmount} ETB when you complete your first order!`,
        };
    }
    return {
        success: true,
        valid: false,
        message: 'Invalid referral code',
    };
});
/**
 * Get referral program status and config (public)
 */
const getProgramStatus = os.handler(async () => {
    try {
        const config = await getReferralConfig();
        return {
            success: true,
            enabled: config.enabled,
            referrerReward: config.referrerRewardAmount,
            refereeReward: config.refereeRewardAmount,
            minOrderAmount: config.minOrderAmount,
            expiryDays: config.expiryDays,
        };
    }
    catch (error) {
        logger.error('Failed to get program status:', { error });
        return {
            success: false,
            enabled: false,
        };
    }
});
/**
 * Apply referral code (during registration)
 */
const applyCode = authProcedure.handler(async ({ input, context }) => {
    const data = z.object({
        referralCode: z.string().length(6),
    }).parse(input);
    const userId = context.user.id;
    const result = await applyReferralCode(userId, data.referralCode);
    return result;
});
/**
 * Get referral statistics
 */
const getStats = authProcedure.handler(async ({ context }) => {
    const userId = context.user.id;
    const stats = await getReferralStats(userId);
    return {
        success: true,
        ...stats,
    };
});
/**
 * Get referral history
 */
const getHistory = authProcedure.handler(async ({ context }) => {
    const userId = context.user.id;
    const referrals = await getReferralHistory(userId);
    return {
        success: true,
        referrals,
    };
});
export const referralController = {
    getMyReferralCode,
    validateCode,
    applyCode,
    getStats,
    getHistory,
    getProgramStatus,
};
//# sourceMappingURL=referral.js.map