import { wsAuthProcedure } from '../../middlewares/ws-auth.js';
import { z } from 'zod';
import { db } from '../../database/db.js';
import { order, orderStatus } from '../../database/schema/order-schema.js';
import { user } from '../../database/schema/auth-schema.js';
import { eq, inArray, and } from 'drizzle-orm';
export const agentController = {
    // Get pending orders waiting for approval
    getPendingOrders: wsAuthProcedure
        .handler(async ({ context }) => {
        // Verify user is call center agent or admin
        if (context.user.role !== 'call_center' && context.user.role !== 'admin') {
            throw new Error('Access denied: Only call center agents can access this');
        }
        // Get all orders with PENDING_APPROVAL status
        const pendingOrders = await db.select()
            .from(order)
            .where(eq(order.status, orderStatus.PENDING_APPROVAL))
            .orderBy(order.createdAt);
        // Get customer information for each order
        const customerIds = [...new Set(pendingOrders.map(o => o.customerId))];
        const customers = customerIds.length > 0
            ? await db.select({
                id: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
            }).from(user).where(inArray(user.id, customerIds))
            : [];
        const customerMap = new Map(customers.map(c => [c.id, c]));
        // Add customer information to each order
        const ordersWithCustomers = pendingOrders.map(o => ({
            ...o,
            customerName: customerMap.get(o.customerId)?.name || 'Unknown',
            customerPhone: customerMap.get(o.customerId)?.phoneNumber || 'N/A',
            pickupLocation: {
                latitude: o.pickupLatitude,
                longitude: o.pickupLongitude,
            },
            deliveryLocation: {
                latitude: o.deliveryLatitude,
                longitude: o.deliveryLongitude,
            },
        }));
        return { orders: ordersWithCustomers };
    }),
    // Get all orders (for monitoring)
    getAllOrders: wsAuthProcedure
        .handler(async ({ context }) => {
        // Verify user is call center agent or admin
        if (context.user.role !== 'call_center' && context.user.role !== 'admin') {
            throw new Error('Access denied: Only call center agents can access this');
        }
        // Get all orders
        const allOrders = await db.select()
            .from(order)
            .orderBy(order.createdAt);
        // Get customer information
        const customerIds = [...new Set(allOrders.map(o => o.customerId))];
        const customers = customerIds.length > 0
            ? await db.select({
                id: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
            }).from(user).where(inArray(user.id, customerIds))
            : [];
        const customerMap = new Map(customers.map(c => [c.id, c]));
        // Get driver information
        const driverIds = [...new Set(allOrders.map(o => o.driverId).filter(Boolean))];
        const drivers = driverIds.length > 0
            ? await db.select({
                id: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
            }).from(user).where(inArray(user.id, driverIds))
            : [];
        const driverMap = new Map(drivers.map(d => [d.id, d]));
        // Add customer and driver information to each order
        const ordersWithInfo = allOrders.map(o => ({
            ...o,
            customerName: customerMap.get(o.customerId)?.name || 'Unknown',
            customerPhone: customerMap.get(o.customerId)?.phoneNumber || 'N/A',
            driverName: o.driverId ? driverMap.get(o.driverId)?.name || 'Unknown' : null,
            driverPhone: o.driverId ? driverMap.get(o.driverId)?.phoneNumber || 'N/A' : null,
            pickupLocation: {
                latitude: o.pickupLatitude,
                longitude: o.pickupLongitude,
            },
            deliveryLocation: {
                latitude: o.deliveryLatitude,
                longitude: o.deliveryLongitude,
            },
        }));
        return { orders: ordersWithInfo };
    }),
    // Get order by ID
    getOrderById: wsAuthProcedure
        .input(z.object({ orderId: z.string() }))
        .handler(async ({ input, context }) => {
        // Verify user is call center agent or admin
        if (context.user.role !== 'call_center' && context.user.role !== 'admin') {
            throw new Error('Access denied: Only call center agents can access this');
        }
        const orderData = await db.select()
            .from(order)
            .where(eq(order.id, input.orderId))
            .limit(1);
        if (!orderData.length) {
            throw new Error('Order not found');
        }
        const orderInfo = orderData[0];
        if (!orderInfo) {
            throw new Error('Order not found');
        }
        // Get customer info
        const customerData = await db.select({
            id: user.id,
            name: user.name,
            phoneNumber: user.phoneNumber,
        }).from(user).where(eq(user.id, orderInfo.customerId)).limit(1);
        // Get driver info if assigned
        let driverInfo = null;
        if (orderInfo.driverId) {
            const driverData = await db.select({
                id: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
            }).from(user).where(eq(user.id, orderInfo.driverId)).limit(1);
            if (driverData.length) {
                driverInfo = driverData[0];
            }
        }
        return {
            order: {
                ...orderInfo,
                customerName: customerData[0]?.name || 'Unknown',
                customerPhone: customerData[0]?.phoneNumber || 'N/A',
                driverName: driverInfo?.name || null,
                driverPhone: driverInfo?.phoneNumber || null,
                pickupLocation: {
                    latitude: orderInfo.pickupLatitude,
                    longitude: orderInfo.pickupLongitude,
                },
                deliveryLocation: {
                    latitude: orderInfo.deliveryLatitude,
                    longitude: orderInfo.deliveryLongitude,
                },
            }
        };
    }),
    // Get assigned orders for an agent (waiting for agent approval)
    getAssignedOrders: wsAuthProcedure
        .handler(async ({ context }) => {
        // Verify user is an agent
        if (context.user.role !== 'agent') {
            throw new Error('Only agents can access this');
        }
        const agentId = context.user.id;
        // Get orders assigned to this agent with status agent_selected (waiting for agent approval)
        const assignedOrders = await db.select()
            .from(order)
            .where(and(eq(order.agentId, agentId), eq(order.status, orderStatus.AGENT_SELECTED)))
            .orderBy(order.createdAt);
        // Get customer information
        const customerIds = [...new Set(assignedOrders.map(o => o.customerId))];
        const customers = customerIds.length > 0
            ? await db.select({
                id: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
            }).from(user).where(eq(user.id, customerIds[0]))
            : [];
        const customerMap = new Map(customers.map(c => [c.id, c]));
        // Add customer information to each order
        const ordersWithCustomers = assignedOrders.map(o => ({
            ...o,
            customerName: customerMap.get(o.customerId)?.name || 'Unknown',
            customerPhone: customerMap.get(o.customerId)?.phoneNumber || 'N/A',
            pickupLocation: {
                latitude: o.pickupLatitude,
                longitude: o.pickupLongitude,
            },
            deliveryLocation: {
                latitude: o.deliveryLatitude,
                longitude: o.deliveryLongitude,
            },
        }));
        return { orders: ordersWithCustomers };
    }),
    // Get approved orders by agent (awaiting call center final approval)
    getApprovedByAgentOrders: wsAuthProcedure
        .handler(async ({ context }) => {
        // Can be called by call center or agent
        if (context.user.role !== 'agent' && context.user.role !== 'call_center' && context.user.role !== 'admin') {
            throw new Error('Access denied');
        }
        // Get all orders with approved_by_agent status
        const approvedOrders = await db.select()
            .from(order)
            .where(eq(order.status, orderStatus.APPROVED_BY_AGENT))
            .orderBy(order.createdAt);
        // Get customer and agent information
        const customerIds = [...new Set(approvedOrders.map(o => o.customerId))];
        const agentIds = [...new Set(approvedOrders.map(o => o.agentId).filter(Boolean))];
        const customers = customerIds.length > 0
            ? await db.select({
                id: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
            }).from(user).where(inArray(user.id, customerIds))
            : [];
        const agents = agentIds.length > 0
            ? await db.select({
                id: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
            }).from(user).where(inArray(user.id, agentIds))
            : [];
        const customerMap = new Map(customers.map(c => [c.id, c]));
        const agentMap = new Map(agents.map(a => [a.id, a]));
        // Add customer and agent information
        const ordersWithInfo = approvedOrders.map(o => ({
            ...o,
            customerName: customerMap.get(o.customerId)?.name || 'Unknown',
            customerPhone: customerMap.get(o.customerId)?.phoneNumber || 'N/A',
            agentName: o.agentId ? agentMap.get(o.agentId)?.name || 'Unknown' : null,
            agentPhone: o.agentId ? agentMap.get(o.agentId)?.phoneNumber || 'N/A' : null,
            pickupLocation: {
                latitude: o.pickupLatitude,
                longitude: o.pickupLongitude,
            },
            deliveryLocation: {
                latitude: o.deliveryLatitude,
                longitude: o.deliveryLongitude,
            },
        }));
        return { orders: ordersWithInfo };
    }),
};
//# sourceMappingURL=agent.js.map