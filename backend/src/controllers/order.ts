import { z } from 'zod';
import { os } from '@orpc/server';
import { authProcedure, driverProcedure } from '../middlewares/auth.js';
import { db } from '../database/db.js';
import { order, orderStatus } from '../database/schema/order-schema.js';
import { user } from '../database/schema/auth-schema.js';
import { vehicle } from '../database/schema/vehicle-schema.js';
import { driverOffer, offerStatus } from '../database/schema/driver-offer-schema.js';
import { wallet } from '../database/schema/wallet-schema.js';
import { transaction, transactionType, paymentStatus } from '../database/schema/payment-schema.js';
import { uploadedFile } from '../database/schema/file-schema.js';
import { agentProfile } from '../database/schema/agent-schema.js';
import { notifyOrderSubscribers } from './websocket/customer.js';
import { createNotification } from '../services/notification.js';
import { completeReferral } from '../services/referral.js';
import { sendSMS } from '../utils/sms.js';
import { notifyAgentOrderAssigned } from '../utils/websocket-broadcast.js';
import { eq, and, desc, inArray, ne, sql } from 'drizzle-orm';

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
});

export const orderController = os.router({
  // Create new order
  create: authProcedure
    .input(createOrderSchema)
    .handler(async ({ input, context }) => {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
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

  // NEW: Get nearby agents for an order (sorted by distance to pickup)
  getNearbyAgents: authProcedure
    .input(z.object({ orderId: z.string() }))
    .handler(async ({ input, context }) => {
      const { orderId } = input;
      // Verify user is call center agent or admin
      if (context.user.role !== 'call_center' && context.user.role !== 'admin') {
        throw new Error('Only call center agents can access this')
      }

      // Fetch order
      const orderData = await db.select().from(order).where(eq(order.id, orderId)).limit(1)
      if (!orderData.length) throw new Error('Order not found')
      const orderInfo = orderData[0]

      // Fetch agents with profiles
      const agents = await db.select({
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
      }).from(user)
        .leftJoin((await import('../database/schema/agent-schema.js')).agentProfile, eq((await import('../database/schema/agent-schema.js')).agentProfile.userId, user.id))
        .where(eq(user.role, 'agent'))

      // Compute distances (Haversine) to pickup location
      const toNumber = (v: any) => (v === null || v === undefined) ? null : parseFloat(String(v))
      const lat1 = parseFloat(String(orderInfo.pickupLatitude))
      const lon1 = parseFloat(String(orderInfo.pickupLongitude))

      const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const toRad = (deg: number) => deg * Math.PI / 180
        const R = 6371000 // meters
        const dLat = toRad(lat2 - lat1)
        const dLon = toRad(lon2 - lon1)
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        return R * c
      }

      const agentProfiles = await db.select({
        userId: (await import('../database/schema/agent-schema.js')).agentProfile.userId,
        latitude: (await import('../database/schema/agent-schema.js')).agentProfile.latitude,
        longitude: (await import('../database/schema/agent-schema.js')).agentProfile.longitude,
      }).from((await import('../database/schema/agent-schema.js')).agentProfile)

      // Map agents by userId to profile
      const profileMap = new Map(agentProfiles.map((p: any) => [p.userId, p]))

      const agentsWithDistance = agents.map((a: any) => {
        const profile = profileMap.get(a.id)
        const lat2 = profile?.latitude ? parseFloat(String(profile.latitude)) : null
        const lon2 = profile?.longitude ? parseFloat(String(profile.longitude)) : null
        let distance = null
        if (lat2 !== null && lon2 !== null && !Number.isNaN(lat2) && !Number.isNaN(lon2)) {
          distance = haversine(lat1, lon1, lat2, lon2)
        }
        return {
          id: a.id,
          name: a.name,
          phoneNumber: a.phoneNumber,
          latitude: profile?.latitude || null,
          longitude: profile?.longitude || null,
          distance,
        }
      }).filter((x: any) => x.distance !== null)

      agentsWithDistance.sort((a: any, b: any) => a.distance - b.distance)

      return { success: true, agents: agentsWithDistance }
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

  // Accept a driver offer (HTTP)
  acceptOffer: authProcedure
    .input(z.object({ offerId: z.string() }))
    .handler(async ({ input, context }) => {
      const { offerId } = input;
      const customerId = context.user.id;

      // Get offer with order info
      const offerData = await db.select({
        offer: driverOffer,
        order: order,
      })
        .from(driverOffer)
        .innerJoin(order, eq(driverOffer.orderId, order.id))
        .where(eq(driverOffer.id, offerId))
        .limit(1);

      if (!offerData.length) {
        throw new Error('Offer not found');
      }

      const row = offerData[0];
      if (!row) {
        throw new Error('Offer not found');
      }

      const { offer, order: orderInfo } = row;

      // Verify order belongs to customer
      if (orderInfo.customerId !== customerId) {
        throw new Error('Access denied');
      }

      // Verify offer is still pending
      if (offer.status !== offerStatus.PENDING) {
        throw new Error('Offer is no longer available');
      }

      // Verify order is approved or has offers
      if (orderInfo.status !== orderStatus.APPROVED && orderInfo.status !== orderStatus.HAS_OFFERS) {
        throw new Error('Order is not available for acceptance');
      }

      // *** Check wallet balance for platform fee only ***
      const customerWallet = await db.select()
        .from(wallet)
        .where(eq(wallet.userId, customerId))
        .limit(1);

      if (!customerWallet.length) {
        throw new Error('INSUFFICIENT_BALANCE:Wallet not found. Please contact support.');
      }

      const walletBalance = parseFloat(customerWallet[0]?.balance || '0');
      const offerPrice = parseFloat(offer.offeredPrice);
      const platformFee = offerPrice * PLATFORM_FEE_RATE; // 7% platform fee

      console.log('[acceptOffer] Platform fee calculation:', {
        walletBalance,
        offerPrice,
        platformFee,
        feeRate: `${PLATFORM_FEE_RATE * 100}%`,
        hasSufficientBalance: walletBalance >= platformFee,
      });

      if (walletBalance < platformFee) {
        throw new Error(`INSUFFICIENT_BALANCE:Insufficient balance for platform fee. You need ${platformFee.toFixed(2)} ETB platform fee but have ${walletBalance.toFixed(2)} ETB available. Please top up your wallet.`);
      }

      // Deduct platform fee from customer wallet immediately
      console.log('[acceptOffer] Deducting platform fee:', platformFee);
      await db.update(wallet)
        .set({
          balance: (walletBalance - platformFee).toFixed(2),
        })
        .where(eq(wallet.userId, customerId));

      // Transfer platform fee to admin wallet
      const platformWallet = await db.select()
        .from(wallet)
        .where(eq(wallet.userId, PLATFORM_USER_ID))
        .limit(1);

      if (platformWallet.length) {
        const platformBalance = parseFloat(platformWallet[0]?.balance || '0');
        await db.update(wallet)
          .set({
            balance: (platformBalance + platformFee).toFixed(2),
          })
          .where(eq(wallet.userId, PLATFORM_USER_ID));

        // Create transaction record for platform fee
        await db.insert(transaction).values({
          id: `txn_fee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: customerId,
          fromUserId: customerId,
          toUserId: PLATFORM_USER_ID,
          txRef: `fee_${orderInfo.id}_${Date.now()}`,
          amount: platformFee.toFixed(2),
          type: transactionType.AGENT_FEE,
          status: paymentStatus.SUCCESS,
          description: `Platform fee for order ${orderInfo.id} (7%)`,
        });

        console.log('[acceptOffer] ✅ Platform fee transferred to admin wallet');
      }

      console.log('[acceptOffer] ✅ Platform fee processed successfully');

      // Update offer status to accepted
      await db.update(driverOffer)
        .set({
          status: offerStatus.ACCEPTED,
          respondedAt: new Date(),
        })
        .where(eq(driverOffer.id, offerId));

      // Reject all other pending offers for this order
      await db.update(driverOffer)
        .set({
          status: offerStatus.REJECTED,
          respondedAt: new Date(),
        })
        .where(and(
          eq(driverOffer.orderId, orderInfo.id),
          eq(driverOffer.status, offerStatus.PENDING),
          ne(driverOffer.id, offerId)
        ));

      // IMPORTANT: Reject all other pending offers from this driver (across all orders)
      const otherDriverOffers = await db.select({
        id: driverOffer.id,
        orderId: driverOffer.orderId,
      })
      .from(driverOffer)
      .where(
        and(
          eq(driverOffer.driverId, offer.driverId),
          eq(driverOffer.status, offerStatus.PENDING),
          ne(driverOffer.id, offerId)
        )
      );

      if (otherDriverOffers.length > 0) {
        await db.update(driverOffer)
          .set({
            status: offerStatus.REJECTED,
            respondedAt: new Date(),
          })
          .where(
            and(
              eq(driverOffer.driverId, offer.driverId),
              eq(driverOffer.status, offerStatus.PENDING),
              ne(driverOffer.id, offerId)
            )
          );

        for (const otherOffer of otherDriverOffers) {
          await notifyOrderSubscribers(otherOffer.orderId, {
            type: 'offer_removed',
            offerId: otherOffer.id,
            driverId: offer.driverId,
            reason: 'Driver accepted another order',
          });
        }
      }

      // Update order to assigned (NO PAYMENT YET)
      await db.update(order)
        .set({
          driverId: offer.driverId,
          finalPrice: offer.offeredPrice,
          status: orderStatus.ASSIGNED,
          assignedAt: new Date(),
        })
        .where(eq(order.id, orderInfo.id));

      // Create in-app notifications
      await createNotification(customerId, {
        title: '🚗 Driver Assigned',
        body: `Driver assigned. Platform fee: ${platformFee.toFixed(2)} ETB paid. Pay driver ${offerPrice} ETB in cash.`,
        type: 'order_assigned',
        data: { orderId: orderInfo.id, status: orderStatus.ASSIGNED },
      });

      await createNotification(offer.driverId, {
        title: '✅ Offer Accepted',
        body: `Your offer accepted. Customer will pay ${offerPrice} ETB in cash.`,
        type: 'offer_accepted',
        data: { orderId: orderInfo.id, status: orderStatus.ASSIGNED },
      });

      // Notify subscribers
      await notifyOrderSubscribers(orderInfo.id, {
        status: orderStatus.ASSIGNED,
        driverId: offer.driverId,
        finalPrice: offer.offeredPrice,
      });

      // *** NEW: Send WebSocket push notification to driver about assignment
      const { notifyDriverOrderAssigned } = await import('../utils/websocket-broadcast.js');
      await notifyDriverOrderAssigned(offer.driverId, orderInfo.id);

      return { 
        success: true, 
        message: `Offer accepted! Platform fee of ${platformFee.toFixed(2)} ETB paid. Please pay driver ${offerPrice} ETB in cash upon delivery.` 
      };
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
});