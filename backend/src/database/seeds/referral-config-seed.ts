// @ts-nocheck
import { db } from '../db.js';
import { referralConfig } from '../schema/referral-schema.js';
import { logger } from '../../utils/logger.js';
import crypto from 'node:crypto';

/**
 * Seed default referral configuration
 */
export async function seedReferralConfig() {
  try {
    // Check if config already exists
    const existing = await db.select().from(referralConfig).limit(1);

    if (existing.length > 0) {
      logger.info('Referral config already exists, skipping seed');
      return;
    }

    // Insert default config
    await db.insert(referralConfig).values({
      id: crypto.randomUUID(),
      referrerRewardAmount: '50.00',
      refereeRewardAmount: '25.00',
      minOrderAmount: '100.00',
      expiryDays: 30,
      enabled: true,
    });

    logger.info('Referral config seeded successfully');
  } catch (error) {
    logger.error('Failed to seed referral config:', error as Error);
  }
}
