import { z } from 'zod';
import { os } from '@orpc/server';
import { authProcedure, driverProcedure } from '../middlewares/auth.js';
import { db } from '../database/db.js';
import { order, orderStatus } from '../database/schema/order-schema.js';
import { user } from '../database/schema/auth-schema.js';
import { vehicle } from '../database/schema/vehicle-schema.js';
import { driverOffer, offerStatus } from '../database/schema/driver-offer-schema.js';
import { wallet, walletTransaction } from '../database/schema/wallet-schema.js';
import { commissions } from '../database/schema/commission-schema.js';
import { transaction, transactionType, paymentStatus } from '../database/schema/payment-schema.js';
import { uploadedFile } from '../database/schema/file-schema.js';
import { agentProfile } from '../database/schema/agent-schema.js';
import { notifyOrderSubscribers } from './websocket/customer.js';
import { createNotification } from '../services/notification.js';
import { completeReferral } from '../services/referral.js';
import { sendSMS } from '../utils/sms.js';
import { notifyAgentOrderAssigned } from '../utils/websocket-broadcast.js';
import { eq, and, or, desc, inArray, ne, sql } from 'drizzle-orm';
import { cities, marketRates } from '../database/schema/master-data-schema.js';
import crypto from 'node:crypto';

// Platform wallet user ID for collecting fees
const PLATFORM_USER_ID = 'platform';
const PLATFORM_FEE_RATE = 0.07; // 7% platform fee

const createOrderSchema = z.object({
  pickupAddress: z.string().min(1),
  pickupLatitude: z.number(),
  pickupLongitude: z.number(),
  deliveryAddress: z.string().min(1),
  deliveryLatitude: z.number(),
  deliveryLongitude: z.number(),
  materials: z.array(z.string()).min(1),
  vehicleType: z.enum(['motorcycle', 'car', 'truck']),
  notes: z.string().optional(),
  consigneeName: z.string().optional(),
  consigneePhone: z.string().optional(),
});

const callCenterCreateOrderSchema = createOrderSchema.extend({
  customerPhone: z.string().min(1),
  customerName: z.string().min(1),
  assignedAgentId: z.string().min(1),
});

