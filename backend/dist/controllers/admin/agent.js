import { z } from 'zod';
import { os, ORPCError } from '@orpc/server';
import { adminProcedure } from '../../middlewares/auth-admin.js';
import { authProcedure } from '../../middlewares/auth.js';
import { db } from '../../database/db.js';
import { user, account } from '../../database/schema/auth-schema.js';
import { agentProfile } from '../../database/schema/agent-schema.js';
import { townManager } from '../../database/schema/manager-schema.js';
import { wallet } from '../../database/schema/wallet-schema.js';
import { order } from '../../database/schema/order-schema.js';
import { commissionHistory } from '../../database/schema/commission-schema.js';
import { eq, and, or, desc, sql, count, gte, isNotNull } from 'drizzle-orm';
import { auth } from '../../utils/auth.js';
console.log('[Admin Agent Controller] Loading agent controller...');
export const adminAgentController = os.router({
    // List all agents (admin sees all, manager sees filtered by territory)
    list: authProcedure
        .input(z.object({
        search: z.string().optional(),
    }).optional())
        .handler(async ({ context }) => {
        try {
            console.log('[Agent] agents.list called, role:', context.role);
            const baseQuery = db.select({
                id: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                email: user.email,
                accountStatus: user.accountStatus,
                createdAt: user.createdAt,
                image: user.image,
                rejectionReason: user.rejectionReason,
                nationalId: agentProfile.nationalId,
                gender: agentProfile.gender,
                agentType: agentProfile.agentType,
                assignedCity: agentProfile.assignedCity,
                assignedTown: agentProfile.assignedTown,
                assignedTownManager: agentProfile.assignedTownManager,
                latitude: agentProfile.latitude,
                longitude: agentProfile.longitude,
                idCardFrontId: agentProfile.idCardFrontId,
                idCardBackId: agentProfile.idCardBackId,
            })
                .from(user)
                .leftJoin(agentProfile, eq(user.id, agentProfile.userId));
            if (context.role === 'admin' || context.role === 'call_center') {
                const agents = await baseQuery.where(eq(user.role, 'agent'));
                console.log('[Agent] Admin found agents:', agents.length);
                return { success: true, agents };
            }
            else if (context.role === 'town_manager') {
                const [manager] = await db
                    .select()
                    .from(townManager)
                    .where(eq(townManager.userId, context.user.id))
                    .limit(1);
                if (!manager) {
                    return { success: true, agents: [] };
                }
                const agents = await baseQuery.where(and(eq(user.role, 'agent'), or(sql `${agentProfile.assignedCity} LIKE ${'%' + manager.cityName + '%'}`, sql `${agentProfile.assignedTown} LIKE ${'%' + manager.townName + '%'}`)));
                console.log('[Agent] Manager found agents:', agents.length);
                return { success: true, agents, manager: { townName: manager.townName, cityName: manager.cityName, region: manager.region } };
            }
            else {
                throw new ORPCError('FORBIDDEN', { message: 'Access denied' });
            }
        }
        catch (error) {
            console.error('[Agent] Error listing agents:', error);
            throw error;
        }
    }),
    // Create new agent
    create: adminProcedure
        .input(z.object({
        name: z.string().min(1),
        phone: z.string().min(1),
        email: z.string().email().optional(),
        password: z.string().min(6),
        nationalId: z.string().optional(),
        gender: z.string().optional(),
        assignedCity: z.string().optional(),
        assignedTown: z.string().optional(),
        assignedTownManager: z.string().optional(),
        agentType: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        idCardFrontId: z.string().optional(),
        idCardBackId: z.string().optional(),
        profilePhotoId: z.string().optional(),
    }))
        .handler(async ({ input }) => {
        try {
            console.log('[Admin] agents.create called with input:', JSON.stringify(input, null, 2));
            // Check if phone number is already taken
            const existingPhone = await db.query.user.findFirst({
                where: eq(user.phoneNumber, input.phone),
            });
            if (existingPhone) {
                throw new ORPCError('BAD_REQUEST', { message: 'This phone number is already registered. Please use a different phone number.' });
            }
            // Create user through Better Auth
            const result = await auth.api.createUser({
                body: {
                    email: input.email || `${input.phone}@agent.mytruck.com`,
                    password: input.password,
                    name: input.name,
                    role: 'agent',
                    emailVerified: input.email ? false : true, // Auto-verify if no email provided
                }
            });
            if (!result?.user?.id) {
                throw new Error('Failed to create user through Better Auth');
            }
            const userId = result.user.id;
            console.log('[Admin] User created via Better Auth with ID:', userId);
            try {
                // Update user with phone number, verification status, and profile photo
                const userUpdate = {
                    phoneNumber: input.phone,
                    phoneNumberVerified: true,
                    accountStatus: 'active',
                    updatedAt: new Date(),
                };
                if (input.profilePhotoId)
                    userUpdate.image = input.profilePhotoId;
                await db.update(user)
                    .set(userUpdate)
                    .where(eq(user.id, userId));
                console.log('[Admin] User phone number and status updated');
                // Create agent profile with additional fields
                const { randomUUID } = await import('crypto');
                const profileId = randomUUID();
                await db.insert(agentProfile).values({
                    id: profileId,
                    userId: userId,
                    nationalId: input.nationalId || null,
                    gender: input.gender || null,
                    agentType: input.agentType || null,
                    assignedCity: input.assignedCity || null,
                    assignedTown: input.assignedTown || null,
                    assignedTownManager: input.assignedTownManager || null,
                    latitude: input.latitude || null,
                    longitude: input.longitude || null,
                    idCardFrontId: input.idCardFrontId || null,
                    idCardBackId: input.idCardBackId || null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                console.log('[Admin] Agent profile created successfully');
                // Create wallet for the agent
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
                console.log('[Admin] Wallet created successfully for agent');
            }
            catch (dbError) {
                // DB operation failed - clean up the Better Auth user to avoid orphans
                console.error('[Admin] DB operation failed, cleaning up Better Auth user:', dbError);
                try {
                    await auth.api.deleteUser?.({ body: { userId } });
                }
                catch (cleanupError) {
                    console.error('[Admin] Failed to clean up Better Auth user:', cleanupError);
                }
                throw dbError;
            }
            console.log('[Admin] Agent created successfully with userId:', userId);
            return { success: true, message: 'Agent created successfully', agentId: userId };
        }
        catch (error) {
            console.error('[Admin] Error creating agent:', error);
            // Provide clear messages for common errors
            if (error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062) {
                throw new ORPCError('BAD_REQUEST', { message: 'This phone number is already registered. Please use a different phone number.' });
            }
            const errMsg = error?.body?.message || error?.message || 'Failed to create agent';
            throw new ORPCError('BAD_REQUEST', { message: errMsg });
        }
    }),
    // Update agent
    update: adminProcedure
        .input(z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        phone: z.string().min(1).optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
        nationalId: z.string().optional(),
        gender: z.string().optional(),
        assignedCity: z.string().optional(),
        assignedTown: z.string().optional(),
        assignedTownManager: z.string().optional(),
        agentType: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        idCardFrontId: z.string().optional(),
        idCardBackId: z.string().optional(),
        profilePhotoId: z.string().optional(),
    }))
        .handler(async ({ input }) => {
        try {
            console.log('[Admin] agents.update called:', input.id);
            const { id, password, nationalId, gender, assignedCity, assignedTown, assignedTownManager, agentType, latitude, longitude, idCardFrontId, idCardBackId, profilePhotoId, ...updateData } = input;
            // Update user record using Drizzle
            const userUpdate = {};
            if (updateData.name)
                userUpdate.name = updateData.name;
            if (updateData.phone)
                userUpdate.phoneNumber = updateData.phone;
            if (updateData.email !== undefined)
                userUpdate.email = updateData.email || null;
            if (profilePhotoId !== undefined)
                userUpdate.image = profilePhotoId || null;
            userUpdate.updatedAt = new Date();
            await db.update(user)
                .set(userUpdate)
                .where(eq(user.id, id));
            console.log('[Admin] User record updated');
            // Update password if provided using Better Auth
            if (password) {
                try {
                    await auth.api.updatePassword({
                        body: {
                            userId: id,
                            password: password,
                        }
                    });
                    console.log('[Admin] Password updated via Better Auth');
                }
                catch (error) {
                    console.error('[Admin] Failed to update password via Better Auth, falling back to direct update:', error);
                    // Fallback: update password directly in account table
                    const { hashPassword } = await import('../../utils/password.js');
                    const hashedPassword = await hashPassword(password);
                    await db.update(account)
                        .set({
                        password: hashedPassword,
                        updatedAt: new Date(),
                    })
                        .where(eq(account.userId, id));
                    console.log('[Admin] Password updated via fallback method');
                }
            }
            // Update agent profile using Drizzle
            const profileUpdate = {
                updatedAt: new Date(),
            };
            if (nationalId !== undefined)
                profileUpdate.nationalId = nationalId || null;
            if (gender !== undefined)
                profileUpdate.gender = gender || null;
            if (agentType !== undefined)
                profileUpdate.agentType = agentType || null;
            if (assignedCity !== undefined)
                profileUpdate.assignedCity = assignedCity || null;
            if (assignedTown !== undefined)
                profileUpdate.assignedTown = assignedTown || null;
            if (assignedTownManager !== undefined)
                profileUpdate.assignedTownManager = assignedTownManager || null;
            if (latitude !== undefined)
                profileUpdate.latitude = latitude || null;
            if (longitude !== undefined)
                profileUpdate.longitude = longitude || null;
            if (idCardFrontId !== undefined)
                profileUpdate.idCardFrontId = idCardFrontId || null;
            if (idCardBackId !== undefined)
                profileUpdate.idCardBackId = idCardBackId || null;
            // Check if profile exists
            const existingProfile = await db.select()
                .from(agentProfile)
                .where(eq(agentProfile.userId, id))
                .limit(1);
            if (existingProfile.length > 0) {
                // Update existing profile
                await db.update(agentProfile)
                    .set(profileUpdate)
                    .where(eq(agentProfile.userId, id));
                console.log('[Admin] Agent profile updated');
            }
            else {
                // Create new profile
                const { randomUUID } = await import('crypto');
                await db.insert(agentProfile).values({
                    id: randomUUID(),
                    userId: id,
                    ...profileUpdate,
                    createdAt: new Date(),
                });
                console.log('[Admin] Agent profile created');
            }
            console.log('[Admin] Agent updated successfully:', id);
            return { success: true, message: 'Agent updated successfully' };
        }
        catch (error) {
            console.error('[Admin] Error updating agent:', error);
            const errMsg = error?.body?.message || error?.message || 'Failed to update agent';
            throw new ORPCError('BAD_REQUEST', { message: errMsg });
        }
    }),
    // Update agent status
    updateStatus: adminProcedure
        .input(z.object({
        id: z.string(),
        status: z.enum(['active', 'suspended', 'pending', 'rejected']),
    }))
        .handler(async ({ input }) => {
        try {
            console.log('[Admin] agents.updateStatus called:', input.id, input.status);
            const updateFields = {
                accountStatus: input.status,
                updatedAt: new Date(),
            };
            // Clear rejection fields when approving
            if (input.status === 'active') {
                updateFields.rejectionReason = null;
                updateFields.rejectedAt = null;
            }
            await db.update(user)
                .set(updateFields)
                .where(eq(user.id, input.id));
            console.log('[Admin] Agent status updated successfully:', input.id);
            return { success: true, message: 'Agent status updated successfully' };
        }
        catch (error) {
            console.error('[Admin] Error updating agent status:', error);
            throw error;
        }
    }),
    // Reject agent with reason
    rejectAgent: adminProcedure
        .input(z.object({
        agentId: z.string(),
        reason: z.string().min(1),
    }))
        .handler(async ({ input }) => {
        try {
            console.log('[Admin] agents.rejectAgent called:', input.agentId);
            await db.update(user)
                .set({
                accountStatus: 'rejected',
                rejectionReason: input.reason,
                rejectedAt: new Date(),
                updatedAt: new Date(),
            })
                .where(eq(user.id, input.agentId));
            console.log('[Admin] Agent rejected successfully:', input.agentId);
            return { success: true, message: 'Agent rejected successfully' };
        }
        catch (error) {
            console.error('[Admin] Error rejecting agent:', error);
            throw error;
        }
    }),
    // Get agent performance stats (orders, commissions)
    getPerformance: adminProcedure
        .input(z.object({
        agentId: z.string(),
    }))
        .handler(async ({ input }) => {
        try {
            console.log('[Admin] agents.getPerformance called:', input.agentId);
            const [agentData] = await db.select({
                id: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                assignedCity: agentProfile.assignedCity,
                assignedTown: agentProfile.assignedTown,
                accountStatus: user.accountStatus,
            })
                .from(user)
                .leftJoin(agentProfile, eq(user.id, agentProfile.userId))
                .where(eq(user.id, input.agentId))
                .limit(1);
            if (!agentData) {
                return { success: true, agent: null, stats: null, commissions: null, recentJobs: [] };
            }
            // Order stats
            const totalOrders = await db.select({ count: count() })
                .from(order)
                .where(eq(order.agentId, input.agentId));
            const completedOrders = await db.select({ count: count() })
                .from(order)
                .where(and(eq(order.agentId, input.agentId), eq(order.status, 'completed')));
            const pendingOrders = await db.select({ count: count() })
                .from(order)
                .where(and(eq(order.agentId, input.agentId), sql `${order.status} IN ('pending_approval', 'approved', 'has_offers', 'assigned', 'on_the_way', 'delivered')`));
            const rejectedOrders = await db.select({ count: count() })
                .from(order)
                .where(and(eq(order.agentId, input.agentId), eq(order.status, 'rejected')));
            // Commission stats
            const totalCommissions = await db.select({ total: sql `COALESCE(SUM(${commissionHistory.payoutAmount}), 0)` })
                .from(commissionHistory)
                .where(eq(commissionHistory.agentId, input.agentId));
            const userCommissions = await db.select({ total: sql `COALESCE(SUM(${commissionHistory.payoutAmount}), 0)` })
                .from(commissionHistory)
                .where(and(eq(commissionHistory.agentId, input.agentId), eq(commissionHistory.commissionType, 'user')));
            const driverCommissions = await db.select({ total: sql `COALESCE(SUM(${commissionHistory.payoutAmount}), 0)` })
                .from(commissionHistory)
                .where(and(eq(commissionHistory.agentId, input.agentId), eq(commissionHistory.commissionType, 'driver')));
            const assistedCommissions = await db.select({ total: sql `COALESCE(SUM(${commissionHistory.payoutAmount}), 0)` })
                .from(commissionHistory)
                .where(and(eq(commissionHistory.agentId, input.agentId), eq(commissionHistory.commissionType, 'assisted')));
            // Recent jobs
            const recentJobs = await db.select({
                id: order.id,
                status: order.status,
                finalPrice: order.finalPrice,
                createdAt: order.createdAt,
                completedAt: order.completedAt,
            })
                .from(order)
                .where(eq(order.agentId, input.agentId))
                .orderBy(desc(order.createdAt))
                .limit(20);
            return {
                success: true,
                agent: agentData,
                stats: {
                    totalOrders: totalOrders[0]?.count || 0,
                    completedOrders: completedOrders[0]?.count || 0,
                    pendingOrders: pendingOrders[0]?.count || 0,
                    rejectedOrders: rejectedOrders[0]?.count || 0,
                },
                commissions: {
                    totalEarnings: parseFloat(Number(totalCommissions[0]?.total || 0).toFixed(2)),
                    userCommissions: parseFloat(Number(userCommissions[0]?.total || 0).toFixed(2)),
                    driverCommissions: parseFloat(Number(driverCommissions[0]?.total || 0).toFixed(2)),
                    assistedCommissions: parseFloat(Number(assistedCommissions[0]?.total || 0).toFixed(2)),
                },
                recentJobs: recentJobs.map(j => ({
                    ...j,
                    finalPrice: j.finalPrice ? parseFloat(j.finalPrice) : null,
                })),
            };
        }
        catch (error) {
            console.error('[Admin] Error getting agent performance:', error);
            throw error;
        }
    }),
    // Get all agents with map coordinates (admin sees all, manager sees filtered)
    getMapData: authProcedure
        .handler(async ({ context }) => {
        try {
            console.log('[Admin] agents.getMapData called, role:', context.role);
            if (context.role !== 'admin' && context.role !== 'call_center' && context.role !== 'town_manager') {
                throw new ORPCError('FORBIDDEN', { message: 'Access denied' });
            }
            const baseQuery = db.select({
                id: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                latitude: agentProfile.latitude,
                longitude: agentProfile.longitude,
                assignedCity: agentProfile.assignedCity,
                assignedTown: agentProfile.assignedTown,
                accountStatus: user.accountStatus,
                agentType: agentProfile.agentType,
            })
                .from(user)
                .leftJoin(agentProfile, eq(user.id, agentProfile.userId));
            if (context.role === 'town_manager') {
                const [manager] = await db
                    .select()
                    .from(townManager)
                    .where(eq(townManager.userId, context.user.id))
                    .limit(1);
                if (!manager) {
                    return { success: true, agents: [] };
                }
                const agents = await baseQuery.where(and(eq(user.role, 'agent'), or(sql `${agentProfile.assignedCity} LIKE ${'%' + manager.cityName + '%'}`, sql `${agentProfile.assignedTown} LIKE ${'%' + manager.townName + '%'}`), sql `${agentProfile.latitude} IS NOT NULL AND ${agentProfile.longitude} IS NOT NULL`));
                return { success: true, agents };
            }
            const agents = await baseQuery.where(and(eq(user.role, 'agent'), sql `${agentProfile.latitude} IS NOT NULL AND ${agentProfile.longitude} IS NOT NULL`));
            return { success: true, agents };
        }
        catch (error) {
            console.error('[Admin] Error getting agent map data:', error);
            throw error;
        }
    }),
    // Update agent location (city, town, lat, lng)
    updateLocation: authProcedure
        .input(z.object({
        id: z.string(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        assignedCity: z.string().optional(),
        assignedTown: z.string().optional(),
    }))
        .handler(async ({ input, context }) => {
        try {
            if (context.role !== 'admin' && context.role !== 'call_center' && context.role !== 'town_manager') {
                throw new ORPCError('FORBIDDEN', { message: 'Access denied' });
            }
            console.log('[Admin] agents.updateLocation called:', input.id, 'by', context.role);
            const profileUpdate = { updatedAt: new Date() };
            if (input.latitude !== undefined)
                profileUpdate.latitude = input.latitude || null;
            if (input.longitude !== undefined)
                profileUpdate.longitude = input.longitude || null;
            if (input.assignedCity !== undefined)
                profileUpdate.assignedCity = input.assignedCity || null;
            if (input.assignedTown !== undefined)
                profileUpdate.assignedTown = input.assignedTown || null;
            const existingProfile = await db.select()
                .from(agentProfile)
                .where(eq(agentProfile.userId, input.id))
                .limit(1);
            if (existingProfile.length > 0) {
                await db.update(agentProfile)
                    .set(profileUpdate)
                    .where(eq(agentProfile.userId, input.id));
            }
            else {
                const { randomUUID } = await import('crypto');
                await db.insert(agentProfile).values({
                    id: randomUUID(),
                    userId: input.id,
                    ...profileUpdate,
                    createdAt: new Date(),
                });
            }
            return { success: true, message: 'Agent location updated successfully' };
        }
        catch (error) {
            console.error('[Admin] Error updating agent location:', error);
            throw error;
        }
    }),
    // Get agent analytics (reliability, top/low performers, late deliveries, trends)
    getAnalytics: adminProcedure
        .handler(async () => {
        try {
            console.log('[Admin] agents.getAnalytics called');
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
            // Per-agent reliability scores from finalized orders
            const agentStats = await db
                .select({
                agentId: order.agentId,
                agentName: sql `${user.name}`,
                totalOrders: count(),
                completedOrders: sql `SUM(CASE WHEN ${order.status} = 'completed' THEN 1 ELSE 0 END)`,
                rejectedOrders: sql `SUM(CASE WHEN ${order.status} = 'rejected' THEN 1 ELSE 0 END)`,
                cancelledOrders: sql `SUM(CASE WHEN ${order.status} = 'cancelled' THEN 1 ELSE 0 END)`,
                lateDeliveries: sql `SUM(CASE WHEN ${order.deliveredAt} IS NOT NULL AND ${order.assignedAt} IS NOT NULL AND TIMESTAMPDIFF(HOUR, ${order.assignedAt}, ${order.deliveredAt}) > 4 THEN 1 ELSE 0 END)`,
            })
                .from(order)
                .leftJoin(user, eq(order.agentId, user.id))
                .where(and(isNotNull(order.agentId), sql `${order.status} NOT IN ('pending_approval', 'approved', 'has_offers', 'assigned', 'on_the_way', 'delivered')`))
                .groupBy(order.agentId, user.name)
                .orderBy(desc(sql `SUM(CASE WHEN ${order.status} = 'completed' THEN 1 ELSE 0 END)`));
            const agentsWithReliability = agentStats.map(a => {
                const total = Number(a.totalOrders);
                const completed = Number(a.completedOrders);
                const reliability = total > 0 ? (completed / total) * 100 : 0;
                return {
                    agentId: a.agentId,
                    agentName: a.agentName,
                    totalOrders: total,
                    completedOrders: completed,
                    rejectedOrders: Number(a.rejectedOrders),
                    cancelledOrders: Number(a.cancelledOrders),
                    lateDeliveries: Number(a.lateDeliveries),
                    reliability: parseFloat(reliability.toFixed(1)),
                };
            });
            // Top 10 agents by reliability (with at least 3 finalized orders)
            const topAgents = [...agentsWithReliability]
                .filter(a => a.totalOrders >= 3)
                .sort((a, b) => b.reliability - a.reliability)
                .slice(0, 10);
            // Lowest 10 agents by reliability (with at least 3 finalized orders)
            const lowestAgents = [...agentsWithReliability]
                .filter(a => a.totalOrders >= 3)
                .sort((a, b) => a.reliability - b.reliability)
                .slice(0, 10);
            // Overall stats
            const totalAgentsWithOrders = agentsWithReliability.length;
            const avgReliability = totalAgentsWithOrders > 0
                ? parseFloat((agentsWithReliability.reduce((s, a) => s + a.reliability, 0) / totalAgentsWithOrders).toFixed(1))
                : 0;
            const totalLateDeliveries = agentsWithReliability.reduce((s, a) => s + a.lateDeliveries, 0);
            const totalCompleted = agentsWithReliability.reduce((s, a) => s + a.completedOrders, 0);
            // Reliability trends (monthly for past 12 months)
            const monthlyTrends = await db
                .select({
                month: sql `DATE_FORMAT(${order.createdAt}, '%Y-%m')`,
                totalOrders: count(),
                completedOrders: sql `SUM(CASE WHEN ${order.status} = 'completed' THEN 1 ELSE 0 END)`,
            })
                .from(order)
                .where(and(isNotNull(order.agentId), gte(order.createdAt, twelveMonthsAgo), sql `${order.status} NOT IN ('pending_approval', 'approved', 'has_offers', 'assigned', 'on_the_way', 'delivered')`))
                .groupBy(sql `DATE_FORMAT(${order.createdAt}, '%Y-%m')`)
                .orderBy(sql `DATE_FORMAT(${order.createdAt}, '%Y-%m')`);
            const reliabilityTrends = monthlyTrends.map(m => ({
                month: m.month,
                totalOrders: Number(m.totalOrders),
                completedOrders: Number(m.completedOrders),
                reliability: Number(m.totalOrders) > 0
                    ? parseFloat(((Number(m.completedOrders) / Number(m.totalOrders)) * 100).toFixed(1))
                    : 0,
            }));
            return {
                success: true,
                stats: {
                    totalAgents: totalAgentsWithOrders,
                    avgReliability,
                    totalLateDeliveries,
                    totalCompleted,
                },
                topAgents,
                lowestAgents,
                allAgents: agentsWithReliability,
                reliabilityTrends,
            };
        }
        catch (error) {
            console.error('[Admin] Error getting agent analytics:', error);
            throw error;
        }
    }),
    // Get conversion stats per agent (registered users vs active users)
    getConversionStats: adminProcedure
        .handler(async () => {
        try {
            console.log('[Admin] agents.getConversionStats called');
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
            // Per-agent conversion stats using raw SQL for subqueries
            const [agentStats] = await db.execute(sql `
          SELECT
            a.id AS agent_id,
            a.name AS agent_name,
            COALESCE(stats.total_registered, 0) AS total_registered,
            COALESCE(stats.total_drivers, 0) AS total_drivers,
            COALESCE(stats.active_users, 0) AS active_users,
            COALESCE(stats.active_drivers, 0) AS active_drivers,
            COALESCE(stats.inactive_users, 0) AS inactive_users
          FROM user a
          LEFT JOIN (
            SELECT
              u.registered_by_agent_id,
              COUNT(DISTINCT u.id) AS total_registered,
              COUNT(DISTINCT CASE WHEN u.role = 'driver' THEN u.id END) AS total_drivers,
              COUNT(DISTINCT CASE WHEN o.customer_id IS NOT NULL THEN u.id END) AS active_users,
              COUNT(DISTINCT CASE WHEN od.driver_id IS NOT NULL THEN u.id END) AS active_drivers,
              COUNT(DISTINCT CASE WHEN o.customer_id IS NULL THEN u.id END) AS inactive_users
            FROM user u
            LEFT JOIN \`order\` o ON o.customer_id = u.id
            LEFT JOIN \`order\` od ON od.driver_id = u.id AND od.status = 'completed'
            WHERE u.registered_by_agent_id IS NOT NULL
            GROUP BY u.registered_by_agent_id
          ) stats ON stats.registered_by_agent_id = a.id
          WHERE a.role = 'agent'
          ORDER BY COALESCE(stats.total_registered, 0) DESC
        `);
            const agents = agentStats?.map((r) => ({
                agentId: r.agent_id,
                agentName: r.agent_name,
                totalRegistered: Number(r.total_registered),
                totalDrivers: Number(r.total_drivers),
                activeUsers: Number(r.active_users),
                activeDrivers: Number(r.active_drivers),
                inactiveUsers: Number(r.inactive_users),
                userConversionRate: Number(r.total_registered) > 0
                    ? parseFloat(((Number(r.active_users) / Number(r.total_registered)) * 100).toFixed(1))
                    : 0,
                driverConversionRate: Number(r.total_drivers) > 0
                    ? parseFloat(((Number(r.active_drivers) / Number(r.total_drivers)) * 100).toFixed(1))
                    : 0,
            })) || [];
            // Overall stats
            const overall = {
                totalRegistered: agents.reduce((s, a) => s + a.totalRegistered, 0),
                totalActiveUsers: agents.reduce((s, a) => s + a.activeUsers, 0),
                totalDrivers: agents.reduce((s, a) => s + a.totalDrivers, 0),
                totalActiveDrivers: agents.reduce((s, a) => s + a.activeDrivers, 0),
                totalInactive: agents.reduce((s, a) => s + a.inactiveUsers, 0),
                overallConversion: 0,
            };
            overall.overallConversion = overall.totalRegistered > 0
                ? parseFloat(((overall.totalActiveUsers / overall.totalRegistered) * 100).toFixed(1))
                : 0;
            // Monthly trends: registrations vs first orders
            const [monthlyTrends] = await db.execute(sql `
          SELECT
            DATE_FORMAT(u.created_at, '%Y-%m') AS month,
            COUNT(DISTINCT u.id) AS new_registrations,
            COUNT(DISTINCT o.id) AS first_orders
          FROM user u
          LEFT JOIN \`order\` o ON o.customer_id = u.id
            AND o.created_at = (
              SELECT MIN(o2.created_at)
              FROM \`order\` o2
              WHERE o2.customer_id = u.id
            )
          WHERE u.registered_by_agent_id IS NOT NULL
            AND u.created_at >= ${twelveMonthsAgo}
          GROUP BY DATE_FORMAT(u.created_at, '%Y-%m')
          ORDER BY month
        `);
            const trends = monthlyTrends?.map((r) => ({
                month: r.month,
                newRegistrations: Number(r.new_registrations),
                firstOrders: Number(r.first_orders),
                conversionRate: Number(r.new_registrations) > 0
                    ? parseFloat(((Number(r.first_orders) / Number(r.new_registrations)) * 100).toFixed(1))
                    : 0,
            })) || [];
            return {
                success: true,
                overall,
                agents,
                trends,
            };
        }
        catch (error) {
            console.error('[Admin] Error getting conversion stats:', error);
            throw error;
        }
    }),
    // Get tier breakdown for all agents
    getTierBreakdown: adminProcedure
        .handler(async () => {
        try {
            console.log('[Admin] getTierBreakdown: starting');
            let tierModule;
            try {
                tierModule = await import('../../services/tier.js');
                console.log('[Admin] getTierBreakdown: module loaded successfully');
            }
            catch (importError) {
                console.error('[Admin] getTierBreakdown: FAILED TO IMPORT tier module:', importError?.message, importError?.stack);
                throw new ORPCError('INTERNAL_SERVER_ERROR', { message: `Failed to load tier service: ${importError?.message}` });
            }
            const result = await tierModule.getTierBreakdown();
            console.log('[Admin] getTierBreakdown: completed, agents:', result.allAgents?.length);
            return { success: true, ...result };
        }
        catch (error) {
            console.error('[Admin] Error getting tier breakdown:', {
                message: error?.message,
                stack: error?.stack,
                code: error?.code,
                errno: error?.errno,
                sqlMessage: error?.sqlMessage,
                sql: error?.sql,
            });
            throw error;
        }
    }),
    // Recalculate tiers for all agents
    recalculateTiers: adminProcedure
        .handler(async () => {
        try {
            const { recalculateAllTiers } = await import('../../services/tier.js');
            const result = await recalculateAllTiers();
            return { success: true, ...result };
        }
        catch (error) {
            console.error('[Admin] Error recalculating tiers:', error);
            throw error;
        }
    }),
});
console.log('[Admin Agent Controller] Agent controller created successfully');
//# sourceMappingURL=agent.js.map