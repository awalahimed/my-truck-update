import { db } from '../../database/db.js';
import { order } from '../../database/schema/order-schema.js';
import { user } from '../../database/schema/auth-schema.js';
import { vehicle } from '../../database/schema/vehicle-schema.js';
import { eq, and } from 'drizzle-orm';
// WebSocket connection store
const driverConnections = new Map();
const ownerConnections = new Map();
export const registerConnection = (userId, role, ws) => {
    switch (role) {
        case 'driver':
            driverConnections.set(userId, ws);
            break;
        case 'owner':
            ownerConnections.set(userId, ws);
            break;
    }
    ws.on('close', () => {
        driverConnections.delete(userId);
        ownerConnections.delete(userId);
    });
};
// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
export const broadcastOrderToDrivers = async (orderId) => {
    try {
        // Get order details
        const orderData = await db.select().from(order).where(eq(order.id, orderId)).limit(1);
        if (!orderData.length)
            return;
        const orderInfo = orderData[0];
        if (!orderInfo)
            return;
        // Find drivers with matching vehicle type and within radius
        const driversWithVehicles = await db
            .select({
            userId: user.id,
            phoneNumber: user.phoneNumber,
            vehicleType: vehicle.type,
            vehicleId: vehicle.id
        })
            .from(user)
            .innerJoin(vehicle, and(eq(vehicle.driverId, user.id), eq(vehicle.type, orderInfo.vehicleType), eq(vehicle.isActive, true)))
            .where(eq(user.role, 'driver'));
        // Filter by proximity (within 10km radius)
        const nearbyDrivers = driversWithVehicles.filter(driver => {
            // For now, broadcast to all drivers of correct type
            // TODO: Add driver location tracking for proximity filtering
            return true;
        });
        // Broadcast to connected drivers
        const broadcastData = {
            type: 'order_broadcast',
            data: {
                orderId: orderInfo.id,
                pickupAddress: orderInfo.pickupAddress,
                deliveryAddress: orderInfo.deliveryAddress,
                materials: orderInfo.materials,
                estimatedPrice: orderInfo.estimatedPrice,
                vehicleType: orderInfo.vehicleType,
                notes: orderInfo.notes,
                pickupLocation: {
                    latitude: orderInfo.pickupLatitude,
                    longitude: orderInfo.pickupLongitude
                }
            }
        };
        nearbyDrivers.forEach(driver => {
            const ws = driverConnections.get(driver.userId);
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(broadcastData));
            }
        });
        console.log(`Order ${orderId} broadcasted to ${nearbyDrivers.length} drivers`);
    }
    catch (error) {
        console.error('Error broadcasting order:', error);
    }
};
export const broadcastToOwners = (data) => {
    ownerConnections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    });
};
//# sourceMappingURL=order-broadcast.js.map