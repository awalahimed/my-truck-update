import { adminProcedure } from '../../middlewares/auth-admin.js';
import { db } from '../../database/db.js';
import { user, userRoles } from '../../database/schema/auth-schema.js';
import { order, orderStatus } from '../../database/schema/order-schema.js';
import { transaction, transactionType } from '../../database/schema/payment-schema.js';
import { sql, and, gte, eq, desc } from 'drizzle-orm';
import { logger } from '../../utils/logger.js';

/**
 * Get dashboard statistics
 */
const getStats = adminProcedure.handler(async () => {
  try {
    // Get total users count
    const totalUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(user);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get users by role
    const usersByRole = await db
      .select({
        role: user.role,
        count: sql<number>`count(*)`,
      })
      .from(user)
      .groupBy(user.role);

    const roleBreakdown = usersByRole.reduce((acc, item) => {
      acc[item.role] = item.count;
      return acc;
    }, {} as Record<string, number>);

    // Get total orders count
    const totalOrdersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(order);
    const totalOrders = totalOrdersResult[0]?.count || 0;

    // Get orders by status
    const ordersByStatus = await db
      .select({
        status: order.status,
        count: sql<number>`count(*)`,
      })
      .from(order)
      .groupBy(order.status);

    const statusBreakdown = ordersByStatus.reduce((acc, item) => {
      acc[item.status] = item.count;
      return acc;
    }, {} as Record<string, number>);

    // Get this month's revenue (completed orders)
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    console.log('[dashboard.getStats] Fetching monthly revenue...');
    const completedOrders = await db
      .select({
        finalPrice: order.finalPrice,
      })
      .from(order)
      .where(
        and(
          eq(order.status, orderStatus.COMPLETED), // *** FIXED: Changed from DELIVERED to COMPLETED
          gte(order.createdAt, firstDayOfMonth)
        )
      );

    console.log('[dashboard.getStats] Monthly completed orders:', completedOrders.length);
    const monthlyRevenue = completedOrders.reduce(
      (sum, o) => sum + parseFloat(o.finalPrice || '0'),
      0
    );
    console.log('[dashboard.getStats] Monthly revenue:', monthlyRevenue);

    // Get total revenue (all time)
    console.log('[dashboard.getStats] Fetching total revenue...');
    const allCompletedOrders = await db
      .select({
        finalPrice: order.finalPrice,
      })
      .from(order)
      .where(eq(order.status, orderStatus.COMPLETED)); // *** FIXED: Changed from DELIVERED to COMPLETED

    console.log('[dashboard.getStats] Total completed orders:', allCompletedOrders.length);
    const totalRevenue = allCompletedOrders.reduce(
      (sum, o) => sum + parseFloat(o.finalPrice || '0'),
      0
    );
    console.log('[dashboard.getStats] Total revenue:', totalRevenue);

    // Get active orders (not delivered, not cancelled)
    const activeOrdersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(order)
      .where(
        and(
          sql`${order.status} != ${orderStatus.DELIVERED}`,
          sql`${order.status} != ${orderStatus.CANCELLED}`
        )
      );
    const activeOrders = activeOrdersResult[0]?.count || 0;

    // Get recent transactions count (last 24 hours)
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const recentTransactionsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(transaction)
      .where(gte(transaction.createdAt, last24Hours));
    const recentTransactions = recentTransactionsResult[0]?.count || 0;

    // Get orders by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await db
      .select({
        date: sql<string>`DATE(${order.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(order)
      .where(gte(order.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${order.createdAt})`)
      .orderBy(sql`DATE(${order.createdAt})`);

    const ordersByDay = recentOrders.reduce((acc, item) => {
      acc[item.date] = item.count;
      return acc;
    }, {} as Record<string, number>);

    // Get revenue by day for the last 30 days
    const recentRevenue = await db
      .select({
        date: sql<string>`DATE(${order.createdAt})`,
        revenue: sql<number>`SUM(${order.finalPrice})`,
      })
      .from(order)
      .where(
        and(
          eq(order.status, orderStatus.COMPLETED), // *** FIXED: Changed from DELIVERED to COMPLETED
          gte(order.createdAt, thirtyDaysAgo)
        )
      )
      .groupBy(sql`DATE(${order.createdAt})`)
      .orderBy(sql`DATE(${order.createdAt})`);

    const revenueByDay = recentRevenue.reduce((acc, item) => {
      acc[item.date] = parseFloat(item.revenue?.toString() || '0'); // *** FIXED: Handle null values
      return acc;
    }, {} as Record<string, number>);

    return {
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        monthlyRevenue: monthlyRevenue.toFixed(2),
        totalRevenue: totalRevenue.toFixed(2),
        activeOrders,
        recentTransactions,
        roleBreakdown,
        statusBreakdown,
        ordersByDay,
        revenueByDay,
      },
    };
  } catch (error) {
    logger.error('Failed to get dashboard stats:', { error });
    throw error;
  }
});

/**
 * Get recent activity
 */
const getRecentActivity = adminProcedure.handler(async () => {
  try {
    // Get recent orders
    const recentOrders = await db
      .select({
        id: order.id,
        status: order.status,
        finalPrice: order.finalPrice,
        createdAt: order.createdAt,
        customerName: sql<string>`customer.name`,
      })
      .from(order)
      .leftJoin(sql`user as customer`, sql`customer.id = ${order.customerId}`)
      .orderBy(desc(order.createdAt))
      .limit(10);

    // Get recent users
    const recentUsers = await db
      .select({
        id: user.id,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt))
      .limit(10);

    return {
      success: true,
      recentOrders,
      recentUsers,
    };
  } catch (error) {
    logger.error('Failed to get recent activity:', { error });
    throw error;
  }
});

export const adminDashboardController = {
  getStats,
  getRecentActivity,
};
