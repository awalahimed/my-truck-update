import { wsAuthProcedure } from '../../middlewares/ws-auth.js';
import { z } from 'zod';
import { db } from '../../database/db.js';
import { order, orderStatus } from '../../database/schema/order-schema.js';
import { user } from '../../database/schema/auth-schema.js';
import { vehicle } from '../../database/schema/vehicle-schema.js';
import { driverOffer, offerStatus } from '../../database/schema/driver-offer-schema.js';
import { eq, and, ne } from 'drizzle-orm';
import { notifyCustomerOrderUpdate } from '../../utils/websocket-broadcast.js';
// Store active subscriptions: orderId -> Set of customer userIds
const orderSubscriptions = new Map();
export const customerController = {
    subscribeToOrderUpdates: wsAuthProcedure
        .input(z.object({ orderId: z.string() }))
        .handler(async ({ input, context }) => {
        const { orderId } = input;
        const customerId = context.user.id;
        // Verify the order belongs to this customer
        const orderData = await db.select()
            .from(order)
            .where(eq(order.id, orderId))
            .limit(1);
        const targetOrder = orderData[0];
        if (!targetOrder || targetOrder.customerId !== customerId) {
            throw new Error('Order not found or access denied');
        }
        // Add subscription
        if (!orderSubscriptions.has(orderId)) {
            orderSubscriptions.set(orderId, new Set());
        }
        orderSubscriptions.get(orderId).add(customerId);
        return { success: true, message: 'Subscribed to order updates' };
    }),
    unsubscribeFromOrderUpdates: wsAuthProcedure
        .input(z.object({ orderId: z.string() }))
        .handler(async ({ input, context }) => {
        const { orderId } = input;
        const customerId = context.user.id;
        const subscriptions = orderSubscriptions.get(orderId);
        if (subscriptions) {
            subscriptions.delete(customerId);
            if (subscriptions.size === 0) {
                orderSubscriptions.delete(orderId);
            }
        }
        return { success: true, message: 'Unsubscribed from order updates' };
    }),
    getMyOrders: wsAuthProcedure
        .handler(async ({ context }) => {
        const orders = await db.select()
            .from(order)
            .where(eq(order.customerId, context.user.id))
            .orderBy(order.createdAt);
        return { orders };
    }),
    // Get all offers for a specific order
    getOrderOffers: wsAuthProcedure
        .input(z.object({ orderId: z.string() }))
        .handler(async ({ input, context }) => {
        const { orderId } = input;
        const customerId = context.user.id;
        // Verify order belongs to customer
        const orderData = await db.select()
            .from(order)
            .where(and(eq(order.id, orderId), eq(order.customerId, customerId)))
            .limit(1);
        if (!orderData.length) {
            throw new Error('Order not found or access denied');
        }
        // Get all pending offers for this order with driver info
        const offers = await db.select({
            offer: driverOffer,
            driver: user,
            vehicle: vehicle,
        })
            .from(driverOffer)
            .innerJoin(user, eq(driverOffer.driverId, user.id))
            .leftJoin(vehicle, eq(vehicle.driverId, user.id))
            .where(and(eq(driverOffer.orderId, orderId), eq(driverOffer.status, offerStatus.PENDING)));
        // Format offers with driver info
        const formattedOffers = offers.map(o => ({
            id: o.offer.id,
            driverId: o.offer.driverId,
            driverName: o.driver.name,
            driverPhone: o.driver.phoneNumber,
            vehicleInfo: o.vehicle ? `${o.vehicle.type} - ${o.vehicle.plateNumber}` : 'N/A',
            offeredPrice: o.offer.offeredPrice,
            createdAt: o.offer.createdAt,
        }));
        return { offers: formattedOffers };
    }),
    // Accept a driver offer
    acceptOffer: wsAuthProcedure
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
        if (!row)
            throw new Error('Offer not found');
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
            .where(and(eq(driverOffer.orderId, orderInfo.id), eq(driverOffer.status, offerStatus.PENDING), ne(driverOffer.id, offerId) // Not equal to accepted offer
        ));
        // IMPORTANT: Reject all other pending offers from this driver (across all orders)
        // This prevents the same driver from being accepted by multiple customers
        const otherDriverOffers = await db.select({
            id: driverOffer.id,
            orderId: driverOffer.orderId,
        })
            .from(driverOffer)
            .where(and(eq(driverOffer.driverId, offer.driverId), eq(driverOffer.status, offerStatus.PENDING), ne(driverOffer.id, offerId)));
        if (otherDriverOffers.length > 0) {
            // Reject all other offers from this driver
            await db.update(driverOffer)
                .set({
                status: offerStatus.REJECTED,
                respondedAt: new Date(),
            })
                .where(and(eq(driverOffer.driverId, offer.driverId), eq(driverOffer.status, offerStatus.PENDING), ne(driverOffer.id, offerId)));
            // Notify other customers that this driver's offer is no longer available
            for (const otherOffer of otherDriverOffers) {
                await notifyOrderSubscribers(otherOffer.orderId, {
                    type: 'offer_removed',
                    offerId: otherOffer.id,
                    driverId: offer.driverId,
                    reason: 'Driver accepted another order',
                });
            }
        }
        // Update order to assigned
        await db.update(order)
            .set({
            driverId: offer.driverId,
            finalPrice: offer.offeredPrice,
            status: orderStatus.ASSIGNED,
            assignedAt: new Date(),
        })
            .where(eq(order.id, orderInfo.id));
        // Notify customer about assignment
        await notifyOrderSubscribers(orderInfo.id, {
            status: orderStatus.ASSIGNED,
            driverId: offer.driverId,
            finalPrice: offer.offeredPrice,
        });
        // *** NEW: Send WebSocket push notification to driver about assignment
        const { notifyDriverOrderAssigned } = await import('../../utils/websocket-broadcast.js');
        await notifyDriverOrderAssigned(offer.driverId, orderInfo.id);
        return { success: true, message: 'Offer accepted, driver assigned. Payment will be processed after delivery.' };
    }),
    // Reject a driver offer
    rejectOffer: wsAuthProcedure
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
        if (!row)
            throw new Error('Offer not found');
        const { offer, order: orderInfo } = row;
        // Verify order belongs to customer
        if (orderInfo.customerId !== customerId) {
            throw new Error('Access denied');
        }
        // Verify offer is still pending
        if (offer.status !== offerStatus.PENDING) {
            throw new Error('Offer is no longer available');
        }
        // Update offer status to rejected
        await db.update(driverOffer)
            .set({
            status: offerStatus.REJECTED,
            respondedAt: new Date(),
        })
            .where(eq(driverOffer.id, offerId));
        return { success: true, message: 'Offer rejected' };
    }),
};
// Export function to notify subscribers of an order update
export const notifyOrderSubscribers = async (orderId, updateData) => {
    const subscriptions = orderSubscriptions.get(orderId);
    // Get order data
    const orderData = await db.select()
        .from(order)
        .where(eq(order.id, orderId))
        .limit(1);
    if (!orderData.length)
        return;
    const orderInfo = orderData[0];
    if (!orderInfo)
        return;
    let driverInfo = null;
    // If driver is assigned, get driver and vehicle info
    if (orderInfo.driverId) {
        const driverData = await db.select({
            id: user.id,
            name: user.name,
            phoneNumber: user.phoneNumber,
        })
            .from(user)
            .where(eq(user.id, orderInfo.driverId))
            .limit(1);
        if (driverData.length) {
            const vehicleData = await db.select({
                type: vehicle.type,
                plateNumber: vehicle.plateNumber,
            })
                .from(vehicle)
                .where(eq(vehicle.driverId, orderInfo.driverId))
                .limit(1);
            driverInfo = {
                id: driverData[0].id,
                name: driverData[0].name,
                phone: driverData[0].phoneNumber,
                vehicleInfo: vehicleData[0]
                    ? `${vehicleData[0].type} - ${vehicleData[0].plateNumber}`
                    : 'N/A',
            };
        }
    }
    const notification = {
        type: 'order_update',
        orderId,
        status: orderInfo.status,
        driver: driverInfo,
        ...updateData,
    };
    // If no active subscription, still notify the order owner directly (so real-time updates work without explicit subscribe).
    const recipients = new Set();
    subscriptions?.forEach(id => recipients.add(id));
    if (recipients.size === 0 && orderInfo.customerId) {
        recipients.add(orderInfo.customerId);
    }
    recipients.forEach(customerId => {
        notifyCustomerOrderUpdate(customerId, notification);
    });
};
// Export function to notify customer about new offer
export const notifyCustomerNewOffer = async (orderId, offerData) => {
    const subscriptions = orderSubscriptions.get(orderId);
    // If nobody explicitly subscribed, we still want to notify the order owner.
    let fallbackCustomerId = null;
    if (!subscriptions || subscriptions.size === 0) {
        const orderData = await db.select()
            .from(order)
            .where(eq(order.id, orderId))
            .limit(1);
        fallbackCustomerId = orderData[0]?.customerId ?? null;
    }
    // Get driver info
    const driverData = await db.select({
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
    })
        .from(user)
        .where(eq(user.id, offerData.driverId))
        .limit(1);
    if (!driverData.length)
        return;
    const d = driverData[0];
    if (!d)
        return;
    const vehicleData = await db.select({
        type: vehicle.type,
        plateNumber: vehicle.plateNumber,
    })
        .from(vehicle)
        .where(eq(vehicle.driverId, offerData.driverId))
        .limit(1);
    const notification = {
        type: 'new_offer',
        orderId,
        offer: {
            id: offerData.offerId,
            driverId: offerData.driverId,
            driverName: d.name,
            driverPhone: d.phoneNumber,
            vehicleInfo: vehicleData[0]
                ? `${vehicleData[0].type} - ${vehicleData[0].plateNumber}`
                : 'N/A',
            offeredPrice: offerData.offeredPrice,
        },
    };
    const recipients = new Set();
    subscriptions?.forEach(id => recipients.add(id));
    if (fallbackCustomerId)
        recipients.add(fallbackCustomerId);
    recipients.forEach(customerId => {
        notifyCustomerOrderUpdate(customerId, notification);
    });
};
//# sourceMappingURL=customer.js.map