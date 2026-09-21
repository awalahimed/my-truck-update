// @ts-nocheck
import { db } from '../database/db.js';
import { user } from '../database/schema/auth-schema.js';
import { referral, referralConfig, referralStatus } from '../database/schema/referral-schema.js';
import { wallet } from '../database/schema/wallet-schema.js';
import { transaction, transactionType, paymentStatus } from '../database/schema/payment-schema.js';
import { order } from '../database/schema/order-schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import crypto from 'node:crypto';
import { logger } from '../utils/logger.js';
import { generateReferralCode, getUserByReferralCode } from './referral-code-generator.js';
import { createNotification } from './notification.js';

/**
 * Create referral code for a user
 */
export async function createUserReferralCode(userId: string): Promise<string> {
  try {
    // Check if user already has a code
    const userData = await db
      .select({ referralCode: user.referralCode })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userData.length === 0) {
      throw new Error('User not found');
    }

    if (userData[0]?.referralCode) {
      return userData[0].referralCode;
    }

    // Generate new code
    const code = await generateReferralCode(userId);

    // Update user with code
    await db
      .update(user)
      .set({ referralCode: code })
      .where(eq(user.id, userId));

    logger.info('Referral code created', { userId, code });
    return code;
  } catch (error) {
    logger.error('Failed to create referral code:', error as Error);
    throw error;
  }
}

/**
 * Apply referral code during registration
 */
export async function applyReferralCode(
  userId: string,
  referralCode: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Get referral config first
    const config = await getReferralConfig();
    
    // Check if referral program is enabled
    if (!config.enabled) {
      return { success: false, message: 'Referral program is currently disabled' };
    }
    
    // Get referrer by code
    const referrerId = await getUserByReferralCode(referralCode);
    
    if (!referrerId) {
      return { success: false, message: 'Invalid referral code' };
    }

    // Prevent self-referral
    if (referrerId === userId) {
      return { success: false, message: 'Cannot use your own referral code' };
    }

    // Check if user already referred
    const existingUser = await db
      .select({ referredBy: user.referredBy })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser[0]?.referredBy) {
      return { success: false, message: 'You have already been referred' };
    }

    // Calculate expiry date using current config
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.expiryDays);

    // Create referral record with current config values
    const referralId = crypto.randomUUID();
    await db.insert(referral).values({
      id: referralId,
      referrerId,
      refereeId: userId,
      status: referralStatus.PENDING,
      referrerReward: config.referrerRewardAmount,
      refereeReward: config.refereeRewardAmount,
      expiresAt,
    });

    // Update user with referrer
    await db
      .update(user)
      .set({ referredBy: referrerId })
      .where(eq(user.id, userId));

    // Notify referrer
    await createNotification(referrerId, {
      title: '🎉 New Referral!',
      body: 'Someone just signed up using your referral code',
      type: 'referral_signup',
      data: { referralId, refereeId: userId },
    });

    logger.info('Referral code applied', { userId, referrerId, referralId });
    
    return {
      success: true,
      message: `Referral applied! You'll earn ${config.refereeRewardAmount} ETB when you complete your first order.`,
    };
  } catch (error) {
    logger.error('Failed to apply referral code:', error as Error);
    return { success: false, message: 'Failed to apply referral code' };
  }
}

/**
 * Complete referral when first order is completed
 */
export async function completeReferral(userId: string, orderId: string, orderAmount: number): Promise<void> {
  try {
    // Check if user was referred
    const userData = await db
      .select({ referredBy: user.referredBy })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData[0]?.referredBy) {
      return; // User was not referred
    }

    // Get pending referral
    const referralData = await db
      .select()
      .from(referral)
      .where(
        and(
          eq(referral.refereeId, userId),
          eq(referral.status, referralStatus.PENDING)
        )
      )
      .limit(1);

    if (referralData.length === 0) {
      return; // No pending referral
    }

    const referralRecord = referralData[0]!;

    // Check if referral expired
    if (referralRecord.expiresAt && new Date() > referralRecord.expiresAt) {
      await db
        .update(referral)
        .set({ status: referralStatus.EXPIRED })
        .where(eq(referral.id, referralRecord.id));
      return;
    }

    // Get config
    const config = await getReferralConfig();

    // Check minimum order amount
    if (orderAmount < parseFloat(config.minOrderAmount)) {
      logger.info('Order amount too low for referral completion', {
        orderId,
        orderAmount,
        minAmount: config.minOrderAmount,
      });
      return;
    }

    // Update referral status
    await db
      .update(referral)
      .set({
        status: referralStatus.COMPLETED,
        firstOrderId: orderId,
        completedAt: new Date(),
      })
      .where(eq(referral.id, referralRecord.id));

    // Credit rewards to wallets
    await creditReferralReward(
      referralRecord.referrerId,
      parseFloat(referralRecord.referrerReward || '0'),
      'referrer',
      referralRecord.id
    );

    await creditReferralReward(
      userId,
      parseFloat(referralRecord.refereeReward || '0'),
      'referee',
      referralRecord.id
    );

    // Increment referrer's referral count
    await db
      .update(user)
      .set({ referralCount: sql`${user.referralCount} + 1` })
      .where(eq(user.id, referralRecord.referrerId));

    // Send notifications
    await createNotification(referralRecord.referrerId, {
      title: '💰 Referral Reward Earned!',
      body: `You earned ${referralRecord.referrerReward} ETB! Your friend completed their first order.`,
      type: 'referral_completed',
      data: { referralId: referralRecord.id, amount: referralRecord.referrerReward },
    });

    await createNotification(userId, {
      title: '🎁 Welcome Bonus!',
      body: `You earned ${referralRecord.refereeReward} ETB for completing your first order!`,
      type: 'referral_bonus',
      data: { referralId: referralRecord.id, amount: referralRecord.refereeReward },
    });

    logger.info('Referral completed', {
      referralId: referralRecord.id,
      orderId,
      referrerId: referralRecord.referrerId,
      refereeId: userId,
    });
  } catch (error) {
    logger.error('Failed to complete referral:', error as Error);
  }
}

