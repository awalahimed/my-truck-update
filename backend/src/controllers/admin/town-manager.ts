import { z } from 'zod';
import { os, ORPCError } from '@orpc/server';
import { adminProcedure } from '../../middlewares/auth-admin.js';
import { db } from '../../database/db.js';
import { townManager } from '../../database/schema/manager-schema.js';
import { user } from '../../database/schema/auth-schema.js';
import { eq, sql } from 'drizzle-orm';

console.log('[Admin TownManager Controller] Loading...');

const getReport = adminProcedure
  .input(z.object({
    search: z.string().optional(),
  }).optional())
  .handler(async () => {
    try {
      console.log('[TownManager] getReport called');

      const [rows] = await db.execute(sql`
        SELECT
          tm.user_id,
          u.name AS manager_name,
          u.phone_number AS manager_phone,
          u.email AS manager_email,
          u.account_status AS manager_status,
          tm.town_name,
          tm.city_name,
          tm.region,
          tm.status AS manager_approval,
          COUNT(DISTINCT ap.user_id) AS agent_count,
          COUNT(DISTINCT reg_users.id) AS total_registered_users,
          COUNT(DISTINCT active_u.id) AS active_users,
          COUNT(DISTINCT driver_u.id) AS total_drivers,
          COUNT(DISTINCT completed_orders.id) AS total_orders,
          COALESCE(SUM(completed_orders.final_price), 0) AS total_revenue
        FROM town_manager tm
        LEFT JOIN \`user\` u ON u.id = tm.user_id
        LEFT JOIN agent_profile ap ON (
          ap.assigned_city LIKE CONCAT('%', tm.city_name, '%')
          OR ap.assigned_town LIKE CONCAT('%', tm.town_name, '%')
        )
        LEFT JOIN \`user\` reg_users ON reg_users.registered_by_agent_id = ap.user_id
        LEFT JOIN \`user\` driver_u ON driver_u.registered_by_agent_id = ap.user_id AND driver_u.role = 'driver'
        LEFT JOIN (
          SELECT DISTINCT o2.id, o2.customer_id, o2.final_price
          FROM \`order\` o2
          WHERE o2.status = 'completed'
        ) completed_orders ON completed_orders.customer_id = reg_users.id
        LEFT JOIN (
          SELECT DISTINCT u3.id
          FROM \`user\` u3
          INNER JOIN \`order\` o3 ON o3.customer_id = u3.id
        ) active_u ON active_u.id = reg_users.id
        GROUP BY tm.user_id
        ORDER BY tm.city_name, tm.town_name
      `) as any[];

      const rowArray = Array.isArray(rows) ? rows : [];

      const managers = rowArray.map((r: any) => {
        const totalReg = Number(r.total_registered_users);
        const active = Number(r.active_users);
        return {
          userId: r.user_id,
          name: r.manager_name || 'Unknown',
          phone: r.manager_phone || '',
          email: r.manager_email || '',
          status: r.manager_status || 'unknown',
          approvalStatus: r.manager_approval || 'pending',
          townName: r.town_name || '',
          cityName: r.city_name || '',
          region: r.region || '',
          agentCount: Number(r.agent_count),
          totalRegisteredUsers: totalReg,
          activeUsers: active,
          totalDrivers: Number(r.total_drivers),
          totalOrders: Number(r.total_orders),
          totalRevenue: Number(r.total_revenue).toFixed(2),
          conversionRate: totalReg > 0
            ? parseFloat(((active / totalReg) * 100).toFixed(1))
            : 0,
        };
      });

      // Overall stats
      const totals = managers.reduce((acc, m) => ({
        totalManagers: acc.totalManagers + 1,
        totalAgents: acc.totalAgents + m.agentCount,
        totalUsers: acc.totalUsers + m.totalRegisteredUsers,
        totalActive: acc.totalActive + m.activeUsers,
        totalDrivers: acc.totalDrivers + m.totalDrivers,
        totalOrders: acc.totalOrders + m.totalOrders,
        totalRevenue: acc.totalRevenue + parseFloat(m.totalRevenue),
      }), {
        totalManagers: 0, totalAgents: 0, totalUsers: 0,
        totalActive: 0, totalDrivers: 0, totalOrders: 0, totalRevenue: 0,
      });

      return {
        success: true,
        managers,
        totals: {
          ...totals,
          totalRevenue: totals.totalRevenue.toFixed(2),
        },
      };
    } catch (error) {
      console.error('[TownManager] Error getting report:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to fetch town manager report' });
    }
  });

const listByCity = adminProcedure
  .input(z.object({ cityName: z.string() }))
  .handler(async ({ input }) => {
    try {
      const rows = await db.select({
        userId: townManager.userId,
        name: user.name,
        phone: user.phoneNumber,
        townName: townManager.townName,
        cityName: townManager.cityName,
      })
        .from(townManager)
        .leftJoin(user, eq(user.id, townManager.userId))
        .where(eq(townManager.cityName, input.cityName));

      return { success: true, managers: rows };
    } catch (error) {
      console.error('[TownManager] Error listing managers by city:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to list managers' });
    }
  });

export const adminTownManagerController = {
  getReport,
  listByCity,
};
