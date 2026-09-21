import { os } from '@orpc/server';
import { z } from 'zod';
import { authProcedure } from '../middlewares/auth.js';
import { db } from '../database/db.js';
import { townManager } from '../database/schema/manager-schema.js';
import { eq, sql } from 'drizzle-orm';
import { approveAgent, suspendAgent, assignTerritory, } from '../services/manager.js';
import { logger } from '../utils/logger.js';
/**
 * Get current manager's profile (townManager record)
 */
const getMyProfile = authProcedure.handler(async ({ context }) => {
    try {
        const [profile] = await db
            .select()
            .from(townManager)
            .where(eq(townManager.userId, context.user.id))
            .limit(1);
        if (!profile) {
            return { success: false, message: 'Manager profile not found' };
        }
        return { success: true, data: profile };
    }
    catch (error) {
        logger.error('Failed to get manager profile:', { error });
        return { success: false, message: 'Failed to load profile' };
    }
});
/**
 * Approve an agent
 */
const approveAgentAction = authProcedure.handler(async ({ input, context }) => {
    const data = z
        .object({
        agentId: z.string().min(1),
        notes: z.string().optional(),
    })
        .parse(input);
    try {
        const managerId = context.user.id;
        const result = await approveAgent(managerId, data.agentId, data.notes);
        return result;
    }
    catch (error) {
        logger.error('Failed to approve agent:', { error });
        return {
            success: false,
            message: 'Failed to approve agent',
        };
    }
});
/**
 * Suspend an agent
 */
const suspendAgentAction = authProcedure.handler(async ({ input, context }) => {
    const data = z
        .object({
        agentId: z.string().min(1),
        reason: z.string().min(1),
    })
        .parse(input);
    try {
        const managerId = context.user.id;
        const result = await suspendAgent(managerId, data.agentId, data.reason);
        return result;
    }
    catch (error) {
        logger.error('Failed to suspend agent:', { error });
        return {
            success: false,
            message: 'Failed to suspend agent',
        };
    }
});
/**
 * Assign territory to agent
 */
const assignTerritoryAction = authProcedure.handler(async ({ input, context }) => {
    const data = z
        .object({
        agentId: z.string().min(1),
        areaName: z.string().min(1),
    })
        .parse(input);
    try {
        const managerId = context.user.id;
        const result = await assignTerritory(managerId, data.agentId, data.areaName);
        return result;
    }
    catch (error) {
        logger.error('Failed to assign territory:', { error });
        return {
            success: false,
            message: 'Failed to assign territory',
        };
    }
});
const getManagerStats = authProcedure.handler(async ({ context }) => {
    try {
        console.log('[Manager] getManagerStats called');
        // Get manager's profile
        const [profile] = await db
            .select()
            .from(townManager)
            .where(eq(townManager.userId, context.user.id))
            .limit(1);
        if (!profile) {
            return { success: false, message: 'Manager profile not found' };
        }
        // Query agents + their registered users/orders
        const [rows] = await db.execute(sql `
      SELECT
        ap.user_id,
        u.name AS agent_name,
        u.phone_number AS agent_phone,
        ap.assigned_city,
        ap.assigned_town,
        ap.tier,
        COALESCE(stats.total_registered, 0) AS total_registered,
        COALESCE(stats.total_drivers, 0) AS total_drivers,
        COALESCE(stats.active_users, 0) AS active_users,
        COALESCE(stats.active_drivers, 0) AS active_drivers,
        COALESCE(stats.completed_orders, 0) AS completed_orders,
        COALESCE(stats.total_revenue, 0) AS total_revenue
      FROM agent_profile ap
      LEFT JOIN \`user\` u ON u.id = ap.user_id
      LEFT JOIN (
        SELECT
          u2.registered_by_agent_id,
          COUNT(DISTINCT u2.id) AS total_registered,
          COUNT(DISTINCT CASE WHEN u2.role = 'driver' THEN u2.id END) AS total_drivers,
          COUNT(DISTINCT CASE WHEN o.customer_id IS NOT NULL THEN u2.id END) AS active_users,
          COUNT(DISTINCT CASE WHEN od.driver_id IS NOT NULL THEN u2.id END) AS active_drivers,
          COUNT(DISTINCT o.id) AS completed_orders,
          COALESCE(SUM(o.final_price), 0) AS total_revenue
        FROM \`user\` u2
        LEFT JOIN \`order\` o ON o.customer_id = u2.id AND o.status = 'completed'
        LEFT JOIN \`order\` od ON od.driver_id = u2.id AND od.status = 'completed'
        WHERE u2.registered_by_agent_id IS NOT NULL
        GROUP BY u2.registered_by_agent_id
      ) stats ON stats.registered_by_agent_id = ap.user_id
      WHERE (
        ap.assigned_city LIKE CONCAT('%', ${profile.cityName}, '%')
        OR ap.assigned_town LIKE CONCAT('%', ${profile.townName}, '%')
      )
      ORDER BY u.name
    `);
        const agentRows = Array.isArray(rows) ? rows : [];
        const agents = agentRows.map((r) => {
            const totalReg = Number(r.total_registered);
            const activeU = Number(r.active_users);
            return {
                agentId: r.user_id,
                agentName: r.agent_name || 'Unknown',
                agentPhone: r.agent_phone || '',
                assignedCity: r.assigned_city || '',
                assignedTown: r.assigned_town || '',
                tier: r.tier || 'new',
                totalRegistered: totalReg,
                totalDrivers: Number(r.total_drivers),
                activeUsers: activeU,
                activeDrivers: Number(r.active_drivers),
                completedOrders: Number(r.completed_orders),
                totalRevenue: Number(r.total_revenue),
                conversionRate: totalReg > 0
                    ? parseFloat(((activeU / totalReg) * 100).toFixed(1))
                    : 0,
            };
        });
        const totals = agents.reduce((acc, a) => ({
            totalAgents: acc.totalAgents + 1,
            totalRegistered: acc.totalRegistered + a.totalRegistered,
            totalActive: acc.totalActive + a.activeUsers,
            totalDrivers: acc.totalDrivers + a.totalDrivers,
            totalOrders: acc.totalOrders + a.completedOrders,
            totalRevenue: acc.totalRevenue + a.totalRevenue,
        }), {
            totalAgents: 0, totalRegistered: 0, totalActive: 0,
            totalDrivers: 0, totalOrders: 0, totalRevenue: 0,
        });
        return {
            success: true,
            profile: {
                townName: profile.townName,
                cityName: profile.cityName,
                region: profile.region,
                status: profile.status,
            },
            totals: {
                ...totals,
                totalRevenue: totals.totalRevenue.toFixed(2),
            },
            agents,
        };
    }
    catch (error) {
        logger.error('Failed to get manager stats:', { error });
        return { success: false, message: 'Failed to load dashboard stats' };
    }
});
export const managerRouter = os.router({
    dashboard: os.router({
        getMyProfile,
        getStats: getManagerStats,
    }),
    agents: os.router({
        approve: approveAgentAction,
        suspend: suspendAgentAction,
        assignTerritory: assignTerritoryAction,
    }),
});
//# sourceMappingURL=manager.js.map