import { wsDriverProcedure } from '../../middlewares/ws-auth.js';
import { z } from 'zod';
import { db } from '../../database/db.js';
import { order, orderStatus } from '../../database/schema/order-schema.js';
import { vehicle } from '../../database/schema/vehicle-schema.js';
import { driverOffer, offerStatus } from '../../database/schema/driver-offer-schema.js';
import { user } from '../../database/schema/auth-schema.js';
import { uploadedFile } from '../../database/schema/file-schema.js'; // *** NEW: Import uploadedFile
import { eq, and, inArray, or } from 'drizzle-orm';
import { notifyCustomerNewOffer } from './customer.js';
const createOfferSchema = z.object({
    orderId: z.string(),
    offeredPrice: z.number().positive(), // Price in Birr
});
const locationUpdateSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
});
export const driverController = {
    // Create an offer for an order
    createOffer: wsDriverProcedure
        .input(createOfferSchema)
        .handler(async ({ input, context }) => {
        const { orderId, offeredPrice } = input;
        const driverId = context.user.id;
        // Check if driver account is approved
        const driverUser = await db.select()
            .from(user)
            .where(eq(user.id, driverId))
            .limit(1);
        if (!driverUser.length || driverUser[0]?.accountStatus !== 'active') {
            throw new Error('Your account is pending approval. You cannot make offers yet.');
        }
        // Check if order exists and is approved
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
        // Only allow offers on APPROVED or HAS_OFFERS status
        if (targetOrder.status !== orderStatus.APPROVED && targetOrder.status !== orderStatus.HAS_OFFERS) {
            throw new Error('Order is not available for offers');
        }
        // Check if driver already has a pending offer for this order
        const existingOffer = await db.select()
            .from(driverOffer)
            .where(and(eq(driverOffer.orderId, orderId), eq(driverOffer.driverId, driverId), eq(driverOffer.status, offerStatus.PENDING)))
            .limit(1);
        if (existingOffer.length > 0 && existingOffer[0]) {
            // Update existing offer instead of creating a new one
            const existingOfferId = existingOffer[0].id;
            await db.update(driverOffer)
                .set({
                offeredPrice: offeredPrice.toString(),
                updatedAt: new Date()
            })
                .where(eq(driverOffer.id, existingOfferId));
            // Notify customer about updated offer
            await notifyCustomerNewOffer(orderId, {
                offerId: existingOfferId,
                driverId,
                offeredPrice: offeredPrice.toString(),
            });
            return { success: true, message: 'Offer updated successfully', offerId: existingOfferId };
        }
        // Check if driver is locked (has an assigned order)
        const assignedOrder = await db.select()
            .from(order)
            .where(and(eq(order.driverId, driverId), eq(order.status, orderStatus.ASSIGNED)))
            .limit(1);
        if (assignedOrder.length > 0) {
            throw new Error('You are currently locked to an assigned order. Complete that order before accepting new ones.');
        }
        // Create the offer
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
        // Create in-app notification for customer about new offer
        const { createNotification } = await import('../../services/notification.js');
        await createNotification(targetOrder.customerId, {
            title: '💰 New Offer Received',
            body: `A driver offered ${offeredPrice} ETB for your order`,
            type: 'new_offer',
            data: { orderId, offerId, offeredPrice: offeredPrice.toString() },
        });
        // Notify customer about new offer
        await notifyCustomerNewOffer(orderId, {
            offerId,
            driverId,
            offeredPrice: offeredPrice.toString(),
        });
        return { success: true, message: 'Offer submitted successfully', offerId };
    }),
    // Get available orders for driver (filtered by vehicle type)
    getAvailableOrders: wsDriverProcedure
        .handler(async ({ context }) => {
        const driverId = context.user.id;
        console.log('🔍 [getAvailableOrders] Checking for driver:', driverId);
        // Check if driver account is approved
        const driverUser = await db.select()
            .from(user)
            .where(eq(user.id, driverId))
            .limit(1);
        if (!driverUser.length || driverUser[0]?.accountStatus !== 'active') {
            console.log('❌ [getAvailableOrders] Driver not active:', driverUser[0]?.accountStatus);
            return {
                orders: [],
                isLocked: false,
                lockedOrderId: null,
                accountStatus: driverUser[0]?.accountStatus || 'pending',
                message: 'Your account is pending approval. You cannot view orders yet.'
            };
        }
        // Check if driver has an active order (assigned, on_the_way, or delivered)
        const assignedOrder = await db.select()
            .from(order)
            .where(and(eq(order.driverId, driverId), or(eq(order.status, orderStatus.ASSIGNED), eq(order.status, orderStatus.ON_THE_WAY), eq(order.status, orderStatus.DELIVERED))))
            .limit(1);
        console.log('📦 [getAvailableOrders] Active orders found:', assignedOrder.length);
        if (assignedOrder.length > 0) {
            console.log('✅ [getAvailableOrders] Order status:', assignedOrder[0]?.status, 'Order ID:', assignedOrder[0]?.id);
        }
        else {
            // Debug: Check if driver has ANY orders
            const anyOrders = await db.select()
                .from(order)
                .where(eq(order.driverId, driverId))
                .limit(5);
            console.log('🔍 [getAvailableOrders] Driver has', anyOrders.length, 'orders with any status');
            anyOrders.forEach(o => {
                console.log('  - Order', o.id, 'status:', o.status);
            });
        }
        // If driver is locked to an active order, return only that order
        if (assignedOrder.length > 0) {
            const lockedOrder = assignedOrder[0];
            if (!lockedOrder)
                return { orders: [], isLocked: true, lockedOrderId: null };
            // Get customer info for locked order
            const customer = await db.select()
                .from(user)
                .where(eq(user.id, lockedOrder.customerId))
                .limit(1);
            // *** NEW: Get customer profile photo
            const customerProfilePhoto = await db.select({
                fileName: uploadedFile.fileName,
            })
                .from(uploadedFile)
                .where(and(eq(uploadedFile.userId, lockedOrder.customerId), eq(uploadedFile.documentType, 'profile_photo')))
                .limit(1);
            return {
                orders: [{
                        ...lockedOrder,
                        materials: lockedOrder.materials || [], // Include materials
                        driverOffer: null,
                        driverOfferId: null,
                        hasOffer: false,
                        customerName: customer[0]?.name || 'Customer',
                        customerPhone: customer[0]?.phoneNumber || null,
                        customerProfilePhoto: customerProfilePhoto[0]?.fileName
                            ? `profile_photo/${customerProfilePhoto[0].fileName}`
                            : null, // *** NEW: Add customer profile photo
                        pickupLocation: {
                            latitude: lockedOrder.pickupLatitude,
                            longitude: lockedOrder.pickupLongitude,
                        },
                        deliveryLocation: {
                            latitude: lockedOrder.deliveryLatitude,
                            longitude: lockedOrder.deliveryLongitude,
                        },
                    }],
                isLocked: true,
                lockedOrderId: lockedOrder.id
            };
        }
        // Get driver's vehicle type
        const driverVehicle = await db.select()
            .from(vehicle)
            .where(eq(vehicle.driverId, driverId))
            .limit(1);
        if (!driverVehicle.length) {
            return { orders: [], isLocked: false, lockedOrderId: null };
        }
        const v = driverVehicle[0];
        if (!v)
            return { orders: [], isLocked: false, lockedOrderId: null };
        const vehicleType = v.type;
        // Get APPROVED and HAS_OFFERS orders matching vehicle type
        const availableOrders = await db.select()
            .from(order)
            .where(and(eq(order.vehicleType, vehicleType)));
        // Filter to only show APPROVED or HAS_OFFERS status
        const filteredOrders = availableOrders.filter(o => o.status === orderStatus.APPROVED || o.status === orderStatus.HAS_OFFERS);
        // Get driver's offers for these orders
        const driverOffers = await db.select()
            .from(driverOffer)
            .where(and(eq(driverOffer.driverId, driverId), eq(driverOffer.status, offerStatus.PENDING)));
        // Map offers by orderId for quick lookup
        const offersByOrderId = new Map(driverOffers.map(offer => [offer.orderId, offer]));
        // Get customer information for each order
        const customerIds = [...new Set(filteredOrders.map(o => o.customerId))];
        const customers = customerIds.length > 0
            ? await db.select().from(user).where(inArray(user.id, customerIds))
            : [];
        const customerMap = new Map(customers.map(c => [c.id, c]));
        // *** NEW: Get customer profile photos
        const customerProfilePhotos = customerIds.length > 0
            ? await db.select()
                .from(uploadedFile)
                .where(and(inArray(uploadedFile.userId, customerIds), eq(uploadedFile.documentType, 'profile_photo')))
            : [];
        const profilePhotoMap = new Map(customerProfilePhotos.map(p => [p.userId, p.fileName]));
        // Add offer and customer information to each order
        const ordersWithOffers = filteredOrders.map(o => {
            const customer = customerMap.get(o.customerId);
            const profilePhoto = profilePhotoMap.get(o.customerId);
            // Use name if available and not a phone number, otherwise use "Customer"
            let customerName = 'Customer';
            if (customer?.name) {
                // Check if name is a phone number (starts with + or is all digits)
                const isPhoneNumber = /^[\d+\s()-]+$/.test(customer.name);
                if (!isPhoneNumber) {
                    customerName = customer.name;
                }
            }
            console.log(`[Driver Orders] Order ${o.id} materials:`, o.materials);
            return {
                ...o,
                materials: o.materials || [], // Include materials
                driverOffer: offersByOrderId.get(o.id)?.offeredPrice || null,
                driverOfferId: offersByOrderId.get(o.id)?.id || null,
                hasOffer: offersByOrderId.has(o.id),
                customerName,
                customerPhone: customer?.phoneNumber || null,
                customerProfilePhoto: profilePhoto ? `profile_photo/${profilePhoto}` : null,
                pickupLocation: {
                    latitude: o.pickupLatitude,
                    longitude: o.pickupLongitude,
                },
                deliveryLocation: {
                    latitude: o.deliveryLatitude,
                    longitude: o.deliveryLongitude,
                },
            };
        });
        return { orders: ordersWithOffers, isLocked: false, lockedOrderId: null };
    }),
    // Get driver's offers
    getMyOffers: wsDriverProcedure
        .handler(async ({ context }) => {
        const driverId = context.user.id;
        const offers = await db.select()
            .from(driverOffer)
            .where(eq(driverOffer.driverId, driverId))
            .orderBy(driverOffer.createdAt);
        return { offers };
    }),
    // Cancel a pending offer
    cancelOffer: wsDriverProcedure
        .input(z.object({ offerId: z.string() }))
        .handler(async ({ input, context }) => {
        const { offerId } = input;
        const driverId = context.user.id;
        // Verify offer belongs to driver
        const offerData = await db.select()
            .from(driverOffer)
            .where(and(eq(driverOffer.id, offerId), eq(driverOffer.driverId, driverId)))
            .limit(1);
        if (!offerData.length) {
            throw new Error('Offer not found');
        }
        const targetOffer = offerData[0];
        if (!targetOffer) {
            throw new Error('Offer not found');
        }
        if (targetOffer.status !== offerStatus.PENDING) {
            throw new Error('Can only cancel pending offers');
        }
        // Cancel the offer
        await db.update(driverOffer)
            .set({ status: offerStatus.CANCELLED })
            .where(eq(driverOffer.id, offerId));
        return { success: true, message: 'Offer cancelled' };
    }),
    updateLocation: wsDriverProcedure
        .input(locationUpdateSchema)
        .handler(async ({ input, context }) => {
        console.log(`Driver ${context.user.id} location:`, input);
        return { success: true };
    }),
    getMyOrders: wsDriverProcedure
        .handler(async ({ context }) => {
        const orders = await db.select()
            .from(order)
            .where(eq(order.driverId, context.user.id));
        return { orders };
    }),
    getMyVehicle: wsDriverProcedure
        .handler(async ({ context }) => {
        const driverVehicle = await db.select()
            .from(vehicle)
            .where(eq(vehicle.driverId, context.user.id))
            .limit(1);
        return { vehicle: driverVehicle[0] || null };
    })
};
//# sourceMappingURL=driver.js.map