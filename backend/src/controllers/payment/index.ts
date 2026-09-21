// @ts-nocheck
import { os, ORPCError } from '@orpc/server';
import { z } from 'zod';
import { db } from '../../database/db.js';
import { transaction, paymentStatus, transactionType } from '../../database/schema/payment-schema.js';
import { wallet } from '../../database/schema/wallet-schema.js';
import { chapa, type ChapaInitializeOptions } from '../../utils/chapa.js';
import { authProcedure } from '../../middlewares/auth.js';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';

export const payment = os.router({
  initialize: authProcedure
    .input(z.object({
      amount: z.string(),
      currency: z.string().optional().default('ETB'),
      first_name: z.string(),
      last_name: z.string(),
      callback_url: z.string().optional(),
      return_url: z.string().optional(),
    }))
    .handler(async ({ input, context }) => {
      console.log('[Payment] Initialize request received:', JSON.stringify(input, null, 2));
      console.log('[Payment] User context:', context.user.id);

      const { amount, currency, first_name, last_name, callback_url, return_url } = input;

      // Validate after receiving
      if (!amount || parseFloat(amount) <= 0) {
        throw new ORPCError('BAD_REQUEST', { message: 'Invalid amount' });
      }

      const txRef = `TX-${crypto.randomUUID()}`;
      const userId = context.user.id;

      try {
        // Build Chapa options without email
        const chapaOptions: ChapaInitializeOptions = {
          amount,
          currency: currency || 'ETB',
          first_name,
          last_name,
          tx_ref: txRef,
        };

        if (callback_url) {
          chapaOptions.callback_url = callback_url;
        }

        if (return_url) {
          chapaOptions.return_url = return_url;
        }

        const chapaResponse = await chapa.initialize(chapaOptions);

        await db.insert(transaction).values({
          id: crypto.randomUUID(),
          userId,
          txRef,
          amount,
          currency,
          type: transactionType.TOPUP,
          status: paymentStatus.PENDING,
          description: 'Wallet Top-up',
        });

        return {
          success: true,
          checkout_url: chapaResponse.data.checkout_url,
          tx_ref: txRef,
        };
      } catch (error) {
        console.error('[Payment] Initialize error:', error);
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: error instanceof Error ? error.message : 'Failed to initialize payment',
          cause: error,
        });
      }
    }),

  verify: authProcedure
    .input(z.object({
      tx_ref: z.string(),
    }))
    .handler(async ({ input, context }) => {
      const { tx_ref } = input;
      
      console.log('[Payment] 📥 Verify request received:', { tx_ref, userId: context.user.id });

      const existingTransaction = await db.query.transaction.findFirst({
        where: eq(transaction.txRef, tx_ref),
      });

      if (!existingTransaction) {
        console.error('[Payment] ❌ Transaction not found:', tx_ref);
        throw new ORPCError('NOT_FOUND', { message: 'Transaction not found' });
      }

      console.log('[Payment] 📋 Existing transaction:', {
        id: existingTransaction.id,
        status: existingTransaction.status,
        amount: existingTransaction.amount,
        userId: existingTransaction.userId
      });

      if (existingTransaction.status === paymentStatus.SUCCESS) {
        console.log('[Payment] ✅ Transaction already successful');
        return { success: true, status: paymentStatus.SUCCESS };
      }

      try {
        console.log('[Payment] 🔍 Calling Chapa verify API...');
        const verification = await chapa.verify(tx_ref);
        console.log('[Payment] 📥 Chapa response:', verification);

        if (verification.status === 'success' && verification.data.status === 'success') {
          console.log('[Payment] ✅ Payment verified successfully, updating database...');
          
          // Payment successful - update transaction and wallet
          await db.update(transaction)
            .set({
              status: paymentStatus.SUCCESS,
              chapaReference: verification.data.reference,
              paymentMethod: verification.data.method,
              updatedAt: new Date(),
            })
            .where(eq(transaction.txRef, tx_ref));

          const userWallet = await db.query.wallet.findFirst({
            where: eq(wallet.userId, context.user.id),
          });

          if (userWallet) {
            const newBalance = parseFloat(userWallet.balance) + parseFloat(existingTransaction.amount);
            const newTotalTopup = parseFloat(userWallet.totalTopup) + parseFloat(existingTransaction.amount);

            console.log('[Payment] 💰 Updating wallet:', {
              oldBalance: userWallet.balance,
              newBalance: newBalance.toFixed(2),
              amount: existingTransaction.amount
            });

            await db.update(wallet)
              .set({
                balance: newBalance.toFixed(2),
                totalTopup: newTotalTopup.toFixed(2),
                updatedAt: new Date(),
              })
              .where(eq(wallet.userId, context.user.id));
          }

          console.log('[Payment] ✅ Verification complete - SUCCESS');
          return { success: true, status: paymentStatus.SUCCESS };
        } else {
          console.log('[Payment] ⚠️ Payment not successful, marking as cancelled:', verification);
          
          // Payment not successful - mark as cancelled
          await db.update(transaction)
            .set({
              status: paymentStatus.CANCELLED,
              updatedAt: new Date(),
            })
            .where(eq(transaction.txRef, tx_ref));

          return { success: false, status: paymentStatus.CANCELLED };
        }
      } catch (error) {
        // If verification fails (user closed without completing), mark as cancelled
        console.warn('[Payment] ❌ Verification failed, marking as cancelled:', { tx_ref, error });
        
        await db.update(transaction)
          .set({
            status: paymentStatus.CANCELLED,
            updatedAt: new Date(),
          })
          .where(eq(transaction.txRef, tx_ref));

        return { success: false, status: paymentStatus.CANCELLED };
      }
    }),
});
