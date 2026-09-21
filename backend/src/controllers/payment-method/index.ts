import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import { db } from '../../database/db.js';
import { paymentMethod } from '../../database/schema/payment-method-schema.js';
import { authProcedure } from '../../middlewares/auth.js';
import { eq, and } from 'drizzle-orm';
import crypto from 'node:crypto';
import { config } from '../../config/env_config.js';

interface Bank {
  id: string;
  name: string;
  swift?: string;
}

export const paymentMethodController = {
  getBanks: authProcedure.handler(async (): Promise<{ success: boolean; banks: Array<{ id: string; name: string; swift?: string }> }> => {
    try {
      const response = await fetch('https://api.chapa.co/v1/banks', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.chapa.secretKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch banks');
      }

      const data = await response.json() as { data?: Array<{ id: string; name: string; swift?: string }> };
      return { success: true, banks: data.data || [] };
    } catch (error) {
      console.error('[getBanks] Error:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to fetch banks list' });
    }
  }),

  create: authProcedure.handler(async ({ input, context }) => {
    try {
      const { type, provider, accountNumber, accountName, isDefault } = z.object({
        type: z.enum(['bank_account', 'mobile_money']),
        provider: z.string(),
        accountNumber: z.string(),
        accountName: z.string(),
        isDefault: z.boolean().optional(),
      }).parse(input);

      const userId = context.user.id;

      if (isDefault) {
        await db.update(paymentMethod)
          .set({ isDefault: false })
          .where(eq(paymentMethod.userId, userId));
      }

      const methodId = crypto.randomUUID();
      await db.insert(paymentMethod).values({
        id: methodId,
        userId,
        type,
        provider,
        accountNumber,
        accountName,
        isDefault: isDefault || false,
      });

      // Fetch the newly created method
      const newMethod = await db.query.paymentMethod.findFirst({
        where: eq(paymentMethod.id, methodId),
      });

      return { success: true, message: 'Payment method added successfully', method: newMethod };
    } catch (error) {
      console.error('[paymentMethod.create] Error:', error);
      if (error instanceof z.ZodError) {
        throw new ORPCError('BAD_REQUEST', { message: 'Invalid input data' });
      }
      throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to create payment method' });
    }
  }),

  list: authProcedure.handler(async ({ context }) => {
    const userId = context.user.id;

    const methods = await db.query.paymentMethod.findMany({
      where: eq(paymentMethod.userId, userId),
      orderBy: (paymentMethod, { desc }) => [desc(paymentMethod.isDefault), desc(paymentMethod.createdAt)],
    });

    return { methods };
  }),

  setDefault: authProcedure.handler(async ({ input, context }) => {
    const { methodId } = z.object({
      methodId: z.string(),
    }).parse(input);

    const userId = context.user.id;

    const method = await db.query.paymentMethod.findFirst({
      where: and(
        eq(paymentMethod.id, methodId),
        eq(paymentMethod.userId, userId)
      ),
    });

    if (!method) {
      throw new ORPCError('NOT_FOUND', { message: 'Payment method not found' });
    }

    await db.update(paymentMethod)
      .set({ isDefault: false })
      .where(eq(paymentMethod.userId, userId));

    await db.update(paymentMethod)
      .set({ isDefault: true })
      .where(eq(paymentMethod.id, methodId));

    return { success: true };
  }),

  delete: authProcedure.handler(async ({ input, context }) => {
    const { methodId } = z.object({
      methodId: z.string(),
    }).parse(input);

    const userId = context.user.id;

    const method = await db.query.paymentMethod.findFirst({
      where: and(
        eq(paymentMethod.id, methodId),
        eq(paymentMethod.userId, userId)
      ),
    });

    if (!method) {
      throw new ORPCError('NOT_FOUND', { message: 'Payment method not found' });
    }

    await db.delete(paymentMethod)
      .where(eq(paymentMethod.id, methodId));

    return { success: true };
  }),
};