/**
 * Credit referral reward to wallet
 */
async function creditReferralReward(
  userId: string,
  amount: number,
  type: 'referrer' | 'referee',
  referralId: string
): Promise<void> {
  try {
    // Get or create wallet
    let userWallet = await db
      .select()
      .from(wallet)
      .where(eq(wallet.userId, userId))
      .limit(1);

    if (userWallet.length === 0) {
      // Create wallet if doesn't exist
      await db.insert(wallet).values({
        id: crypto.randomUUID(),
        userId,
        balance: '0.00',
      });

      userWallet = await db
        .select()
        .from(wallet)
        .where(eq(wallet.userId, userId))
        .limit(1);
    }

    // Create transaction record
    const txRef = `REF-${referralId.substring(0, 8)}-${Date.now()}`;
    await db.insert(transaction).values({
      id: crypto.randomUUID(),
      userId,
      txRef,
      amount: amount.toFixed(2),
      type: transactionType.REFUND, // Using REFUND as closest match for reward
      status: paymentStatus.SUCCESS,
      description: type === 'referrer' 
        ? 'Referral reward - friend completed first order'
        : 'Welcome bonus - first order completed',
      meta: { referralId, rewardType: type },
    });

    // Update wallet balance
    await db
      .update(wallet)
      .set({
        balance: sql`${wallet.balance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(wallet.userId, userId));

    logger.info('Referral reward credited', { userId, amount, type, referralId });
  } catch (error) {
    logger.error('Failed to credit referral reward:', error as Error);
    throw error;
  }
}

/**
 * Get referral configuration
 */
export async function getReferralConfig() {
  const config = await db
    .select()
    .from(referralConfig)
    .limit(1);

  if (config.length === 0) {
    // Return default config
    return {
      referrerRewardAmount: '50.00',
      refereeRewardAmount: '25.00',
      minOrderAmount: '100.00',
      expiryDays: 30,
      enabled: true,
    };
  }

  return config[0]!;
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string) {
  try {
    // Get total referrals
    const referrals = await db
      .select()
      .from(referral)
      .where(eq(referral.referrerId, userId));

    const totalReferrals = referrals.length;
    const completedReferrals = referrals.filter(r => r.status === referralStatus.COMPLETED).length;
    const pendingReferrals = referrals.filter(r => r.status === referralStatus.PENDING).length;

    // Calculate total earned
    const totalEarned = referrals
      .filter(r => r.status === referralStatus.COMPLETED)
      .reduce((sum, r) => sum + parseFloat(r.referrerReward || '0'), 0);

    // Get available rewards (unclaimed)
    const availableRewards = referrals
      .filter(r => r.status === referralStatus.COMPLETED && !r.referrerRewardClaimed)
      .reduce((sum, r) => sum + parseFloat(r.referrerReward || '0'), 0);

    return {
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      totalEarned: totalEarned.toFixed(2),
      availableRewards: availableRewards.toFixed(2),
    };
  } catch (error) {
    logger.error('Failed to get referral stats:', error as Error);
    throw error;
  }
}

/**
 * Get referral history for a user
 */
export async function getReferralHistory(userId: string) {
  try {
    const referrals = await db
      .select({
        id: referral.id,
        status: referral.status,
        referrerReward: referral.referrerReward,
        referrerRewardClaimed: referral.referrerRewardClaimed,
        completedAt: referral.completedAt,
        createdAt: referral.createdAt,
        expiresAt: referral.expiresAt,
        refereeName: user.name,
        refereePhone: user.phoneNumber,
      })
      .from(referral)
      .leftJoin(user, eq(referral.refereeId, user.id))
      .where(eq(referral.referrerId, userId))
      .orderBy(desc(referral.createdAt));

    return referrals;
  } catch (error) {
    logger.error('Failed to get referral history:', error as Error);
    throw error;
  }
}
