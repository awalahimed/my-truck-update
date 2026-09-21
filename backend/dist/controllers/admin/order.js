import { adminProcedure } from '../../middlewares/auth-admin.js';
import { db } from '../../database/db.js';
import { order, orderStatus } from '../../database/schema/order-schema.js';
import { sql, and, eq, like, or, desc, count, lte, gte } from 'drizzle-orm';
import { z } from 'zod';
import { logger } from '../../utils/logger.js';
const getAllOrders = adminProcedure
    .input(z.object({
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).max(100).default(20),
    search: z.string().optional(),
    status: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
}))
    .handler(async ({ input }) => {
    try {
        const { page, pageSize, search, status, dateFrom, dateTo } = input;
        const offset = (page - 1) * pageSize;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        // Build where conditions for order listing
        const conditions = [];
        if (search) {
            conditions.push(or(like(order.id, `%${search}%`), sql `EXISTS (SELECT 1 FROM \`user\` \`c\` WHERE \`c\`.\`id\` = ${order.customerId} AND \`c\`.\`name\` LIKE ${`%${search}%`})`, sql `EXISTS (SELECT 1 FROM \`user\` \`d\` WHERE \`d\`.\`id\` = ${order.driverId} AND \`d\`.\`name\` LIKE ${`%${search}%`})`));
        }
        if (status) {
            conditions.push(eq(order.status, status));
        }
        if (dateFrom) {
            conditions.push(gte(order.createdAt, new Date(dateFrom)));
        }
        if (dateTo) {
            const endDate = new Date(dateTo);
            endDate.setHours(23, 59, 59, 999);
            conditions.push(lte(order.createdAt, endDate));
        }
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        // Fetch orders with customer and driver info
        const ordersData = await db
            .select({
            id: order.id,
            customerId: order.customerId,
            customerName: sql `customer.name`,
            customerPhone: sql `customer.phone_number`,
            driverId: order.driverId,
            driverName: sql `driver.name`,
            driverPhone: sql `driver.phone_number`,
            pickupAddress: order.pickupAddress,
            deliveryAddress: order.deliveryAddress,
            materials: order.materials,
            vehicleType: order.vehicleType,
            status: order.status,
            estimatedPrice: order.estimatedPrice,
            finalPrice: order.finalPrice,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        })
            .from(order)
            .leftJoin(sql `\`user\` \`customer\``, sql `customer.id = ${order.customerId}`)
            .leftJoin(sql `\`user\` \`driver\``, sql `driver.id = ${order.driverId}`)
            .where(whereClause)
            .orderBy(desc(order.createdAt))
            .limit(pageSize)
            .offset(offset);
        // Get total count
        const countResult = await db
            .select({ total: count() })
            .from(order)
            .where(whereClause);
        const total = Number(countResult[0]?.total || 0);
        // Stats queries
        const [totalTodayResult] = await db
            .select({ value: sql `COUNT(*)` })
            .from(order)
            .where(gte(order.createdAt, today));
        const [activeResult] = await db
            .select({ value: sql `COUNT(*)` })
            .from(order)
            .where(sql `${order.status} IN (${sql.join([
            orderStatus.PENDING_APPROVAL,
            orderStatus.AGENT_SELECTED,
            orderStatus.APPROVED_BY_AGENT,
            orderStatus.APPROVED,
            orderStatus.HAS_OFFERS,
            orderStatus.ASSIGNED,
            orderStatus.ON_THE_WAY,
            orderStatus.DELIVERED,
        ].map(s => sql `${s}`), sql `, `)})`);
        const [completedResult] = await db
            .select({ value: sql `COUNT(*)` })
            .from(order)
            .where(eq(order.status, orderStatus.COMPLETED));
        const [cancelledResult] = await db
            .select({ value: sql `COUNT(*)` })
            .from(order)
            .where(eq(order.status, orderStatus.CANCELLED));
        const [delayedResult] = await db
            .select({ value: sql `COUNT(*)` })
            .from(order)
            .where(and(sql `${order.status} NOT IN (${sql.join([
            orderStatus.COMPLETED,
            orderStatus.CANCELLED,
            orderStatus.REJECTED,
            orderStatus.DELIVERED,
        ].map(s => sql `${s}`), sql `, `)})`, lte(order.createdAt, twentyFourHoursAgo)));
        const [avgRevenueResult] = await db
            .select({ value: sql `AVG(${order.finalPrice})` })
            .from(order)
            .where(eq(order.status, orderStatus.COMPLETED));
        return {
            success: true,
            stats: {
                totalToday: Number(totalTodayResult?.value || 0),
                active: Number(activeResult?.value || 0),
                completed: Number(completedResult?.value || 0),
                cancelled: Number(cancelledResult?.value || 0),
                delayed: Number(delayedResult?.value || 0),
                avgRevenue: Number(avgRevenueResult?.value || 0).toFixed(2),
            },
            orders: ordersData,
            total,
            page,
            pageSize,
        };
    }
    catch (error) {
        logger.error('Failed to get orders:', { error });
        throw error;
    }
});
export const adminOrderController = {
    getAllOrders,
};
//# sourceMappingURL=order.js.map