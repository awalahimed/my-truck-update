import { z } from 'zod';
import { os } from '@orpc/server';
import { authProcedure } from '../middlewares/auth.js';
import { db } from '../database/db.js';
import { user } from '../database/schema/auth-schema.js';
import { vehicle } from '../database/schema/vehicle-schema.js';
import { wallet, walletTransaction } from '../database/schema/wallet-schema.js';
import { order, orderStatus } from '../database/schema/order-schema.js';
import { commissionHistory, assistanceVerification } from '../database/schema/commission-schema.js';
import { eq, and, gte, sql, desc, inArray } from 'drizzle-orm';
import { referral } from '../database/schema/referral-schema.js';
import { userRoles, accountStatus } from '../database/schema/auth-schema.js';
import { agentProfile } from '../database/schema/agent-schema.js';

console.log('[Agent Controller] Loading agent controller...');

export const agentController = os.router({
  // Get agent dashboard stats
  dashboard: os.router({
    getStats: authProcedure
      .handler(async ({ context }) => {
        try {
          const userId = context.user.id;
          console.log('[Agent] dashboard.getStats called for user:', userId);

          // Verify user is an agent (already authenticated, just check role from context)
          if (context.user.role !== 'agent') {
            throw new Error('User is not an agent');
          }

          // Get total customers and drivers in parallel for better performance
          const [customersData, driversData] = await Promise.all([
            db.select({ id: referral.refereeId })
              .from(referral)
              .innerJoin(user, eq(referral.refereeId, user.id))
              .where(and(eq(referral.referrerId, userId), eq(user.role, userRoles.OWNER_SHOP))),
            db.select({ id: referral.refereeId })
              .from(referral)
              .innerJoin(user, eq(referral.refereeId, user.id))
              .where(and(eq(referral.referrerId, userId), eq(user.role, userRoles.DRIVER))),
          ]);
          const totalCustomers = customersData.length;
          const totalDrivers = driversData.length;

          // Calculate total lifetime earnings from commissionHistory (user, driver, assisted)
          const totalCommissionEarningsResult = await db.select({ total: sql<number>`SUM(${commissionHistory.payoutAmount})` })
            .from(commissionHistory)
            .where(eq(commissionHistory.agentId, userId));
          const totalCommissionEarnings = totalCommissionEarningsResult[0]?.total || 0;

          // Get earnings breakdown by type
          const userCommissionEarningsResult = await db.select({ total: sql<number>`SUM(${commissionHistory.payoutAmount})` })
            .from(commissionHistory)
            .where(and(eq(commissionHistory.agentId, userId), eq(commissionHistory.commissionType, 'user')));
          const userCommissionEarnings = userCommissionEarningsResult[0]?.total || 0;

          const driverCommissionEarningsResult = await db.select({ total: sql<number>`SUM(${commissionHistory.payoutAmount})` })
            .from(commissionHistory)
            .where(and(eq(commissionHistory.agentId, userId), eq(commissionHistory.commissionType, 'driver')));
          const driverCommissionEarnings = driverCommissionEarningsResult[0]?.total || 0;

          const assistedCommissionEarningsResult = await db.select({ total: sql<number>`SUM(${commissionHistory.payoutAmount})` })
            .from(commissionHistory)
            .where(and(eq(commissionHistory.agentId, userId), eq(commissionHistory.commissionType, 'assisted')));
          const assistedCommissionEarnings = assistedCommissionEarningsResult[0]?.total || 0;

          // Get current wallet balance
          const agentWallet = await db.select().from(wallet).where(eq(wallet.userId, userId)).limit(1);
          const currentBalance = agentWallet[0]?.balance || '0';

          // Get total orders (assigned to this agent, which is not direct commission but still a stat)
          const totalOrdersResult = await db.select({ count: sql<number>`count(*)` })
            .from(order)
            .where(eq(order.agentId, userId));
          const totalOrders = totalOrdersResult[0]?.count || 0;

          // Get active orders (assigned to this agent)
          const activeOrdersResult = await db.select({ count: sql<number>`count(*)` })
            .from(order)
            .where(and(
              eq(order.agentId, userId),
              sql`${order.status} IN ('pending_approval', 'approved', 'has_offers', 'assigned', 'on_the_way', 'delivered')`
            ));
          const activeOrders = activeOrdersResult[0]?.count || 0;

          // Get recent transactions count (last 24 hours) - consider commission transactions as well
          const twentyFourHoursAgo = new Date();
          twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);
          
          const recentTransactionsResult = await db.select({ count: sql<number>`count(*)` })
            .from(walletTransaction)
            .where(and(
              eq(walletTransaction.userId, userId),
              gte(walletTransaction.createdAt, twentyFourHoursAgo),
              sql`${walletTransaction.type} IN ('commission', 'withdrawal', 'topup', 'penalty', 'bonus', 'refund')`
            ));
          const recentTransactions = recentTransactionsResult[0]?.count || 0;

          // Get status breakdown for orders handled by this agent
          const statusBreakdown: Record<string, number> = {
            pending_approval: 0,
            approved: 0,
            has_offers: 0,
            assigned: 0,
            on_the_way: 0,
            delivered: 0,
            completed: 0,
            rejected: 0,
            cancelled: 0,
          };

          const statusResults = await db.select({
            status: order.status,
            count: sql<number>`count(*)`
          })
          .from(order)
          .where(eq(order.agentId, userId))
          .groupBy(order.status);

          statusResults.forEach(row => {
            if (row.status) {
              statusBreakdown[row.status] = row.count;
            }
          });

          // Get orders by day (last 30 days) for orders handled by this agent
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const ordersByDayResults = await db.select({
            date: sql<string>`DATE(${order.createdAt})`,
            count: sql<number>`count(*)`
          })
          .from(order)
          .where(and(
            eq(order.agentId, userId),
            gte(order.createdAt, thirtyDaysAgo)
          ))
          .groupBy(sql`DATE(${order.createdAt})`);

          const ordersByDay: Record<string, number> = {};
          ordersByDayResults.forEach(row => {
            ordersByDay[row.date] = row.count;
          });

          // Get revenue by day (from wallet transactions of type 'commission')
          const revenueByDayResults = await db.select({
            date: sql<string>`DATE(${walletTransaction.createdAt})`,
            total: sql<number>`SUM(${walletTransaction.amount})`
          })
          .from(walletTransaction)
          .where(and(
            eq(walletTransaction.userId, userId),
            gte(walletTransaction.createdAt, thirtyDaysAgo),
            eq(walletTransaction.type, 'commission')
          ))
          .groupBy(sql`DATE(${walletTransaction.createdAt})`);

          const revenueByDay: Record<string, number> = {};
          revenueByDayResults.forEach(row => {
            revenueByDay[row.date] = row.total;
          });

          // Referral counts: customers and drivers referred by this agent
          const referrals = await db.select({
            id: referral.id,
            refereeId: referral.refereeId,
            status: referral.status,
          })
          .from(referral)
          .where(eq(referral.referrerId, userId));

          let referredCustomers = 0;
          let referredDrivers = 0;

          if (referrals.length > 0) {
            // Fetch roles for referred users
            const refereeIds = referrals.map(r => r.refereeId);
            const referredUsers = await db.select({ id: user.id, role: user.role }).from(user).where(inArray(user.id, refereeIds));

            referredUsers.forEach(u => {
              if (u.role === userRoles.OWNER_SHOP) referredCustomers += 1;
              if (u.role === userRoles.DRIVER) referredDrivers += 1;
            });
          }

          return {
            success: true,
            stats: {
              totalCustomers,
              totalDrivers,
              totalOrders,
              activeOrders,
              recentTransactions,
              currentBalance: parseFloat(currentBalance),
              totalCommissionEarnings: parseFloat(totalCommissionEarnings.toFixed(2)),
              userCommissionEarnings: parseFloat(userCommissionEarnings.toFixed(2)),
              driverCommissionEarnings: parseFloat(driverCommissionEarnings.toFixed(2)),
              assistedCommissionEarnings: parseFloat(assistedCommissionEarnings.toFixed(2)),
              statusBreakdown,
              ordersByDay,
              revenueByDay,
              referredCustomers,
              referredDrivers,
            }
          };
        } catch (error) {
          console.error('[Agent] Error getting dashboard stats:', error);
          throw error;
        }
      }),
    }),

  getAssignedOrders: authProcedure
    .handler(async ({ context }) => {
      const agentId = context.user.id;
      const assignedOrders = await db.select()
        .from(order)
        .where(and(eq(order.agentId, agentId), eq(order.status, orderStatus.AGENT_SELECTED)))
        .orderBy(order.createdAt);

      const customerIds = [...new Set(assignedOrders.map((o) => o.customerId))];
      const customers = customerIds.length > 0
        ? await db.select({ id: user.id, name: user.name, phoneNumber: user.phoneNumber })
            .from(user)
            .where(inArray(user.id, customerIds))
        : [];

      const customerMap = new Map(customers.map((c) => [c.id, c]));
      const ordersWithCustomers = assignedOrders.map((o) => ({
        ...o,
        customerName: customerMap.get(o.customerId)?.name || 'Unknown',
        customerPhone: customerMap.get(o.customerId)?.phoneNumber || 'N/A',
        pickupLocation: { latitude: o.pickupLatitude, longitude: o.pickupLongitude },
        deliveryLocation: { latitude: o.deliveryLatitude, longitude: o.deliveryLongitude },
      }));

      return { success: true, orders: ordersWithCustomers };
    }),

  // Commission analytics endpoints
  commissions: os.router({
    getUserProgression: authProcedure
      .handler(async ({ context }) => {
        const agentId = context.user.id;
        const customers = await db.select({
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          userCycleCount: user.userCycleCount,
          userLifetimeEarnings: user.userLifetimeEarnings,
          createdAt: user.createdAt,
        })
        .from(user)
        .innerJoin(referral, eq(user.id, referral.refereeId))
        .where(and(eq(referral.referrerId, agentId), eq(user.role, userRoles.OWNER_SHOP)));

        return {
          success: true,
          customers: customers.map(c => ({
            ...c,
            currentRate: c.userCycleCount === 0 ? 0.35 : c.userCycleCount === 1 ? 0.35 : c.userCycleCount === 2 ? 0.25 : 0.15,
            userLifetimeEarnings: parseFloat(c.userLifetimeEarnings ?? '0'),
          })),
        };
      }),

    getDriverProgression: authProcedure
      .handler(async ({ context }) => {
        const agentId = context.user.id;
        const drivers = await db.select({
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          userCycleCount: user.userCycleCount,
          userLifetimeEarnings: user.userLifetimeEarnings,
          createdAt: user.createdAt,
        })
        .from(user)
        .innerJoin(referral, eq(user.id, referral.refereeId))
        .where(and(eq(referral.referrerId, agentId), eq(user.role, userRoles.DRIVER)));

        return {
          success: true,
          vehicles: drivers.map(d => ({
            ...d,
            currentRate: d.userCycleCount === 0 ? 0.15 : d.userCycleCount === 1 ? 0.15 : d.userCycleCount === 2 ? 0.135 : 0.10,
            userLifetimeEarnings: parseFloat(d.userLifetimeEarnings ?? '0'),
          })),
        };
      }),

    getConversionMetrics: authProcedure
      .handler(async ({ context }) => {
        const agentId = context.user.id;

        // Get customers and drivers by querying referral table with user join
        const customersData = await db.select({ 
          cycleCount: user.userCycleCount 
        })
          .from(referral)
          .innerJoin(user, eq(referral.refereeId, user.id))
          .where(and(eq(referral.referrerId, agentId), eq(user.role, userRoles.OWNER_SHOP)));
        
        const driversData = await db.select({ 
          cycleCount: user.userCycleCount 
        })
          .from(referral)
          .innerJoin(user, eq(referral.refereeId, user.id))
          .where(and(eq(referral.referrerId, agentId), eq(user.role, userRoles.DRIVER)));

        const tc = customersData.length;
        const ac = customersData.filter(c => (c.cycleCount || 0) >= 1).length;
        const td = driversData.length;
        const ad = driversData.filter(d => (d.cycleCount || 0) >= 1).length;

        return {
          success: true,
          metrics: {
            totalCustomers: tc,
            activeCustomers: ac,
            inactiveCustomers: tc - ac,
            customerConversionRate: tc > 0 ? parseFloat(((ac / tc) * 100).toFixed(1)) : 0,
            totalDrivers: td,
            activeDrivers: ad,
            inactiveDrivers: td - ad,
            driverConversionRate: td > 0 ? parseFloat(((ad / td) * 100).toFixed(1)) : 0,
          },
        };
      }),

    getAssistanceVerifications: authProcedure
      .handler(async ({ context }) => {
        const agentId = context.user.id;
        const verifications = await db.select()
          .from(assistanceVerification)
          .where(eq(assistanceVerification.assistingAgentId, agentId))
          .orderBy(desc(assistanceVerification.createdAt))
          .limit(50);

        return { success: true, verifications };
      }),
  }),

  // Get agent wallet info
  wallet: os.router({
    getWallet: authProcedure
      .handler(async ({ context }) => {
        try {
          const userId = context.user.id;
          console.log('[Agent] wallet.getWallet called for user:', userId);

          // Verify user is an agent (already authenticated, just check role from context)
          if (context.user.role !== 'agent') {
            throw new Error('User is not an agent');
          }

          // Get wallet
          const agentWallet = await db.select()
            .from(wallet)
            .where(eq(wallet.userId, userId))
            .limit(1);

          if (agentWallet.length === 0) {
            // Create wallet if it doesn't exist
            const { randomUUID } = await import('crypto');
            await db.insert(wallet).values({
              id: randomUUID(),
              userId: userId,
              balance: '0',
              reservedBalance: '0',
              totalTopup: '0',
              totalWithdrawn: '0',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            return {
              success: true,
              wallet: {
                currentBalance: 0,
                pendingEarnings: 0,
                withdrawableAmount: 0,
                totalLifetimeEarnings: 0,
                lastPaymentDate: null,
              }
            };
          }

          const walletData = agentWallet[0];
          
          // Get last payment date
          const lastPayment = await db.select()
            .from(walletTransaction)
            .where(and(
              eq(walletTransaction.userId, userId),
              eq(walletTransaction.type, 'withdrawal'),
              eq(walletTransaction.status, 'completed')
            ))
            .orderBy(desc(walletTransaction.createdAt))
            .limit(1);

          return {
            success: true,
            wallet: {
              currentBalance: parseFloat(walletData.balance),
              pendingEarnings: parseFloat(walletData.reservedBalance),
              withdrawableAmount: parseFloat(walletData.balance),
              totalLifetimeEarnings: parseFloat(walletData.totalTopup),
              lastPaymentDate: lastPayment[0]?.createdAt || null,
            }
          };
        } catch (error) {
          console.error('[Agent] Error getting wallet:', error);
          throw error;
        }
      }),

    getTransactions: authProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      }).optional())
      .handler(async ({ context, input }) => {
        try {
          const userId = context.user.id;
          console.log('[Agent] wallet.getTransactions called for user:', userId);

          const limit = input?.limit || 50;
          const offset = input?.offset || 0;

          // Get transactions
          const transactions = await db.select()
            .from(walletTransaction)
            .where(eq(walletTransaction.userId, userId))
            .orderBy(desc(walletTransaction.createdAt))
            .limit(limit)
            .offset(offset);

          return {
            success: true,
            transactions: transactions.map(t => ({
              id: t.id,
              type: t.type,
              amount: parseFloat(t.amount),
              description: t.description || '',
              status: t.status,
              createdAt: t.createdAt,
            }))
          };
        } catch (error) {
          console.error('[Agent] Error getting transactions:', error);
          throw error;
        }
      }),
  }),

  completeOnboarding: authProcedure
    .input(z.object({
      name: z.string(),
      nationalId: z.string().optional(),
      idCardFrontId: z.string(),
      idCardBackId: z.string(),
      gender: z.string().optional(),
      agentType: z.enum(['paid_agent', 'field_agent', 'verification_agent']).optional().default('field_agent'),
      assignedCity: z.string().optional(),
      assignedTown: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
    }))
    .handler(async ({ context, input }) => {
      try {
        const userId = context.user.id;
        console.log('[Agent] completeOnboarding called for user:', userId);

        const existingUser = await db.query.user.findFirst({
          where: eq(user.id, userId),
        });

        if (!existingUser) {
          throw new Error('User not found');
        }

        if (existingUser.role !== 'unknown' && existingUser.role !== 'agent') {
          throw new Error('User is not eligible for agent onboarding');
        }

        // Update user to pending agent status
        await db.update(user)
          .set({
            role: 'agent',
            accountStatus: 'pending',
            name: input.name,
            rejectionReason: null,
            rejectedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(user.id, userId));

        // Find or create agent profile
        const existingProfile = await db.query.agentProfile.findFirst({
          where: eq(agentProfile.userId, userId),
        });

        const { randomUUID } = await import('crypto');

        if (existingProfile) {
          await db.update(agentProfile)
            .set({
              nationalId: input.nationalId || null,
              idCardFrontId: input.idCardFrontId,
              idCardBackId: input.idCardBackId,
              gender: input.gender || null,
              agentType: input.agentType,
              assignedCity: input.assignedCity || null,
              assignedTown: input.assignedTown || null,
              latitude: input.latitude || null,
              longitude: input.longitude || null,
              updatedAt: new Date(),
            })
            .where(eq(agentProfile.userId, userId));
        } else {
          await db.insert(agentProfile).values({
            id: randomUUID(),
            userId: userId,
            nationalId: input.nationalId || null,
            idCardFrontId: input.idCardFrontId,
            idCardBackId: input.idCardBackId,
            gender: input.gender || null,
            agentType: input.agentType,
            assignedCity: input.assignedCity || null,
            assignedTown: input.assignedTown || null,
            latitude: input.latitude || null,
            longitude: input.longitude || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        // Create wallet if not exists
        const existingWallet = await db.query.wallet.findFirst({
          where: eq(wallet.userId, userId),
        });

        if (!existingWallet) {
          await db.insert(wallet).values({
            id: randomUUID(),
            userId: userId,
            balance: '0.00',
            reservedBalance: '0.00',
            totalTopup: '0.00',
            totalWithdrawn: '0.00',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return { success: true };
      } catch (error) {
        console.error('[Agent] Error completing onboarding:', error);
        throw error;
      }
    }),

  // Public self-registration for agents (no auth required)
  // Modeled after admin.agents.create but sets status to 'pending'
  selfRegister: os.handler(async (ctx) => {
    const input = z.object({
      name: z.string().min(1),
      phone: z.string().min(1),
      password: z.string().min(6),
      email: z.string().email().optional(),
      nationalId: z.string().optional(),
      gender: z.string().optional(),
      agentType: z.enum(['paid_agent', 'field_agent', 'verification_agent']).optional().default('field_agent'),
      assignedCity: z.string().optional(),
      assignedTown: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      idCardFrontId: z.string(),
      idCardBackId: z.string(),
      profilePhotoId: z.string().optional(),
    }).parse(ctx.input);

    try {
      console.log('[Agent] selfRegister called with phone:', input.phone);

      // Import auth lazily to avoid circular deps
      const { auth } = await import('../utils/auth.js');

      // Create user through Better Auth (same as admin.agents.create)
      const result = await (auth.api as any).createUser({
        body: {
          email: input.email || `${input.phone}@agent.mytruck.com`,
          password: input.password,
          name: input.name,
          role: 'agent',
          emailVerified: input.email ? false : true,
        }
      });

      if (!result?.user?.id) {
        throw new Error('Failed to create agent account');
      }

      const userId = result.user.id;
      console.log('[Agent] User created via Better Auth with ID:', userId);

      // Update user with phone number and set to PENDING (needs admin approval)
      const userUpdate: any = {
        phoneNumber: input.phone,
        phoneNumberVerified: true,
        accountStatus: accountStatus.PENDING,
        updatedAt: new Date(),
      };
      if (input.profilePhotoId) userUpdate.image = input.profilePhotoId;
      await db.update(user)
        .set(userUpdate)
        .where(eq(user.id, userId));
      console.log('[Agent] User phone and pending status set');

      // Create agent profile with all fields
      const { randomUUID } = await import('crypto');
      const profileId = randomUUID();

      await db.insert(agentProfile).values({
        id: profileId,
        userId: userId,
        nationalId: input.nationalId || null,
        gender: input.gender || null,
        agentType: input.agentType,
        assignedCity: input.assignedCity || null,
        assignedTown: input.assignedTown || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        idCardFrontId: input.idCardFrontId,
        idCardBackId: input.idCardBackId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('[Agent] Agent profile created');

      // Create wallet
      const walletId = randomUUID();
      await db.insert(wallet).values({
        id: walletId,
        userId: userId,
        balance: '0.00',
        reservedBalance: '0.00',
        totalTopup: '0.00',
        totalWithdrawn: '0.00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('[Agent] Wallet created');

      console.log('[Agent] Self-registration completed for userId:', userId);
      return { success: true, message: 'Registration submitted. Pending admin approval.' };
    } catch (error: any) {
      console.error('[Agent] Error in selfRegister:', error);
      // Provide user-friendly messages for common errors
      if (error?.message?.includes('already exists') || error?.message?.includes('duplicate')) {
        throw new Error('An account with this phone number already exists. Please sign in instead.');
      }
      throw error;
    }
  }),

  // Get agent's current tier and progress
  getTier: authProcedure
    .handler(async ({ context }) => {
      try {
        const { evaluateAgentTier } = await import('../services/tier.js');
        const result = await evaluateAgentTier(context.user.id);
        return { success: true, ...result };
      } catch (error) {
        console.error('[Agent] Error getting tier:', error);
        throw error;
      }
    }),
})