import { os, ORPCError } from '@orpc/server';
import { z } from 'zod';
import { db } from '../../database/db.js';
import { wallet } from '../../database/schema/wallet-schema.js';
import { transaction, transactionType, paymentStatus } from '../../database/schema/payment-schema.js';
import { user } from '../../database/schema/auth-schema.js';
import { authProcedure } from '../../middlewares/auth.js';
import { eq, desc, or, sql, getTableColumns, and } from 'drizzle-orm';
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

  // Task 4: getWallet returning formatted wallet metrics
  getWallet: authProcedure.handler(async ({ context }) => {
    const userId = context.user.id;

    let userWallet = await db.query.wallet.findFirst({
      where: eq(wallet.userId, userId),
    });

    // Auto-initialize wallet if it doesn't exist
    if (!userWallet) {
      const newId = crypto.randomUUID();
      await db.insert(wallet).values({
        id: newId,
        userId,
        balance: '0.00',
        reservedBalance: '0.00',
        totalTopup: '0.00',
        totalWithdrawn: '0.00',
      });
      userWallet = await db.query.wallet.findFirst({
        where: eq(wallet.userId, userId),
      });
    }

    return {
      success: true,
      wallet: userWallet,
      availableBalance: parseFloat(userWallet?.balance || '0'),
      reservedBalance: parseFloat(userWallet?.reservedBalance || '0'),
      totalTopup: parseFloat(userWallet?.totalTopup || '0'),
      totalWithdrawn: parseFloat(userWallet?.totalWithdrawn || '0'),
    };
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

  // Top-Up Procedure (powers direct top-up / credit integration)
  topUp: authProcedure
    .input(z.object({
      amount: z.number().positive(),
      description: z.string().optional(),
    }))
    .handler(async ({ input, context }) => {
      const userId = context.user.id;
      const { amount, description = 'Direct Wallet Top-Up' } = input;

      return await db.transaction(async (tx) => {
        let userWallet = await tx.query.wallet.findFirst({
          where: eq(wallet.userId, userId),
        });

        if (!userWallet) {
          const newId = crypto.randomUUID();
          await tx.insert(wallet).values({
            id: newId,
            userId,
            balance: amount.toFixed(2),
            reservedBalance: '0.00',
            totalTopup: amount.toFixed(2),
            totalWithdrawn: '0.00',
          });
        } else {
          const currentBal = parseFloat(userWallet.balance || '0');
          const currentTopup = parseFloat(userWallet.totalTopup || '0');
          const newBal = currentBal + amount;
          const newTopup = currentTopup + amount;

          await tx.update(wallet)
            .set({
              balance: newBal.toFixed(2),
              totalTopup: newTopup.toFixed(2),
              updatedAt: new Date(),
            })
            .where(eq(wallet.userId, userId));
        }

        // Record transaction
        const txId = crypto.randomUUID();
        const txRef = `TOPUP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        await tx.insert(transaction).values({
          id: txId,
          userId,
          txRef,
          amount: amount.toFixed(2),
          currency: 'ETB',
          type: transactionType.TOPUP,
          status: paymentStatus.SUCCESS,
          description,
        });

        const updatedWallet = await tx.query.wallet.findFirst({
          where: eq(wallet.userId, userId),
        });

        return {
          success: true,
          message: `Successfully topped up ${amount.toFixed(2)} ETB`,
          wallet: updatedWallet,
        };
      });
    }),
};