export const orderController = os.router({
  // Call center creates an order on behalf of a customer and assigns it to an agent
  callCenterCreateOrder: authProcedure
    .input(callCenterCreateOrderSchema)
    .handler(async ({ input, context }) => {
      // Verify user is call center agent or admin
      if (context.user.role !== 'call_center' && context.user.role !== 'admin') {
        throw new Error('Only call center agents can create manual orders');
      }

      // Check if user exists by phone
      const existingUser = await db.query.user.findFirst({
        where: eq(user.phoneNumber, input.customerPhone)
      });

      let customerId = '';
      
      if (existingUser) {
        customerId = existingUser.id;
      } else {
        // Create a new user
        customerId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.insert(user).values({
          id: customerId,
          name: input.customerName,
          phoneNumber: input.customerPhone,
          role: 'user',
          accountStatus: 'active',
          phoneNumberVerified: true,
        });
      }

      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.insert(order).values({
        id: orderId,
        customerId: customerId,
        agentId: input.assignedAgentId,
        pickupAddress: input.pickupAddress,
        pickupLatitude: input.pickupLatitude.toString(),
        pickupLongitude: input.pickupLongitude.toString(),
        deliveryAddress: input.deliveryAddress,
        deliveryLatitude: input.deliveryLatitude.toString(),
        deliveryLongitude: input.deliveryLongitude.toString(),
        materials: input.materials,
        vehicleType: input.vehicleType,
        notes: input.notes || null,
        estimatedPrice: null,
        status: orderStatus.AGENT_SELECTED,
        assignedAt: new Date(),
      });

      // Broadcast to assigned agent
      const { notifyAgentOrderAssigned } = await import('../utils/websocket-broadcast.js');
      await notifyAgentOrderAssigned(input.assignedAgentId, orderId);

      // Send SMS to customer with tracking link
      try {
        const trackingLink = `https://mytrucket.com/track/${orderId}`;
        await sendSMS(input.customerPhone, `MyTruck: Your order has been created. Track it live here: ${trackingLink}`);
      } catch(e) {
        console.error('SMS failed', e);
      }

      return {
        success: true,
        orderId,
        customerId,
        message: 'Order created and assigned to verification agent',
      };
    }),

  // Create new order
  create: authProcedure
    .input(createOrderSchema)
    .handler(async ({ input, context }) => {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
      
      const newOrder = await db.insert(order).values({
        id: orderId,
        customerId: context.user.id,
        pickupAddress: input.pickupAddress,
        pickupLatitude: input.pickupLatitude.toString(),
        pickupLongitude: input.pickupLongitude.toString(),
        deliveryAddress: input.deliveryAddress,
        deliveryLatitude: input.deliveryLatitude.toString(),
        deliveryLongitude: input.deliveryLongitude.toString(),
        materials: input.materials,
        vehicleType: input.vehicleType,
        notes: input.notes || null,
        deliveryPin,
        consigneeName: input.consigneeName || null,
        consigneePhone: input.consigneePhone || null,
        estimatedPrice: null,
        status: orderStatus.PENDING_APPROVAL, // NEW: Goes to call center first
      });

      // NEW: Broadcast to call center instead of drivers
      const { broadcastOrderToCallCenter } = await import('../utils/websocket-broadcast.js')
      await broadcastOrderToCallCenter(orderId)

      return {
        success: true,
        orderId,
        message: 'Order created and sent to call center for approval'
      };
    }),

  // NEW: Call center approves order
  callCenterApprove: authProcedure
    .input(z.object({ orderId: z.string() }))
    .handler(async ({ input, context }) => {
      const { orderId } = input;
      const agentId = context.user.id;

      // Verify user is call center agent
      if (context.user.role !== 'call_center' && context.user.role !== 'admin') {
        throw new Error('Only call center agents can approve orders');
      }

      // Get order
      const orderData = await db.select()
        .from(order)
        .where(eq(order.id, orderId))
        .limit(1);

      if (!orderData.length) {
        throw new Error('Order not found');
      }

      const targetOrder = orderData[0];
      if (!targetOrder) {
        throw new Error('Order not found');
      }

      if (targetOrder.status !== orderStatus.PENDING_APPROVAL) {
        throw new Error('Order is not pending approval');
      }

      // Update order to approved
      await db.update(order)
        .set({
          status: orderStatus.APPROVED,
          agentId,
          approvedAt: new Date(),
        })
        .where(eq(order.id, orderId));

      // Create in-app notification for customer
      await createNotification(targetOrder.customerId, {
        title: '✅ Order Approved',
        body: 'Your order has been approved and sent to drivers',
        type: 'order_approved',
        data: { orderId, status: orderStatus.APPROVED },
      });

      // Broadcast to drivers with matching vehicle type
      const { broadcastOrderToDrivers } = await import('../utils/websocket-broadcast.js');
      await broadcastOrderToDrivers(orderId);

      // Notify customer
      await notifyOrderSubscribers(orderId, {
        type: 'order_approved',
        status: orderStatus.APPROVED,
      });

      return {
        success: true,
        message: 'Order approved and sent to drivers',
      };
    }),

  // NEW: Get pending orders for call center
  getCallCenterPendingOrders: authProcedure
    .handler(async ({ context }) => {
      console.log('[order.getCallCenterPendingOrders] User role:', context.user.role);
      
      // Verify user is call center agent or admin
      if (context.user.role !== 'call_center' && context.user.role !== 'admin') {
        console.log('[order.getCallCenterPendingOrders] Access denied for role:', context.user.role);
        throw new Error('Only call center agents can access this');
      }

      // Get all orders with PENDING_APPROVAL status
      const orders = await db.select()
        .from(order)
        .where(eq(order.status, orderStatus.PENDING_APPROVAL))
        .orderBy(order.createdAt);

      // Get customer information for each order
      const customerIds = [...new Set(orders.map(o => o.customerId))];
      const customers = customerIds.length > 0 
        ? await db.select({
            id: user.id,
            name: user.name,
            phoneNumber: user.phoneNumber,
          }).from(user).where(inArray(user.id, customerIds))
        : [];
      
      const customerMap = new Map(customers.map(c => [c.id, c]));

      // Add customer information to each order
      const ordersWithCustomers = orders.map(o => ({
        ...o,
        customerName: customerMap.get(o.customerId)?.name || 'Unknown',
        customerPhone: customerMap.get(o.customerId)?.phoneNumber || 'N/A',
      }));

      return { success: true, orders: ordersWithCustomers };
    }),

  // NEW: Get nearby agents for an order (sorted by distance to pickup and city match)
  getNearbyAgents: authProcedure
    .input(z.object({ orderId: z.string().optional() }).optional())
    .handler(async ({ input, context }) => {
      const orderId = input?.orderId;
      // Verify user is call center agent or admin
      if (context.user.role !== 'call_center' && context.user.role !== 'admin') {
        throw new Error('Only call center agents can access this');
      }

      // 1. Fetch order details if orderId is provided
      let orderInfo: any = null;
      if (orderId) {
        const orderData = await db
          .select()
          .from(order)
          .where(eq(order.id, orderId))
          .limit(1);
        if (orderData.length) {
          orderInfo = orderData[0];
        }
      }

      // 2. Fetch all agents from user table joined with agentProfile
      const agents = await db
        .select({
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          email: user.email,
          image: user.image,
          accountStatus: user.accountStatus,
          assignedCity: agentProfile.assignedCity,
          assignedTown: agentProfile.assignedTown,
          assignedTownManager: agentProfile.assignedTownManager,
          agentType: agentProfile.agentType,
          latitude: agentProfile.latitude,
          longitude: agentProfile.longitude,
          tier: agentProfile.tier,
        })
        .from(user)
        .leftJoin(agentProfile, eq(user.id, agentProfile.userId))
        .where(
          and(
            or(eq(user.role, 'agent'), eq(user.role, 'agent_delala')),
            ne(user.banned, true)
          )
        );

      // Known city coordinates dictionary for intelligent distance estimation when GPS is uncalibrated
      const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
        'addis ababa': { lat: 9.03, lng: 38.74 },
        'adama': { lat: 8.54, lng: 39.27 },
        'nazret': { lat: 8.54, lng: 39.27 },
        'nekemte': { lat: 9.09, lng: 36.55 },
        'hawassa': { lat: 7.05, lng: 38.47 },
        'dire dawa': { lat: 9.59, lng: 41.86 },
        'bahir dar': { lat: 11.59, lng: 37.39 },
        'gondar': { lat: 12.60, lng: 37.46 },
        'mekelle': { lat: 13.49, lng: 39.47 },
        'jimma': { lat: 7.67, lng: 36.83 },
        'shashemene': { lat: 7.20, lng: 38.60 },
        'bishoftu': { lat: 8.75, lng: 38.98 },
        'mojo': { lat: 8.60, lng: 39.12 },
        'harar': { lat: 9.31, lng: 42.12 },
        'dessie': { lat: 11.13, lng: 39.63 },
        'jigjiga': { lat: 9.35, lng: 42.80 },
        'wolaita sodo': { lat: 6.86, lng: 37.76 },
        'arba minch': { lat: 6.03, lng: 37.55 },
        'asella': { lat: 7.96, lng: 39.13 },
        'dilla': { lat: 6.41, lng: 38.31 },
        'ambo': { lat: 8.98, lng: 37.85 },
      };

      const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const R = 6371000; // meters
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
      };

      const lat1 = orderInfo?.pickupLatitude ? parseFloat(String(orderInfo.pickupLatitude)) : NaN;
      const lon1 = orderInfo?.pickupLongitude ? parseFloat(String(orderInfo.pickupLongitude)) : NaN;
      const hasOrderCoords = !isNaN(lat1) && !isNaN(lon1);
      const pickupAddressLower = (orderInfo?.pickupAddress || '').toLowerCase();

      const mappedAgents = agents.map((a: any) => {
        let lat2 = a.latitude ? parseFloat(String(a.latitude)) : NaN;
        let lon2 = a.longitude ? parseFloat(String(a.longitude)) : NaN;

        // Fallback to assignedCity coords if GPS coords are missing or NaN
        if ((isNaN(lat2) || isNaN(lon2)) && a.assignedCity) {
          const cityKey = a.assignedCity.trim().toLowerCase();
          const found = CITY_COORDS[cityKey];
          if (found) {
            lat2 = found.lat;
            lon2 = found.lng;
          }
        }

        let distance: number | null = null;
        if (hasOrderCoords && !isNaN(lat2) && !isNaN(lon2)) {
          distance = haversine(lat1, lon1, lat2, lon2);
        }

        // Check if agent's assigned city matches the order pickup address
        const cityLower = (a.assignedCity || '').trim().toLowerCase();
        const townLower = (a.assignedTown || '').trim().toLowerCase();
        const isCityMatch = Boolean(
          (cityLower && pickupAddressLower.includes(cityLower)) ||
          (townLower && pickupAddressLower.includes(townLower))
        );

        return {
          id: a.id,
          name: a.name || 'Unnamed Agent',
          phoneNumber: a.phoneNumber || 'N/A',
          email: a.email || null,
          image: a.image || null,
          assignedCity: a.assignedCity || null,
          assignedTown: a.assignedTown || null,
          assignedTownManager: a.assignedTownManager || null,
          agentType: a.agentType || 'field_agent',
          tier: a.tier || 'new',
          latitude: a.latitude || (!isNaN(lat2) ? String(lat2) : null),
          longitude: a.longitude || (!isNaN(lon2) ? String(lon2) : null),
          distance,
          isCityMatch,
        };
      });

      // Sort: direct city match first, then by closest distance, then alphabetically
      mappedAgents.sort((a, b) => {
        if (a.isCityMatch && !b.isCityMatch) return -1;
        if (!a.isCityMatch && b.isCityMatch) return 1;

        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        if (a.distance !== null && b.distance === null) return -1;
        if (a.distance === null && b.distance !== null) return 1;

        return (a.name || '').localeCompare(b.name || '');
      });

      return { success: true, agents: mappedAgents };
    }),

  // NEW: Call center rejects order
  callCenterReject: authProcedure
    .input(z.object({ 
      orderId: z.string(),
      reason: z.string().optional(),
    }))
    .handler(async ({ input, context }) => {
      const { orderId, reason } = input;
      const agentId = context.user.id;

      // Verify user is call center agent
      if (context.user.role !== 'call_center' && context.user.role !== 'admin') {
        throw new Error('Only call center agents can reject orders');
      }

      // Get order
      const orderData = await db.select()
        .from(order)
        .where(eq(order.id, orderId))
        .limit(1);

      if (!orderData.length) {
        throw new Error('Order not found');
      }

      const targetOrder = orderData[0];
      if (!targetOrder) {
        throw new Error('Order not found');
      }

      if (targetOrder.status !== orderStatus.PENDING_APPROVAL) {
        throw new Error('Order is not pending approval');
      }

      // Update order to rejected
      await db.update(order)
        .set({
          status: orderStatus.REJECTED,
          agentId,
          rejectedAt: new Date(),
          rejectionReason: reason || 'Order rejected by call center',
        })
        .where(eq(order.id, orderId));

      // Create in-app notification for customer
      await createNotification(targetOrder.customerId, {
        title: '❌ Order Rejected',
        body: reason || 'Your order has been rejected by call center',
        type: 'order_rejected',
        data: { orderId, status: orderStatus.REJECTED },
      });

      // Notify customer
      await notifyOrderSubscribers(orderId, {
        type: 'order_rejected',
        status: orderStatus.REJECTED,
        reason: reason || 'Order rejected by call center',
      });

      return {
        success: true,
        message: 'Order rejected',
      };
    }),

  // NEW: Call center approves order with agent assignment
  callCenterSelectAgent: authProcedure
    .input(z.object({ 
      orderId: z.string(),
      agentId: z.string(),
    }))
    .handler(async ({ input, context }) => {
      const { orderId, agentId } = input;

      // Verify user is call center agent or admin
      if (context.user.role !== 'call_center' && context.user.role !== 'admin') {
        throw new Error('Only call center agents can select agents');
      }

      // Verify agent exists
      const agentData = await db.select()
        .from(user)
        .where(and(eq(user.id, agentId), eq(user.role, 'agent')))
        .limit(1);

      if (!agentData.length) {
        throw new Error('Agent not found');
      }

      // Get order
      const orderData = await db.select()
        .from(order)
        .where(eq(order.id, orderId))
        .limit(1);

      if (!orderData.length) {
        throw new Error('Order not found');
      }

      const targetOrder = orderData[0];
      if (!targetOrder) {
        throw new Error('Order not found');
      }

      if (targetOrder.status !== orderStatus.PENDING_APPROVAL) {
        throw new Error('Order is not pending approval');
      }

      // Update order to agent_selected
      await db.update(order)
        .set({
          status: orderStatus.AGENT_SELECTED,
          agentId,
          assignedAt: new Date(),
        })
        .where(eq(order.id, orderId));

      // Send SMS to assigned agent
      const agentProfile_data = agentData[0];
      if (agentProfile_data?.phoneNumber) {
        await sendSMS(
          agentProfile_data.phoneNumber,
          `🚚 MyTruck: Order ${orderId} assigned to you. Please verify items at: ${targetOrder.pickupAddress} → ${targetOrder.deliveryAddress}`
        );
      }

      // Notify agent via WebSocket
      await notifyAgentOrderAssigned(agentId, orderId);

      // Create in-app notification for customer
      await createNotification(targetOrder.customerId, {
        title: '📋 Agent Assigned',
        body: 'An agent has been assigned to verify your order',
        type: 'agent_assigned',
        data: { orderId, status: orderStatus.AGENT_SELECTED },
      });

      return {
        success: true,
        message: 'Agent selected, waiting for agent approval',
      };
    }),

  // Agent approves the order (checks items are correct)
  agentApproveOrder: authProcedure
    .input(z.object({ 
      orderId: z.string(),
      notes: z.string().optional(),
    }))
    .handler(async ({ input, context }) => {
      const { orderId, notes } = input;
      const agentId = context.user.id;

      // Verify user is agent
      if (context.user.role !== 'agent') {
        throw new Error('Only agents can approve orders');
      }

      // Get order
      const orderData = await db.select()
        .from(order)
        .where(eq(order.id, orderId))
        .limit(1);

      if (!orderData.length) {
        throw new Error('Order not found');
      }

      const targetOrder = orderData[0];
      if (!targetOrder) {
        throw new Error('Order not found');
      }

      if (targetOrder.status !== orderStatus.AGENT_SELECTED) {
        throw new Error('Order is not assigned to an agent');
      }

      if (targetOrder.agentId !== agentId) {
        throw new Error('This order is not assigned to you');
      }

      // Update order to approved_by_agent
      await db.update(order)
        .set({
          status: orderStatus.APPROVED_BY_AGENT,
          notes: notes || targetOrder.notes,
        })
        .where(eq(order.id, orderId));

      // Notify call center and customer
      await createNotification(targetOrder.customerId, {
        title: '✅ Agent Verified',
        body: 'Agent has verified your order. Waiting for final approval.',
        type: 'agent_verified',
        data: { orderId, status: orderStatus.APPROVED_BY_AGENT },
      });

      return {
        success: true,
        message: 'Order approved by agent, waiting for call center final approval',
      };
    }),

  // Agent rejects the order and sends it back to pending approval
  agentRejectOrder: authProcedure
    .input(z.object({
      orderId: z.string(),
      reason: z.string().optional(),
    }))
    .handler(async ({ input, context }) => {
      const { orderId, reason } = input;
      const agentId = context.user.id;

      if (context.user.role !== 'agent') {
        throw new Error('Only agents can reject orders');
      }

      // Get order
      const orderData = await db.select().from(order).where(eq(order.id, orderId)).limit(1);
      if (!orderData.length) throw new Error('Order not found');

      const targetOrder = orderData[0];
      if (targetOrder.agentId !== agentId) throw new Error('This order is not assigned to you');

      // Set back to pending_approval and clear agent assignment
      await db.update(order).set({
        status: orderStatus.PENDING_APPROVAL,
        agentId: null,
        assignedAt: null,
        rejectionReason: reason || 'Rejected by agent, sent back to pending approval',
        rejectedAt: new Date(),
      }).where(eq(order.id, orderId));

      // Notify call center (create a notification for call center role)
      // For simplicity we notify the original customer as well
      await createNotification(targetOrder.customerId, {
        title: '⚠️ Agent Rejected',
        body: 'Agent rejected verification; order returned to pending approval',
        type: 'agent_rejected',
        data: { orderId, reason },
      });

      return { success: true, message: 'Order sent back to pending approval' };
    }),

  // Call center final approval (after agent approved)
  callCenterFinalApprove: authProcedure
    .input(z.object({ 
      orderId: z.string(),
    }))
    .handler(async ({ input, context }) => {
      const { orderId } = input;

      // Verify user is call center agent or admin
      if (context.user.role !== 'call_center' && context.user.role !== 'admin') {
        throw new Error('Only call center agents can approve orders');
      }

      // Get order
      const orderData = await db.select()
        .from(order)
        .where(eq(order.id, orderId))
        .limit(1);

      if (!orderData.length) {
        throw new Error('Order not found');
      }

      const targetOrder = orderData[0];
      if (!targetOrder) {
        throw new Error('Order not found');
      }

      if (targetOrder.status !== orderStatus.APPROVED_BY_AGENT) {
        throw new Error('Order must be approved by agent first');
      }

      // Update order to approved
      await db.update(order)
        .set({
          status: orderStatus.APPROVED,
          approvedAt: new Date(),
        })
        .where(eq(order.id, orderId));

      // Create in-app notification for customer
      await createNotification(targetOrder.customerId, {
        title: '🎉 Order Approved',
        body: 'Your order has been approved and sent to drivers',
        type: 'order_approved',
        data: { orderId, status: orderStatus.APPROVED },
      });

      // Broadcast to drivers
      const { broadcastOrderToDrivers } = await import('../utils/websocket-broadcast.js');
      await broadcastOrderToDrivers(orderId);

      // Notify customer
      await notifyOrderSubscribers(orderId, {
        type: 'order_approved',
        status: orderStatus.APPROVED,
      });

      return {
        success: true,
        message: 'Order approved and sent to drivers',
      };
    }),

  // Deprecated: kept for backward compatibility - now use two-step process
  callCenterApproveWithAgent: authProcedure
    .input(z.object({ 
      orderId: z.string(),
      agentId: z.string(),
    }))
    .handler(async ({ input, context }) => {
      // Verify user is call center agent or admin
      if (context.user.role !== 'call_center' && context.user.role !== 'admin') {
        throw new Error('Only call center agents can select agents');
      }

      // For backward compatibility, use the new two-step approach
      // Step 1: Select agent
      const orderData = await db.select()
        .from(order)
        .where(eq(order.id, input.orderId))
        .limit(1);

      if (!orderData.length) {
        throw new Error('Order not found');
      }

      const targetOrder = orderData[0];
      if (targetOrder.status !== orderStatus.PENDING_APPROVAL) {
        throw new Error('Order is not pending approval');
      }

      // Update order to agent_selected
      await db.update(order)
        .set({
          status: orderStatus.AGENT_SELECTED,
          agentId: input.agentId,
          assignedAt: new Date(),
        })
        .where(eq(order.id, input.orderId));

      const agentData = await db.select()
        .from(user)
        .where(eq(user.id, input.agentId))
        .limit(1);

      if (agentData.length && agentData[0].phoneNumber) {
        await sendSMS(
          agentData[0].phoneNumber,
          `🚚 MyTruck: Order ${input.orderId} assigned. Check: ${targetOrder.pickupAddress}`
        );
      }

      await notifyAgentOrderAssigned(input.agentId, input.orderId);

      return {
        success: true,
        message: 'Agent selected, waiting for agent approval',
      };
    }),

  // Get pending orders for drivers (only APPROVED orders)
  getPendingOrders: driverProcedure
    .input(z.object({ vehicleType: z.string().optional() }).optional())
    .handler(async ({ input }) => {
      const orders = await db.select()
        .from(order)
        .where(eq(order.status, orderStatus.APPROVED)) // Only show approved orders
        .orderBy(desc(order.createdAt));

      const filtered = input?.vehicleType 
        ? orders.filter(o => o.vehicleType === input.vehicleType)
        : orders;

      return { orders: filtered };
    }),

  // Driver submits or updates an offer for an order (HTTP endpoint)
  createOffer: driverProcedure
    .input(z.object({
      orderId: z.string(),
      offeredPrice: z.number().positive(),
    }))
    .handler(async ({ input, context }) => {
      const { orderId, offeredPrice } = input;
      const driverId = context.user.id;
      console.log('🚀 [HTTP createOffer] Received offer request:', { orderId, offeredPrice, driverId })

      // Verify driver account is active
      const driverUser = await db.select()
        .from(user)
        .where(eq(user.id, driverId))
        .limit(1);

      if (!driverUser.length || driverUser[0]?.accountStatus !== 'active') {
        console.warn('⚠️ [HTTP createOffer] Driver not active:', driverUser[0]?.accountStatus)
        throw new Error('Your account is pending approval. You cannot make offers yet.');
      }

      // Check if order exists and is approved or has_offers
      const orderData = await db.select()
        .from(order)
        .where(eq(order.id, orderId))
        .limit(1);

      if (!orderData.length || !orderData[0]) {
        console.warn('⚠️ [HTTP createOffer] Order not found:', orderId)
        throw new Error('Order not found');
      }

      const targetOrder = orderData[0];
      if (targetOrder.status !== orderStatus.APPROVED && targetOrder.status !== orderStatus.HAS_OFFERS) {
        console.warn('⚠️ [HTTP createOffer] Invalid order status:', targetOrder.status)
        throw new Error('Order is not available for offers');
      }

      // Check if driver is currently locked to an assigned order
      const assignedOrder = await db.select()
        .from(order)
        .where(and(eq(order.driverId, driverId), eq(order.status, orderStatus.ASSIGNED)))
        .limit(1);

      if (assignedOrder.length > 0) {
        throw new Error('You are currently locked to an assigned order. Complete that order before accepting new ones.');
      }

      // Enforce Regional Benchmark Price-Band Guard (Anti-Gouging & Fair Wage)
      try {
        const allCities = await db.select().from(cities).where(eq(cities.isActive, true));
        const pickupLower = (targetOrder.pickupAddress || '').toLowerCase();
        const deliveryLower = (targetOrder.deliveryAddress || '').toLowerCase();

        const originCity = allCities.find(c => pickupLower.includes(c.nameEn.toLowerCase()) || pickupLower.includes(c.nameAm));
        const destCity = allCities.find(c => deliveryLower.includes(c.nameEn.toLowerCase()) || deliveryLower.includes(c.nameAm));

        if (originCity && destCity) {
          const [benchmark] = await db
            .select()
            .from(marketRates)
            .where(
              and(
                eq(marketRates.originCityId, originCity.id),
                eq(marketRates.destinationCityId, destCity.id),
                eq(marketRates.isActive, true)
              )
            )
            .limit(1);

          if (benchmark) {
            const minNum = parseFloat(benchmark.minRate) || 0;
            const maxNum = parseFloat(benchmark.maxRate) || 0;
            const baseNum = parseFloat(benchmark.baseRate) || 0;

            if (benchmark.isFixedPrice && baseNum > 0) {
              if (Math.abs(offeredPrice - baseNum) > 5) {
                throw new Error(
                  `This route operates on a Guaranteed Fixed Tariff of ${Math.round(baseNum).toLocaleString()} ETB. Offers must match the official constant price.`
                );
              }
            } else if (minNum > 0 && maxNum > 0) {
              if (offeredPrice > maxNum * 1.25) {
                throw new Error(
                  `Offer of ${offeredPrice.toLocaleString()} ETB exceeds the fair regional ceiling of ${Math.round(maxNum).toLocaleString()} ETB for this route. Maximum acceptable bid is ${Math.round(maxNum * 1.25).toLocaleString()} ETB.`
                );
              }
              if (offeredPrice < minNum * 0.75) {
                throw new Error(
                  `Offer of ${offeredPrice.toLocaleString()} ETB is below the minimum fair driver wage (${Math.round(minNum).toLocaleString()} ETB) for this route.`
                );
              }
            }
          }
        }
      } catch (err: any) {
        if (
          err.message &&
          (err.message.includes('Guaranteed Fixed Tariff') ||
            err.message.includes('exceeds the fair regional') ||
            err.message.includes('below the minimum fair'))
        ) {
          throw err;
        }
      }

      // Check if driver already has a pending offer for this order
      const existingOffer = await db.select()
        .from(driverOffer)
        .where(and(
          eq(driverOffer.orderId, orderId),
          eq(driverOffer.driverId, driverId),
          eq(driverOffer.status, offerStatus.PENDING)
        ))
        .limit(1);

      if (existingOffer.length > 0 && existingOffer[0]) {
        await db.update(driverOffer)
          .set({
            offeredPrice: offeredPrice.toString(),
            updatedAt: new Date(),
          })
          .where(eq(driverOffer.id, existingOffer[0].id));

        return { success: true, message: 'Offer updated successfully', offerId: existingOffer[0].id };
      }

      // Insert new offer
      const offerId = `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(driverOffer).values({
        id: offerId,
        orderId,
        driverId,
        offeredPrice: offeredPrice.toString(),
        status: offerStatus.PENDING,
      });

      // Update order status to HAS_OFFERS if it was APPROVED
      if (targetOrder.status === orderStatus.APPROVED) {
        await db.update(order)
          .set({ status: orderStatus.HAS_OFFERS })
          .where(eq(order.id, orderId));
      }

      // Notify customer (in-app + websocket)
      try {
        await createNotification(targetOrder.customerId, {
          title: '💰 New Offer Received',
          body: `A driver offered ${offeredPrice} ETB for your order`,
          type: 'new_offer',
          data: { orderId, offerId, offeredPrice: offeredPrice.toString() },
        });
      } catch (e) {
        console.warn('Customer notification failed:', e);
      }

      return { success: true, message: 'Offer submitted successfully', offerId };
    }),

  // Get user's orders
  getMyOrders: authProcedure
    .handler(async ({ context }) => {
      const orders = await db.select()
        .from(order)
        .where(eq(order.customerId, context.user.id))
        .orderBy(desc(order.createdAt));

      const driverIds = Array.from(
        new Set(
          orders
            .map(o => o.driverId)
            .filter((id): id is string => typeof id === 'string' && id.length > 0)
        )
      );

      if (!driverIds.length) {
        return { success: true, orders };
      }

      const drivers = await db.select({
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
      })
        .from(user)
        .where(inArray(user.id, driverIds));

      const vehicles = await db.select({
        driverId: vehicle.driverId,
        type: vehicle.type,
        plateNumber: vehicle.plateNumber,
      })
        .from(vehicle)
        .where(inArray(vehicle.driverId, driverIds));

      const driverById = new Map(drivers.map(d => [d.id, d] as const));
      const vehicleByDriverId = new Map(vehicles.map(v => [v.driverId, v] as const));

      const ordersWithDriver = orders.map(o => {
        if (!o.driverId) return o;

        const d = driverById.get(o.driverId);
        if (!d) return o;

        const v = vehicleByDriverId.get(o.driverId);

        return {
          ...o,
          driver: {
            id: d.id,
            name: d.name,
            phone: d.phoneNumber,
            vehicleInfo: v ? `${v.type} - ${v.plateNumber}` : 'N/A',
          },
        };
      });

      return { success: true, orders: ordersWithDriver };
    }),

  // Get order by ID
  getById: authProcedure
    .input(z.object({ orderId: z.string() }))
    .handler(async ({ input, context }) => {
      const orderData = await db.query.order.findFirst({
        where: and(
          eq(order.id, input.orderId),
          eq(order.customerId, context.user.id)
        ),
      });

      if (!orderData) {
        throw new Error('Order not found');
      }

      let driverInfo: null | {
        id: string;
        name: string;
        phone: string;
        vehicleInfo: string;
        profilePhoto?: string; // *** NEW: Add profile photo
      } = null;

      if (orderData.driverId) {
        const driverData = await db.select({
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
        })
          .from(user)
          .where(eq(user.id, orderData.driverId))
          .limit(1);

        const d = driverData[0];
        if (d) {
          const vehicleData = await db.select({
            type: vehicle.type,
            plateNumber: vehicle.plateNumber,
          })
            .from(vehicle)
            .where(eq(vehicle.driverId, orderData.driverId))
            .limit(1);

          const v = vehicleData[0];

          // *** NEW: Get driver's profile photo
          const profilePhotoData = await db.select({
            fileName: uploadedFile.fileName,
          })
            .from(uploadedFile)
            .where(
              and(
                eq(uploadedFile.userId, orderData.driverId),
                eq(uploadedFile.documentType, 'profile_photo')
              )
            )
            .limit(1);

          const profilePhoto = profilePhotoData[0]?.fileName 
            ? `profile_photo/${profilePhotoData[0].fileName}` 
            : undefined;

          driverInfo = {
            id: d.id,
            name: d.name,
            phone: d.phoneNumber || '',
            vehicleInfo: v ? `${v.type} - ${v.plateNumber}` : 'N/A',
            profilePhoto, // *** NEW: Include profile photo
          };
        }
      }

      return { success: true, order: { ...orderData, driver: driverInfo } };
    }),

  // Get all pending offers for a specific order (HTTP)
  getOrderOffers: authProcedure
    .input(z.object({ orderId: z.string() }))
    .handler(async ({ input, context }) => {
      const { orderId } = input;
      const customerId = context.user.id;

      try {

      // Verify order belongs to customer
      const orderData = await db.select()
        .from(order)
        .where(and(eq(order.id, orderId), eq(order.customerId, customerId)))
        .limit(1);

      if (!orderData.length) {
        throw new Error('Order not found or access denied');
      }

      const offers = await db.select({
        offer: driverOffer,
        driver: user,
        vehicle: vehicle,
      })
        .from(driverOffer)
        .innerJoin(user, eq(driverOffer.driverId, user.id))
        .leftJoin(vehicle, eq(vehicle.driverId, user.id))
        .where(and(eq(driverOffer.orderId, orderId), eq(driverOffer.status, offerStatus.PENDING)));

      // Get profile photos and vehicle images from uploadedFile table
      const driverIds = offers.map(o => o.driver.id);

      // Get profile photos for drivers
      const profilePhotos = driverIds.length > 0 
        ? await db.select()
            .from(uploadedFile)
            .where(
              and(
                inArray(uploadedFile.userId, driverIds),
                eq(uploadedFile.documentType, 'profile_photo')
              )
            )
        : [];

      // Get vehicle images for drivers
      const vehicleImages = driverIds.length > 0
        ? await db.select()
            .from(uploadedFile)
            .where(
              and(
                inArray(uploadedFile.userId, driverIds),
                eq(uploadedFile.documentType, 'vehicle_photo')
              )
            )
        : [];

      const profilePhotoMap = new Map(profilePhotos.map(p => [p.userId, p.fileName]));
      const vehicleImageMap = new Map(vehicleImages.map(v => [v.userId, v.fileName]));

      console.log('📸 Profile photos found:', profilePhotos.length);
      console.log('🚗 Vehicle images found:', vehicleImages.length);
      console.log('🗺️ Profile photo map:', Array.from(profilePhotoMap.entries()));
      console.log('🗺️ Vehicle image map:', Array.from(vehicleImageMap.entries()));

      const formattedOffers = offers.map(o => {
        const driverProfilePhoto = profilePhotoMap.get(o.driver.id);
        const driverVehicleImage = vehicleImageMap.get(o.driver.id);
        
        return {
          id: o.offer.id,
          driverId: o.offer.driverId,
          driverName: o.driver.name,
          driverPhone: o.driver.phoneNumber,
          driverImage: driverProfilePhoto ? `profile_photo/${driverProfilePhoto}` : null,
          vehicleInfo: o.vehicle ? `${o.vehicle.type} - ${o.vehicle.plateNumber}` : 'N/A',
          vehicleType: o.vehicle?.type || 'N/A',
          vehicleImage: driverVehicleImage ? `vehicle_photo/${driverVehicleImage}` : null,
          plateNumber: o.vehicle?.plateNumber || 'N/A',
          offeredPrice: o.offer.offeredPrice,
          createdAt: o.offer.createdAt,
        };
      });

      console.log('📦 Formatted offers:', JSON.stringify(formattedOffers, null, 2));

        return { success: true, offers: formattedOffers };
      } catch (error) {
        console.error('[order.getOrderOffers] failed', { orderId, customerId, error })
        throw error
      }
    }),

  // Task 2: Accept Offer with Escrow Lock in Database Transaction
  acceptOffer: authProcedure
    .input(z.object({ offerId: z.string() }))
    .handler(async ({ input, context }) => {
      const { offerId } = input;
      const customerId = context.user.id;

      return await db.transaction(async (tx) => {
        // 1. Get offer with order info
        const offerData = await tx
          .select({
            offer: driverOffer,
            order: order,
          })
          .from(driverOffer)
          .innerJoin(order, eq(driverOffer.orderId, order.id))
          .where(eq(driverOffer.id, offerId))
          .limit(1);

        if (!offerData.length || !offerData[0]) {
          throw new Error('Offer not found');
        }

        const { offer: currentOffer, order: orderInfo } = offerData[0];

        // 2. Verify order belongs to customer
        if (orderInfo.customerId !== customerId) {
          throw new Error('Access denied');
        }

        // 3. Verify offer status
        if (currentOffer.status !== offerStatus.PENDING) {
          throw new Error('Offer is no longer available');
        }

        if (orderInfo.status !== orderStatus.APPROVED && orderInfo.status !== orderStatus.HAS_OFFERS) {
          throw new Error('Order is not available for acceptance');
        }

        const offerBudget = parseFloat(currentOffer.offeredPrice);

        // 4. Verify Shipper wallet has enough available balance for total escrow hold
        const [customerWallet] = await tx
          .select()
          .from(wallet)
          .where(eq(wallet.userId, customerId))
          .limit(1);

        if (!customerWallet) {
          throw new Error('INSUFFICIENT_BALANCE:Wallet not found. Please create or top up your wallet.');
        }

        const availableBalance = parseFloat(customerWallet.balance || '0');
        const reservedBalance = parseFloat(customerWallet.reservedBalance || '0');

        if (availableBalance < offerBudget) {
          throw new Error(
            `INSUFFICIENT_BALANCE:Insufficient funds in available balance. You need ${offerBudget.toFixed(
              2
            )} ETB to secure this shipment in escrow, but currently have ${availableBalance.toFixed(
              2
            )} ETB available. Please top up your wallet.`
          );
        }

        // 5. Escrow Hold: Move order budget from available balance to reserved balance
        const newAvailable = (availableBalance - offerBudget).toFixed(2);
        const newReserved = (reservedBalance + offerBudget).toFixed(2);

        await tx
          .update(wallet)
          .set({
            balance: newAvailable,
            reservedBalance: newReserved,
          })
          .where(eq(wallet.userId, customerId));

        // 6. Log Escrow Hold in Wallet Transaction Ledger
        await tx.insert(walletTransaction).values({
          id: `tx_escrow_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
          userId: customerId,
          walletId: customerWallet.id,
          type: 'escrow_lock',
          amount: offerBudget.toFixed(2),
          description: `Secured in escrow for order #${orderInfo.id}`,
          status: 'completed',
          referenceId: orderInfo.id,
        });

        // 7. Update offer status to accepted
        await tx
          .update(driverOffer)
          .set({
            status: offerStatus.ACCEPTED,
            respondedAt: new Date(),
          })
          .where(eq(driverOffer.id, offerId));

        // 8. Reject other pending offers for this order
        await tx
          .update(driverOffer)
          .set({
            status: offerStatus.REJECTED,
            respondedAt: new Date(),
          })
          .where(
            and(
              eq(driverOffer.orderId, orderInfo.id),
              eq(driverOffer.status, offerStatus.PENDING),
              ne(driverOffer.id, offerId)
            )
          );

        // 9. Reject all other pending offers from this driver (across all orders)
        const otherDriverOffers = await tx
          .select({
            id: driverOffer.id,
            orderId: driverOffer.orderId,
          })
          .from(driverOffer)
          .where(
            and(
              eq(driverOffer.driverId, currentOffer.driverId),
              eq(driverOffer.status, offerStatus.PENDING),
              ne(driverOffer.id, offerId)
            )
          );

        if (otherDriverOffers.length > 0) {
          await tx
            .update(driverOffer)
            .set({
              status: offerStatus.REJECTED,
              respondedAt: new Date(),
            })
            .where(
              and(
                eq(driverOffer.driverId, currentOffer.driverId),
                eq(driverOffer.status, offerStatus.PENDING),
                ne(driverOffer.id, offerId)
              )
            );
        }

        // 10. Assign order to driver with final agreed price & status in_transit / assigned
        await tx
          .update(order)
          .set({
            driverId: currentOffer.driverId,
            finalPrice: currentOffer.offeredPrice,
            status: orderStatus.ASSIGNED,
            assignedAt: new Date(),
          })
          .where(eq(order.id, orderInfo.id));

        return {
          success: true,
          message: `Offer accepted! ${offerBudget.toFixed(2)} ETB locked safely in escrow. Driver assigned.`,
          orderId: orderInfo.id,
          lockedAmount: offerBudget,
        };
      });
    }),

  // Alias lockFunds for explicit escrow lock mutation
  lockFunds: authProcedure
    .input(z.object({ offerId: z.string() }))
    .handler(async ({ input, context }) => {
      const { offerId } = input;
      const customerId = context.user.id;

      return await db.transaction(async (tx) => {
        const offerData = await tx
          .select({
            offer: driverOffer,
            order: order,
          })
          .from(driverOffer)
          .innerJoin(order, eq(driverOffer.orderId, order.id))
          .where(eq(driverOffer.id, offerId))
          .limit(1);

        if (!offerData.length || !offerData[0]) {
          throw new Error('Offer not found');
        }

        const { offer: currentOffer, order: orderInfo } = offerData[0];

        if (orderInfo.customerId !== customerId) {
          throw new Error('Access denied');
        }

        const offerBudget = parseFloat(currentOffer.offeredPrice);

        const [customerWallet] = await tx
          .select()
          .from(wallet)
          .where(eq(wallet.userId, customerId))
          .limit(1);

        if (!customerWallet) {
          throw new Error('INSUFFICIENT_BALANCE:Wallet not found.');
        }

        const availableBalance = parseFloat(customerWallet.balance || '0');
        const reservedBalance = parseFloat(customerWallet.reservedBalance || '0');

        if (availableBalance < offerBudget) {
          throw new Error(
            `INSUFFICIENT_BALANCE:Insufficient funds in available balance. You need ${offerBudget.toFixed(
              2
            )} ETB but have ${availableBalance.toFixed(2)} ETB available.`
          );
        }

        await tx
          .update(wallet)
          .set({
            balance: (availableBalance - offerBudget).toFixed(2),
            reservedBalance: (reservedBalance + offerBudget).toFixed(2),
          })
          .where(eq(wallet.userId, customerId));

        await tx.insert(walletTransaction).values({
          id: `tx_lock_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
          userId: customerId,
          walletId: customerWallet.id,
          type: 'escrow_lock',
          amount: offerBudget.toFixed(2),
          description: `Locked in escrow for order #${orderInfo.id}`,
          status: 'completed',
          referenceId: orderInfo.id,
        });

        await tx
          .update(order)
          .set({
            driverId: currentOffer.driverId,
            finalPrice: currentOffer.offeredPrice,
            status: orderStatus.ASSIGNED,
            assignedAt: new Date(),
          })
          .where(eq(order.id, orderInfo.id));

        return {
          success: true,
          message: `Escrow hold successful: ${offerBudget.toFixed(2)} ETB locked.`,
          orderId: orderInfo.id,
          lockedAmount: offerBudget,
        };
      });
    }),

  // Task 3: Delivery Confirmation & Payout Split in Database Transaction
  confirmDelivery: authProcedure
    .input(z.object({ orderId: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      const { orderId } = input;
      const currentUserId = context.user.id;

      return await db.transaction(async (tx) => {
        // 1. Fetch Order
        const [orderData] = await tx
          .select()
          .from(order)
          .where(eq(order.id, orderId))
          .limit(1);

        if (!orderData) {
          throw new Error('Order not found');
        }

        // 2. Permission check: customer (shipper) or admin
        const isCustomer = orderData.customerId === currentUserId;
        const isAdmin = context.user.role === 'admin';
        if (!isCustomer && !isAdmin) {
          throw new Error('Only the shipper or an admin can confirm delivery and release escrow.');
        }

        if (orderData.status === orderStatus.COMPLETED) {
          throw new Error('Order has already been completed.');
        }

        if (!orderData.driverId) {
          throw new Error('Cannot complete delivery on an unassigned order.');
        }

        const totalBudget = parseFloat(orderData.finalPrice || orderData.estimatedPrice || '0');
        if (totalBudget <= 0) {
          throw new Error('Invalid order budget amount for escrow payout.');
        }

        // 3. Platform Fee Calculation (10% standard platform commission)
        const PLATFORM_FEE_PERCENTAGE = 0.10;
        const platformFee = parseFloat((totalBudget * PLATFORM_FEE_PERCENTAGE).toFixed(2));
        const driverPayout = parseFloat((totalBudget - platformFee).toFixed(2));

        // 4. Deduct total budget from Shipper's reserved_balance
        const [shipperWallet] = await tx
          .select()
          .from(wallet)
          .where(eq(wallet.userId, orderData.customerId))
          .limit(1);

        if (shipperWallet) {
          const currentReserved = parseFloat(shipperWallet.reservedBalance || '0');
          const newReserved = Math.max(0, currentReserved - totalBudget).toFixed(2);
          await tx
            .update(wallet)
            .set({ reservedBalance: newReserved })
            .where(eq(wallet.userId, orderData.customerId));

          // Log escrow release
          await tx.insert(walletTransaction).values({
            id: `tx_rel_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
            userId: orderData.customerId,
            walletId: shipperWallet.id,
            type: 'escrow_release',
            amount: totalBudget.toFixed(2),
            description: `Escrow released upon delivery confirmation for order #${orderId}`,
            status: 'completed',
            referenceId: orderId,
          });
        }

        // 5. Credit Driver's available balance
        let [driverWallet] = await tx
          .select()
          .from(wallet)
          .where(eq(wallet.userId, orderData.driverId))
          .limit(1);

        if (!driverWallet) {
          const newWalletId = crypto.randomUUID();
          await tx.insert(wallet).values({
            id: newWalletId,
            userId: orderData.driverId,
            balance: driverPayout.toFixed(2),
            reservedBalance: '0.00',
            totalTopup: '0.00',
            totalWithdrawn: '0.00',
          });
        } else {
          const driverBal = parseFloat(driverWallet.balance || '0');
          const newDriverBal = (driverBal + driverPayout).toFixed(2);
          await tx
            .update(wallet)
            .set({ balance: newDriverBal })
            .where(eq(wallet.userId, orderData.driverId));

          await tx.insert(walletTransaction).values({
            id: `tx_pay_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
            userId: orderData.driverId,
            walletId: driverWallet.id,
            type: 'payout',
            amount: driverPayout.toFixed(2),
            description: `Payout for delivered load #${orderId} (90%)`,
            status: 'completed',
            referenceId: orderId,
          });
        }

        // 6. Record Platform Commission in `commissions` table
        const commissionId = `comm_${crypto.randomUUID()}`;
        await tx.insert(commissions).values({
          id: commissionId,
          orderId: orderId,
          amount: platformFee.toFixed(2),
          status: 'collected',
        });

        // Credit Platform Fee to Admin/Platform Wallet if exists
        const [platformWallet] = await tx
          .select()
          .from(wallet)
          .where(eq(wallet.userId, PLATFORM_USER_ID))
          .limit(1);

        if (platformWallet) {
          const platBal = parseFloat(platformWallet.balance || '0');
          await tx
            .update(wallet)
            .set({ balance: (platBal + platformFee).toFixed(2) })
            .where(eq(wallet.userId, PLATFORM_USER_ID));
        }

        // 7. Update Order Status to Completed
        await tx
          .update(order)
          .set({
            status: orderStatus.COMPLETED,
            completedAt: new Date(),
          })
          .where(eq(order.id, orderId));

        return {
          success: true,
          message: `Delivery confirmed! ${driverPayout.toLocaleString()} ETB transferred to driver. Platform fee: ${platformFee.toLocaleString()} ETB collected.`,
          orderId,
          driverPayout,
          platformFee,
        };
      });
    }),

  // Task 4: Proof of Delivery (PoD) with PIN, Geofenced Paper Waybill, or Remote Shipper Approval
  completeWithPoD: authProcedure
    .input(z.object({
      orderId: z.string().min(1),
      pin: z.string().optional(),
      waybillPhoto: z.string().optional(),
      cargoPhoto: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      fallbackMethod: z.enum(['receiver_pin', 'shipper_remote', 'signed_waybill', 'callcenter_override']).optional(),
      note: z.string().optional(),
    }))
    .handler(async ({ input, context }) => {
      const { orderId, pin, waybillPhoto, cargoPhoto, latitude, longitude, fallbackMethod } = input;
      const currentUserId = context.user.id;
      const currentUserRole = context.user.role;

      const result = await db.transaction(async (tx) => {
        // 1. Fetch Order
        const [orderData] = await tx
          .select()
          .from(order)
          .where(eq(order.id, orderId))
          .limit(1);

        if (!orderData) {
          throw new Error('Order not found');
        }

        if (orderData.status === orderStatus.COMPLETED) {
          throw new Error('Order has already been completed.');
        }

        if (!orderData.driverId) {
          throw new Error('Cannot complete an unassigned order.');
        }

        const isDriver = orderData.driverId === currentUserId;
        const isCustomer = orderData.customerId === currentUserId;
        const isAdminOrStaff = ['admin', 'call_center', 'town_manager'].includes(currentUserRole);

        if (!isDriver && !isCustomer && !isAdminOrStaff) {
          throw new Error('Unauthorized: Only the assigned driver, customer, or dispatch staff can complete this order.');
        }

        // 2. Validate Delivery Verification Method
        let verifiedMethod: 'receiver_pin' | 'shipper_remote' | 'signed_waybill' | 'callcenter_override' = 'receiver_pin';

        if (isCustomer || fallbackMethod === 'shipper_remote') {
          // Fallback 1: Shipper Remote Approval
          verifiedMethod = 'shipper_remote';
        } else if (isAdminOrStaff || fallbackMethod === 'callcenter_override') {
          // Fallback 3: Staff / Town Manager Override
          verifiedMethod = 'callcenter_override';
        } else if (pin && pin.trim().length > 0) {
          // Primary Path: 4-digit PIN verification
          const expectedPin = orderData.deliveryPin;
          if (expectedPin && pin.trim() !== expectedPin.trim()) {
            throw new Error('Invalid Delivery PIN. Please confirm the 4-digit code with the receiver or shipper.');
          }
          verifiedMethod = 'receiver_pin';
        } else if (waybillPhoto) {
          // Fallback 2: Geofenced Signed Paper Waybill Photo
          if (latitude && longitude && orderData.deliveryLatitude && orderData.deliveryLongitude) {
            const destLat = parseFloat(orderData.deliveryLatitude);
            const destLng = parseFloat(orderData.deliveryLongitude);

            const R = 6371; // km
            const dLat = ((destLat - latitude) * Math.PI) / 180;
            const dLon = ((destLng - longitude) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((latitude * Math.PI) / 180) *
                Math.cos((destLat * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const distKm = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

            if (distKm > 10) {
              throw new Error(`GPS Geofence: Driver location is ${distKm.toFixed(1)} km away from the delivery destination. Please move closer or use the receiver/shipper PIN.`);
            }
          }
          verifiedMethod = 'signed_waybill';

          // *** OPTION A: When NO PIN is available, hold for Town Manager 2-minute review before releasing money ***
          await tx
            .update(order)
            .set({
              status: orderStatus.DELIVERED,
              deliveredAt: new Date(),
              podWaybillPhoto: waybillPhoto,
              podCargoPhoto: cargoPhoto || null,
              podCompletedBy: 'signed_waybill_pending_review',
              podLatitude: latitude ? latitude.toString() : null,
              podLongitude: longitude ? longitude.toString() : null,
            })
            .where(eq(order.id, orderId));

          return {
            success: true,
            pendingManagerReview: true,
            message: 'Receipt photo uploaded! Local Town Manager has been alerted to review the stamped paper receipt. Payout will be released in 2-3 minutes upon review.',
            orderId,
            driverId: orderData.driverId,
            customerId: orderData.customerId,
            verifiedMethod: 'signed_waybill_pending_review',
          };
        } else {
          throw new Error('Proof of Delivery required: Please enter the 4-digit PIN, or upload a photo of the signed paper waybill receipt (ተቀባይ ደረሰኝ).');
        }

        // 3. Financial Settlement & Escrow Release (For Instant Verified PIN or Shipper Approval)
        const totalBudget = parseFloat(orderData.finalPrice || orderData.estimatedPrice || '0');
        if (totalBudget <= 0) {
          throw new Error('Invalid order budget amount for escrow payout.');
        }

        const PLATFORM_FEE_PERCENTAGE = 0.10;
        const platformFee = parseFloat((totalBudget * PLATFORM_FEE_PERCENTAGE).toFixed(2));
        const driverPayout = parseFloat((totalBudget - platformFee).toFixed(2));

        // Deduct from Shipper reservedBalance
        const [shipperWallet] = await tx
          .select()
          .from(wallet)
          .where(eq(wallet.userId, orderData.customerId))
          .limit(1);

        if (shipperWallet) {
          const currentReserved = parseFloat(shipperWallet.reservedBalance || '0');
          const newReserved = Math.max(0, currentReserved - totalBudget).toFixed(2);
          await tx
            .update(wallet)
            .set({ reservedBalance: newReserved })
            .where(eq(wallet.userId, orderData.customerId));

          await tx.insert(walletTransaction).values({
            id: `tx_rel_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
            userId: orderData.customerId,
            walletId: shipperWallet.id,
            type: 'escrow_release',
            amount: totalBudget.toFixed(2),
            description: `Escrow released upon verified delivery for order #${orderId} (${verifiedMethod})`,
            status: 'completed',
            referenceId: orderId,
          });
        }

        // Credit Driver balance
        let [driverWallet] = await tx
          .select()
          .from(wallet)
          .where(eq(wallet.userId, orderData.driverId))
          .limit(1);

        if (!driverWallet) {
          const newWalletId = crypto.randomUUID();
          await tx.insert(wallet).values({
            id: newWalletId,
            userId: orderData.driverId,
            balance: driverPayout.toFixed(2),
            reservedBalance: '0.00',
            totalTopup: driverPayout.toFixed(2),
            totalWithdrawn: '0.00',
          });
        } else {
          const driverBal = parseFloat(driverWallet.balance || '0');
          const newDriverBal = (driverBal + driverPayout).toFixed(2);
          const driverTopup = parseFloat(driverWallet.totalTopup || '0');
          await tx
            .update(wallet)
            .set({ 
              balance: newDriverBal,
              totalTopup: (driverTopup + driverPayout).toFixed(2),
              updatedAt: new Date()
            })
            .where(eq(wallet.userId, orderData.driverId));

          await tx.insert(walletTransaction).values({
            id: `tx_pay_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
            userId: orderData.driverId,
            walletId: driverWallet.id,
            type: 'payout',
            amount: driverPayout.toFixed(2),
            description: `Payout for delivered load #${orderId} (${verifiedMethod})`,
            status: 'completed',
            referenceId: orderId,
          });
        }

        // Record Platform Commission
        const commissionId = `comm_${crypto.randomUUID()}`;
        await tx.insert(commissions).values({
          id: commissionId,
          orderId: orderId,
          amount: platformFee.toFixed(2),
          status: 'collected',
        });

        // 4. Update Order with PoD details and COMPLETED status
        await tx
          .update(order)
          .set({
            status: orderStatus.COMPLETED,
            deliveredAt: orderData.deliveredAt || new Date(),
            completedAt: new Date(),
            podWaybillPhoto: waybillPhoto || null,
            podCargoPhoto: cargoPhoto || null,
            podCompletedBy: verifiedMethod,
            podLatitude: latitude ? latitude.toString() : null,
            podLongitude: longitude ? longitude.toString() : null,
          })
          .where(eq(order.id, orderId));

        return {
          success: true,
          pendingManagerReview: false,
          message: `Delivery successfully verified via ${verifiedMethod}! ${driverPayout.toLocaleString()} ETB credited to driver.`,
          orderId,
          driverId: orderData.driverId,
          customerId: orderData.customerId,
          driverPayout,
          platformFee,
          verifiedMethod,
        };
      });

      // If awaiting manager review (Option A: Paper waybill photo submitted without PIN),
      // do not release funds or calculate commissions yet. Notify parties and return.
      if (result.pendingManagerReview) {
        if (result.driverId) {
          await createNotification(result.driverId, {
            title: '📄 ደረሰኝ በግምገማ ላይ ነው (Receipt Under Review)',
            body: `Order #${orderId} paper receipt submitted. Town Manager / Call Center will verify and release payout in 2-3 minutes.`,
            type: 'order_delivered_pending_review',
            data: { orderId, status: orderStatus.DELIVERED },
          });
        }

        await createNotification(result.customerId, {
          title: '📦 ዕቃው ደርሷል (Cargo Arrived)',
          body: `Order #${orderId} driver uploaded signed paper receipt. Town manager is verifying proof of delivery.`,
          type: 'order_delivered_pending_review',
          data: { orderId, status: orderStatus.DELIVERED },
        });

        try {
          await notifyOrderSubscribers(orderId, {
            type: 'pod_pending_review',
            status: orderStatus.DELIVERED,
          });
        } catch (e) {
          console.error('[completeWithPoD] WebSocket broadcast error:', e);
        }

        return result;
      }

      // Post-transaction tasks for instantly verified PIN/Shipper approvals: commissions & notifications
      try {
        const { calculateCommission } = await import('../services/commission.js');
        await calculateCommission(orderId);
      } catch (e) {
        console.error('[completeWithPoD] Commission calculation error:', e);
      }

      if (result.driverId) {
        await createNotification(result.driverId, {
          title: '💰 Delivery Verified & Paid!',
          body: `Order #${orderId} verified (${result.verifiedMethod}). ${result.driverPayout} ETB credited to your wallet.`,
          type: 'order_completed',
          data: { orderId, status: orderStatus.COMPLETED },
        });
      }

      await createNotification(result.customerId, {
        title: '✅ Cargo Delivered & Completed',
        body: `Order #${orderId} has been successfully verified and completed.`,
        type: 'order_completed',
        data: { orderId, status: orderStatus.COMPLETED },
      });

      return result;
    }),

  // Town Manager / Call Center / Admin Approval of Paper Waybill Receipt (Option A)
  managerApprovePoD: authProcedure
    .input(z.object({
      orderId: z.string().min(1),
      approved: z.boolean(),
      rejectionReason: z.string().optional(),
    }))
    .handler(async ({ input, context }) => {
      const { orderId, approved, rejectionReason } = input;
      const currentUserRole = context.user.role;

      const allowedRoles = ['admin', 'call_center', 'town_manager'];
      if (!allowedRoles.includes(currentUserRole)) {
        throw new Error('Unauthorized: Only Town Managers, Call Center agents, or Admins can review Proof of Delivery.');
      }

      const [orderData] = await db
        .select()
        .from(order)
        .where(eq(order.id, orderId))
        .limit(1);

      if (!orderData) {
        throw new Error('Order not found');
      }

      if (orderData.status === orderStatus.COMPLETED) {
        throw new Error('Order is already completed and funds have been released.');
      }

      if (orderData.status !== orderStatus.DELIVERED) {
        throw new Error(`Cannot review PoD for order in status '${orderData.status}'. Order must be delivered.`);
      }

      if (!orderData.driverId) {
        throw new Error('Order does not have an assigned driver.');
      }

      // Rejection branch
      if (!approved) {
        await db
          .update(order)
          .set({
            podDisputeReason: rejectionReason || 'Waybill photo rejected. Please re-take a clear photo of the signed receipt.',
            podDisputedAt: new Date(),
            podCompletedBy: 'waybill_rejected_reupload_required',
          })
          .where(eq(order.id, orderId));

        if (orderData.driverId) {
          await createNotification(orderData.driverId, {
            title: '⚠️ ደረሰኝ አልተፈቀደም (Receipt Rejected)',
            body: rejectionReason || 'The paper receipt photo could not be verified. Please re-upload a clear photo or ask receiver for 4-digit PIN.',
            type: 'pod_rejected',
            data: { orderId, status: orderStatus.DELIVERED },
          });
        }

        try {
          await notifyOrderSubscribers(orderId, {
            type: 'pod_rejected',
            status: orderStatus.DELIVERED,
          });
        } catch (e) {}

        return {
          success: true,
          approved: false,
          message: 'Proof of Delivery receipt rejected. Driver notified to re-upload clear proof.',
          orderId,
        };
      }

      // Approval branch: Release escrow and credit driver
      const result = await db.transaction(async (tx) => {
        const totalBudget = parseFloat(orderData.finalPrice || orderData.estimatedPrice || '0');
        if (totalBudget <= 0) {
          throw new Error('Invalid order budget amount for escrow payout.');
        }

        const PLATFORM_FEE_PERCENTAGE = 0.10;
        const platformFee = parseFloat((totalBudget * PLATFORM_FEE_PERCENTAGE).toFixed(2));
        const driverPayout = parseFloat((totalBudget - platformFee).toFixed(2));

        // 1. Deduct from Shipper reservedBalance
        const [shipperWallet] = await tx
          .select()
          .from(wallet)
          .where(eq(wallet.userId, orderData.customerId))
          .limit(1);

        if (shipperWallet) {
          const currentReserved = parseFloat(shipperWallet.reservedBalance || '0');
          const newReserved = Math.max(0, currentReserved - totalBudget).toFixed(2);
          await tx
            .update(wallet)
            .set({ reservedBalance: newReserved })
            .where(eq(wallet.userId, orderData.customerId));

          await tx.insert(walletTransaction).values({
            id: `tx_rel_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
            userId: orderData.customerId,
            walletId: shipperWallet.id,
            type: 'escrow_release',
            amount: totalBudget.toFixed(2),
            description: `Escrow released upon Manager PoD verification for order #${orderId}`,
            status: 'completed',
            referenceId: orderId,
          });
        }

        // 2. Credit Driver balance
        let [driverWallet] = await tx
          .select()
          .from(wallet)
          .where(eq(wallet.userId, orderData.driverId!))
          .limit(1);

        if (!driverWallet) {
          const newWalletId = crypto.randomUUID();
          await tx.insert(wallet).values({
            id: newWalletId,
            userId: orderData.driverId!,
            balance: driverPayout.toFixed(2),
            reservedBalance: '0.00',
            totalTopup: driverPayout.toFixed(2),
            totalWithdrawn: '0.00',
          });
        } else {
          const driverBal = parseFloat(driverWallet.balance || '0');
          const newDriverBal = (driverBal + driverPayout).toFixed(2);
          const driverTopup = parseFloat(driverWallet.totalTopup || '0');
          await tx
            .update(wallet)
            .set({
              balance: newDriverBal,
              totalTopup: (driverTopup + driverPayout).toFixed(2),
              updatedAt: new Date(),
            })
            .where(eq(wallet.userId, orderData.driverId!));

          await tx.insert(walletTransaction).values({
            id: `tx_pay_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
            userId: orderData.driverId!,
            walletId: driverWallet.id,
            type: 'payout',
            amount: driverPayout.toFixed(2),
            description: `Payout for delivered load #${orderId} (Manager Approved PoD)`,
            status: 'completed',
            referenceId: orderId,
          });
        }

        // 3. Platform Commission record
        const commissionId = `comm_${crypto.randomUUID()}`;
        await tx.insert(commissions).values({
          id: commissionId,
          orderId: orderId,
          amount: platformFee.toFixed(2),
          status: 'collected',
        });

        // 4. Update order status to COMPLETED
        await tx
          .update(order)
          .set({
            status: orderStatus.COMPLETED,
            completedAt: new Date(),
            podCompletedBy: 'signed_waybill_manager_approved',
          })
          .where(eq(order.id, orderId));

        return {
          success: true,
          approved: true,
          driverPayout,
          platformFee,
          driverId: orderData.driverId,
          customerId: orderData.customerId,
        };
      });

      // Post-transaction commissions (e.g. Town Manager 1.5% and Referral bonus)
      try {
        const { calculateCommission } = await import('../services/commission.js');
        await calculateCommission(orderId);
      } catch (e) {
        console.error('[managerApprovePoD] Commission calculation error:', e);
      }

      // Notifications
      if (result.driverId) {
        await createNotification(result.driverId, {
          title: '💰 ደረሰኝ ጸድቋል! ክፍያ ገብቷል (PoD Approved & Paid)',
          body: `Order #${orderId} paper receipt approved by Manager. ${result.driverPayout} ETB credited to your wallet.`,
          type: 'order_completed',
          data: { orderId, status: orderStatus.COMPLETED },
        });
      }

      await createNotification(result.customerId, {
        title: '✅ ጭነት ሙሉ በሙሉ ተጠናቋል (Order Completed)',
        body: `Order #${orderId} delivery verified and completed by Manager.`,
        type: 'order_completed',
        data: { orderId, status: orderStatus.COMPLETED },
      });

      try {
        await notifyOrderSubscribers(orderId, {
          type: 'order_completed',
          status: orderStatus.COMPLETED,
        });
      } catch (e) {}

      return {
        success: true,
        approved: true,
        message: `Delivery approved! ${result.driverPayout.toLocaleString()} ETB credited to driver.`,
        orderId,
        driverPayout: result.driverPayout,
      };
    }),

  // Get orders pending Town Manager / Call Center PoD review
  getPendingPoDOrders: authProcedure
    .handler(async ({ context }) => {
      const allowedRoles = ['admin', 'call_center', 'town_manager'];
      if (!allowedRoles.includes(context.user.role)) {
        throw new Error('Unauthorized: Only Town Managers, Call Center agents, or Admins can access pending PoD reviews.');
      }

      const pendingOrders = await db
        .select({
          id: order.id,
          customerId: order.customerId,
          customerName: sql`customer.name`,
          customerPhone: sql`customer.phone_number`,
          driverId: order.driverId,
          driverName: sql`driver.name`,
          driverPhone: sql`driver.phone_number`,
          pickupAddress: order.pickupAddress,
          deliveryAddress: order.deliveryAddress,
          materials: order.materials,
          vehicleType: order.vehicleType,
          status: order.status,
          estimatedPrice: order.estimatedPrice,
          finalPrice: order.finalPrice,
          deliveryPin: order.deliveryPin,
          consigneeName: order.consigneeName,
          consigneePhone: order.consigneePhone,
          podWaybillPhoto: order.podWaybillPhoto,
          podCargoPhoto: order.podCargoPhoto,
          podCompletedBy: order.podCompletedBy,
          podLatitude: order.podLatitude,
          podLongitude: order.podLongitude,
          podDisputeReason: order.podDisputeReason,
          podDisputedAt: order.podDisputedAt,
          deliveredAt: order.deliveredAt,
          createdAt: order.createdAt,
        })
        .from(order)
        .leftJoin(sql`\`user\` \`customer\``, sql`customer.id = ${order.customerId}`)
        .leftJoin(sql`\`user\` \`driver\``, sql`driver.id = ${order.driverId}`)
        .where(
          and(
            eq(order.status, orderStatus.DELIVERED),
            or(
              eq(order.podCompletedBy, 'signed_waybill_pending_review'),
              eq(order.podCompletedBy, 'waybill_rejected_reupload_required')
            )
          )
        )
        .orderBy(desc(order.deliveredAt));

      return {
        success: true,
        orders: pendingOrders,
      };
    }),

  // Report delivery dispute
  reportPoDDispute: authProcedure
    .input(z.object({
      orderId: z.string().min(1),
      reason: z.string().min(3),
    }))
    .handler(async ({ input, context }) => {
      const { orderId, reason } = input;
      const [orderData] = await db
        .select()
        .from(order)
        .where(eq(order.id, orderId))
        .limit(1);

      if (!orderData) throw new Error('Order not found');

      await db
        .update(order)
        .set({
          podDisputeReason: reason,
          podDisputedAt: new Date(),
        })
        .where(eq(order.id, orderId));

      return { success: true, message: 'Dispute recorded. Local Town Manager and Call Center have been alerted.' };
    }),

  // Get driver's offers with status (for driver orders page)
  getMyOffers: driverProcedure
    .handler(async ({ context }) => {
      const driverId = context.user.id;

      // Get all offers by this driver with order details
      const offers = await db.select({
        offer: driverOffer,
        order: order,
      })
        .from(driverOffer)
        .innerJoin(order, eq(driverOffer.orderId, order.id))
        .where(eq(driverOffer.driverId, driverId))
        .orderBy(desc(driverOffer.createdAt));

      const formattedOffers = offers.map(o => ({
        id: o.offer.id,
        orderId: o.order.id,
        offeredPrice: o.offer.offeredPrice,
        status: o.offer.status, // pending, accepted, rejected, cancelled
        createdAt: o.offer.createdAt,
        respondedAt: o.offer.respondedAt,
        // Order details
        pickupAddress: o.order.pickupAddress,
        deliveryAddress: o.order.deliveryAddress,
        materials: o.order.materials,
        vehicleType: o.order.vehicleType,
        orderStatus: o.order.status,
      }));

      return { success: true, offers: formattedOffers };
    }),

  // Cancel order (NO REFUNDS - payment happens after delivery)
  cancel: authProcedure
    .input(z.object({ 
      orderId: z.string(),
    }))
    .handler(async ({ input, context }) => {
      try {
        const orderData = await db.query.order.findFirst({
          where: and(
            eq(order.id, input.orderId),
            eq(order.customerId, context.user.id)
          ),
        });

        if (!orderData) {
          throw new Error('Order not found');
        }

        // Can't cancel completed or already cancelled orders
        if (orderData.status === orderStatus.COMPLETED || orderData.status === orderStatus.CANCELLED) {
          throw new Error(`Cannot cancel order that is ${orderData.status}`);
        }

        // Can't cancel rejected orders
        if (orderData.status === orderStatus.REJECTED) {
          throw new Error('Cannot cancel rejected order');
        }

        // Can't cancel if driver marked as DELIVERED
        if (orderData.status === orderStatus.DELIVERED) {
          throw new Error('Cannot cancel order after delivery. The driver must receive full payment.');
        }

        // Check if driver has started delivery
        const driverHasStarted = orderData.status === orderStatus.ON_THE_WAY;
        
        if (driverHasStarted) {
          // Show warning but allow free cancellation
          console.log('[cancel] Driver has started but cancellation is free');
        }

        // Free cancellation regardless of driver status
        console.log('[cancel] Free cancellation for all orders');

      // Cancel the order
      await db.update(order)
        .set({ 
          status: orderStatus.CANCELLED,
        })
        .where(eq(order.id, input.orderId));

      // Create in-app notification for driver if assigned
      if (orderData.driverId) {
        await createNotification(orderData.driverId, {
          title: '❌ Order Cancelled',
          body: 'The order has been cancelled by the customer',
          type: 'order_cancelled',
          data: { 
            orderId: input.orderId, 
            status: orderStatus.CANCELLED,
          },
        });
      }

      // Reject all pending offers for this order
      await db.update(driverOffer)
        .set({
          status: offerStatus.REJECTED,
          respondedAt: new Date(),
        })
        .where(
          and(
            eq(driverOffer.orderId, input.orderId),
            eq(driverOffer.status, offerStatus.PENDING)
          )
        );

      // Notify subscribers
      await notifyOrderSubscribers(input.orderId, {
        status: orderStatus.CANCELLED,
      });

      return { 
        success: true, 
        message: 'Order cancelled successfully',
      };
      } catch (error) {
        throw error;
      }
    }),

  // Update order status (payment processed on COMPLETED)
  updateOrderStatus: authProcedure
    .input(z.object({ 
      orderId: z.string(),
      status: z.enum(['on_the_way', 'delivered', 'completed'])
    }))
    .handler(async ({ input, context }) => {
      const { orderId, status } = input;
      
      console.log('[updateOrderStatus] Starting:', { orderId, status, userId: context.user.id });
      
      const orderData = await db.query.order.findFirst({
        where: eq(order.id, orderId),
      });

      if (!orderData) {
        console.log('[updateOrderStatus] Order not found:', orderId);
        throw new Error('Order not found');
      }

      console.log('[updateOrderStatus] Order found:', {
        orderId: orderData.id,
        currentStatus: orderData.status,
        customerId: orderData.customerId,
        driverId: orderData.driverId,
        finalPrice: orderData.finalPrice,
      });

      // Verify user is either customer or driver
      const isCustomer = orderData.customerId === context.user.id;
      const isDriver = orderData.driverId === context.user.id;
      
      console.log('[updateOrderStatus] User verification:', { isCustomer, isDriver });
      
      if (!isCustomer && !isDriver) {
        console.log('[updateOrderStatus] Access denied');
        throw new Error('Access denied');
      }

      // Status transition validation
      if (status === 'on_the_way') {
        console.log('[updateOrderStatus] Validating on_the_way transition');
        if (orderData.status !== orderStatus.ASSIGNED) {
          console.log('[updateOrderStatus] Invalid status for on_the_way:', orderData.status);
          throw new Error('Can only start delivery from assigned status');
        }
        if (!isDriver) {
          console.log('[updateOrderStatus] Only driver can start delivery');
          throw new Error('Only driver can start delivery');
        }

        console.log('[updateOrderStatus] Creating notification for customer');
        // Create in-app notification for customer
        await createNotification(orderData.customerId, {
          title: '🚚 Driver On The Way',
          body: 'Your driver is on the way to pick up your order',
          type: 'order_on_the_way',
          data: { orderId, status: 'on_the_way' },
        });
      }

      if (status === 'delivered') {
        console.log('[updateOrderStatus] Validating delivered transition');
        if (orderData.status !== orderStatus.ON_THE_WAY) {
          console.log('[updateOrderStatus] Invalid status for delivered:', orderData.status);
          throw new Error('Can only mark as delivered from on_the_way status');
        }
        if (!isDriver) {
          console.log('[updateOrderStatus] Only driver can mark as delivered');
          throw new Error('Only driver can mark as delivered');
        }

        console.log('[updateOrderStatus] Creating notification for customer');
        // Create in-app notification for customer
        await createNotification(orderData.customerId, {
          title: '📦 Order Delivered',
          body: 'Your order has been delivered. Please confirm completion.',
          type: 'order_delivered',
          data: { orderId, status: 'delivered' },
        });
      }

      if (status === 'completed') {
        console.log('[updateOrderStatus] Processing completion (cash payment system)');
        if (orderData.status !== orderStatus.DELIVERED) {
          console.log('[updateOrderStatus] Invalid status for completed:', orderData.status);
          throw new Error('Can only complete from delivered status');
        }
        if (!isCustomer) {
          console.log('[updateOrderStatus] Only customer can confirm completion');
          throw new Error('Only customer can confirm completion');
        }

        // Simply update order status to completed (no wallet transactions)
        console.log('[updateOrderStatus] Updating order status to completed...');
        await db.update(order)
          .set({ 
            status: orderStatus.COMPLETED,
            completedAt: new Date(),
          })
          .where(eq(order.id, orderId));

        console.log('[updateOrderStatus] Creating notifications...');
        // Create in-app notification for driver
        if (orderData.driverId && orderData.finalPrice) {
          await createNotification(orderData.driverId, {
            title: '✅ Order Completed',
            body: `Order ${orderId} completed. You should have received ${orderData.finalPrice} ETB in cash.`,
            type: 'order_completed',
            data: { orderId, status: orderStatus.COMPLETED },
          });
        }

        // Create notification for customer
        await createNotification(orderData.customerId, {
          title: '✅ Order Completed',
          body: `Thank you! Your order has been completed.`,
          type: 'order_completed',
          data: { orderId, status: orderStatus.COMPLETED },
        });

        console.log('[updateOrderStatus] Checking referral completion...');
        // Check and complete referral if this is user's first order
        if (orderData.finalPrice) {
          await completeReferral(orderData.customerId, orderId, parseFloat(orderData.finalPrice));
        }

        // NEW: Calculate and process commissions
        const { calculateCommission } = await import('../services/commission.js');
        await calculateCommission(orderId);

        console.log(`[updateOrderStatus] ✅ Order completed successfully (cash payment system)`);
        
        return { 
          success: true, 
          message: `Order completed successfully. Driver was paid ${orderData.finalPrice} ETB in cash.`,
        };
      }

      console.log('[updateOrderStatus] Updating order status (non-payment)...');
      // Update order status for non-payment transitions
      const updateData: any = { status };
      if (status === 'on_the_way') {
        updateData.pickedUpAt = new Date();
      } else if (status === 'delivered') {
        updateData.deliveredAt = new Date();
      }

      await db.update(order)
        .set(updateData)
        .where(eq(order.id, orderId));

      console.log('[updateOrderStatus] ✅ Status updated successfully:', { orderId, newStatus: status });
      return { success: true, message: `Order status updated to ${status}` };
    }),

  // Public tracking endpoint
  publicTrackOrder: os
    .input(z.object({
      orderId: z.string(),
    }))
    .handler(async ({ input }) => {
      const { orderId } = input;
      
      const orderData = await db.select()
        .from(order)
        .where(eq(order.id, orderId))
        .limit(1);

      if (!orderData.length) {
        throw new Error('Order not found');
      }
      
      const targetOrder = orderData[0];
      if (!targetOrder) throw new Error('Order not found');
      
      let driverPhone = null;
      let driverName = null;
      let vehiclePlate = null;
      
      if (targetOrder.driverId) {
         const driverData = await db.select().from(user).where(eq(user.id, targetOrder.driverId)).limit(1);
         if (driverData.length && driverData[0]) {
            driverPhone = driverData[0].phoneNumber;
            driverName = driverData[0].name;
         }
         const vehicleData = await db.select().from(vehicle).where(eq(vehicle.driverId, targetOrder.driverId)).limit(1);
         if (vehicleData.length && vehicleData[0]) {
            vehiclePlate = vehicleData[0].plateNumber;
         }
      }

      return {
        success: true,
        order: {
          id: targetOrder.id,
          status: targetOrder.status,
          vehicleType: targetOrder.vehicleType,
          pickupAddress: targetOrder.pickupAddress,
          deliveryAddress: targetOrder.deliveryAddress,
          pickupLatitude: targetOrder.pickupLatitude,
          pickupLongitude: targetOrder.pickupLongitude,
          deliveryLatitude: targetOrder.deliveryLatitude,
          deliveryLongitude: targetOrder.deliveryLongitude,
          driverName,
          driverPhone,
          vehiclePlate
        }
      };
    }),
});

