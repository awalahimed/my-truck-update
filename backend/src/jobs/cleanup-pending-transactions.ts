// @ts-nocheck
import { db } from '../database/db.js';
import { transaction, paymentStatus } from '../database/schema/payment-schema.js';
import { eq, and, lt } from 'drizzle-orm';
import { logger } from '../utils/logger.js';

/**
 * Cleanup job to remove pending transactions older than 1 hour
 * Runs once daily at night (2 AM)
 */
export async function cleanupPendingTransactions() {
  try {
    logger.info('[Cleanup Job] Starting cleanup of pending transactions...');

    // Calculate timestamp for 1 hour ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Delete pending transactions older than 1 hour
    const result = await db
      .delete(transaction)
      .where(
        and(
          eq(transaction.status, paymentStatus.PENDING),
          lt(transaction.createdAt, oneHourAgo)
        )
      );

    logger.info('[Cleanup Job] Cleanup completed', {
      deletedCount: result.rowsAffected || 0,
      cutoffTime: oneHourAgo.toISOString(),
    });

    return {
      success: true,
      deletedCount: result.rowsAffected || 0,
    };
  } catch (error) {
    logger.error('[Cleanup Job] Error during cleanup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
