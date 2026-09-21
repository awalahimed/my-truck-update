import { z } from 'zod';
import { os, ORPCError } from '@orpc/server';
import { adminProcedure } from '../../middlewares/auth-admin.js';
import { db } from '../../database/db.js';
import { user } from '../../database/schema/auth-schema.js';
import { wallet, walletTransaction } from '../../database/schema/wallet-schema.js';
import { eq, sql } from 'drizzle-orm';

console.log('[Admin Giveaway Controller] Loading...');

const getAgents = adminProcedure
  .input(z.object({
    search: z.string().optional(),
    offset: z.number().min(0).default(0),
    limit: z.number().min(1).max(100).default(20),
  }))
  .handler(async ({ input }) => {
    try {
      console.log('[Giveaway] getAgents called');

      const searchWhere = input.search
        ? sql`AND (u.name LIKE ${'%' + input.search + '%'} OR u.phone_number LIKE ${'%' + input.search + '%'})`
        : sql``;

      // Count total agents
      const [countResult] = await db.execute(sql`
        SELECT COUNT(*) AS total FROM user u WHERE u.role = 'agent' ${searchWhere}
      `) as any[];
      const total = Number(countResult?.[0]?.total || countResult?.total || 0);
      console.log('[Giveaway] total agents:', total);

      // Paginated agent list with tier, wallet, and conversion stats
      const [rows] = await db.execute(sql`
        SELECT
          u.id,
          u.name,
          u.phone_number AS phone,
          u.email,
          ap.tier,
          ap.assigned_city,
          ap.assigned_town,
          COALESCE(stats.total_registered, 0) AS total_registered,
          COALESCE(stats.total_drivers, 0) AS total_drivers,
          COALESCE(stats.active_users, 0) AS active_users,
          COALESCE(stats.active_drivers, 0) AS active_drivers,
          COALESCE(stats.inactive_users, 0) AS inactive_users,
          COALESCE(w.balance, '0.00') AS wallet_balance
        FROM user u
        LEFT JOIN agent_profile ap ON ap.user_id = u.id
        LEFT JOIN wallet w ON w.user_id = u.id
        LEFT JOIN (
          SELECT
            u2.registered_by_agent_id,
            COUNT(DISTINCT u2.id) AS total_registered,
            COUNT(DISTINCT CASE WHEN u2.role = 'driver' THEN u2.id END) AS total_drivers,
            COUNT(DISTINCT CASE WHEN o.customer_id IS NOT NULL THEN u2.id END) AS active_users,
            COUNT(DISTINCT CASE WHEN od.driver_id IS NOT NULL THEN u2.id END) AS active_drivers,
            COUNT(DISTINCT CASE WHEN o.customer_id IS NULL THEN u2.id END) AS inactive_users
          FROM user u2
          LEFT JOIN \`order\` o ON o.customer_id = u2.id
          LEFT JOIN \`order\` od ON od.driver_id = u2.id AND od.status = 'completed'
          WHERE u2.registered_by_agent_id IS NOT NULL
          GROUP BY u2.registered_by_agent_id
        ) stats ON stats.registered_by_agent_id = u.id
        WHERE u.role = 'agent' ${searchWhere}
        ORDER BY COALESCE(stats.total_registered, 0) DESC
        LIMIT ${input.limit} OFFSET ${input.offset}
      `) as any[];

      const rowArray = Array.isArray(rows) ? rows : [];
      console.log('[Giveaway] rows returned:', rowArray.length);

      const agents = rowArray.map((r: any) => {
        const totalReg = Number(r.total_registered);
        const activeU = Number(r.active_users);
        return {
          id: r.id,
          name: r.name,
          phone: r.phone || '',
          email: r.email || '',
          tier: r.tier || 'new',
          assignedCity: r.assigned_city || '',
          assignedTown: r.assigned_town || '',
          totalRegistered: totalReg,
          totalDrivers: Number(r.total_drivers),
          activeUsers: activeU,
          activeDrivers: Number(r.active_drivers),
          inactiveUsers: Number(r.inactive_users),
          conversionRate: totalReg > 0
            ? parseFloat(((activeU / totalReg) * 100).toFixed(1))
            : 0,
          walletBalance: r.wallet_balance || '0.00',
        };
      });

      return {
        success: true,
        agents,
        total,
        offset: input.offset,
        limit: input.limit,
      };
    } catch (error) {
      console.error('[Giveaway] Error fetching agents:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to fetch giveaway agents' });
    }
  });

const awardBonus = adminProcedure
  .input(z.object({
    agentIds: z.array(z.string()).min(1),
    amount: z.number().positive(),
    reason: z.string().optional(),
  }))
  .handler(async ({ input }) => {
    try {
      console.log('[Giveaway] awardBonus called:', { agentIds: input.agentIds.length, amount: input.amount });

      const { randomUUID } = await import('crypto');
      const results: { agentId: string; name: string; success: boolean; error?: string }[] = [];

      for (const agentId of input.agentIds) {
        try {
          // Get agent name for response
          const [agentUser] = await db.select({ name: user.name })
            .from(user)
            .where(eq(user.id, agentId))
            .limit(1) as any[];

          if (!agentUser) {
            results.push({ agentId, name: 'Unknown', success: false, error: 'Agent not found' });
            continue;
          }

          // Get or create wallet
          let userWallet = await db.select()
            .from(wallet)
            .where(eq(wallet.userId, agentId))
            .limit(1) as any[];

          let walletId: string;
          if (userWallet.length === 0) {
            walletId = randomUUID();
            await db.insert(wallet).values({
              id: walletId,
              userId: agentId,
              balance: '0.00',
              reservedBalance: '0.00',
              totalTopup: '0.00',
              totalWithdrawn: '0.00',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else {
            walletId = userWallet[0].id;
          }

          // Credit wallet balance
          await db.update(wallet)
            .set({
              balance: sql`${wallet.balance} + ${input.amount}`,
              totalTopup: sql`${wallet.totalTopup} + ${input.amount}`,
              updatedAt: new Date(),
            })
            .where(eq(wallet.id, walletId));

          // Record transaction
          await db.insert(walletTransaction).values({
            id: randomUUID(),
            userId: agentId,
            walletId,
            type: 'bonus',
            amount: input.amount.toFixed(2),
            description: input.reason || 'Admin giveaway bonus',
            status: 'completed',
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          results.push({ agentId, name: agentUser.name, success: true });
        } catch (agentError: any) {
          console.error(`[Giveaway] Failed to award bonus to agent ${agentId}:`, agentError);
          results.push({ agentId, name: 'Unknown', success: false, error: agentError?.message || 'Unknown error' });
        }
      }

      const succeeded = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return {
        success: true,
        succeeded: succeeded.length,
        failed: failed.length,
        totalAmount: (input.amount * succeeded.length).toFixed(2),
        results,
      };
    } catch (error) {
      console.error('[Giveaway] Error awarding bonus:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to award bonus' });
    }
  });

export const adminGiveawayController = {
  getAgents,
  awardBonus,
};
