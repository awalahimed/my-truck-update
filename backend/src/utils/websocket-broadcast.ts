import type { WebSocket } from 'ws'
import { db } from '../database/db.js'
import { order } from '../database/schema/order-schema.js'
import { user } from '../database/schema/auth-schema.js'
import { vehicle } from '../database/schema/vehicle-schema.js'
import { eq, and } from 'drizzle-orm'

// WebSocket connections store
const connections = new Map<string, { ws: WebSocket, role: string, userId: string }>()

export const registerConnection = (userId: string, role: string, ws: WebSocket) => {
  connections.set(userId, { ws, role, userId })
  
  ws.on('close', () => {
    connections.delete(userId)
  })
}

export const broadcastOrderToDrivers = async (orderId: string) => {
  try {
    const orderData = await db.select().from(order).where(eq(order.id, orderId)).limit(1)
    if (!orderData.length) return

    const orderInfo = orderData[0]
    
    // Find drivers with matching vehicle type
    const driversWithVehicles = await db
      .select({
        userId: user.id,
        phoneNumber: user.phoneNumber,
        vehicleType: vehicle.type,
      })
      .from(user)
      .innerJoin(vehicle, and(
        eq(vehicle.driverId, user.id),
        eq(vehicle.type, orderInfo.vehicleType),
        eq(vehicle.isActive, true)
      ))
      .where(eq(user.role, 'driver'))

    const broadcastData = {
      type: 'order_broadcast',
      data: {
        orderId: orderInfo.id,
        pickupAddress: orderInfo.pickupAddress,
        deliveryAddress: orderInfo.deliveryAddress,
        materials: orderInfo.materials,
        vehicleType: orderInfo.vehicleType,
        notes: orderInfo.notes,
        pickupLocation: {
          latitude: orderInfo.pickupLatitude,
          longitude: orderInfo.pickupLongitude
        }
      }
    }

    // Send WebSocket to connected drivers
    driversWithVehicles.forEach(driver => {
      const connection = connections.get(driver.userId)
      if (connection && connection.ws.readyState === 1) {
        connection.ws.send(JSON.stringify(broadcastData))
      }
    })

    // *** NEW: Send push notifications to all matching drivers ***
    const { createNotification } = await import('../services/notification.js')
    for (const driver of driversWithVehicles) {
      await createNotification(driver.userId, {
        title: '🚚 New Order Available',
        body: `New ${orderInfo.vehicleType} order: ${orderInfo.pickupAddress} → ${orderInfo.deliveryAddress}`,
        type: 'new_order_available',
        data: { 
          orderId: orderInfo.id, 
          vehicleType: orderInfo.vehicleType,
          pickupAddress: orderInfo.pickupAddress,
          deliveryAddress: orderInfo.deliveryAddress,
        },
      })
    }

    console.log(`Order ${orderId} broadcasted to ${driversWithVehicles.length} drivers (WebSocket + Push Notifications)`)
    
  } catch (error) {
    console.error('Error broadcasting order:', error)
  }
}

export const broadcastToRole = (role: string, data: unknown) => {
  connections.forEach((connection) => {
    if (connection.role === role && connection.ws.readyState === 1) {
      connection.ws.send(JSON.stringify(data))
    }
  })
}

// Notify a specific customer about order updates
export const notifyCustomerOrderUpdate = (customerId: string, data: unknown) => {
  const connection = connections.get(customerId)
  if (connection && connection.ws.readyState === 1) {
    connection.ws.send(JSON.stringify(data))
  }
}

// Get user's WebSocket connection
export const getUserWebSocket = (userId: string): WebSocket | null => {
  const connection = connections.get(userId)
  return connection?.ws || null
}

// *** NEW: Notify specific driver when order is assigned to them
export const notifyDriverOrderAssigned = async (driverId: string, orderId: string) => {
  try {
    const connection = connections.get(driverId)
    if (!connection || connection.ws.readyState !== 1) {
      console.log(`Driver ${driverId} not connected via WebSocket`)
      return
    }

    // Fetch full order details
    const orderData = await db.select().from(order).where(eq(order.id, orderId)).limit(1)
    if (!orderData.length) return

    const orderInfo = orderData[0]
    
    // Get customer info
    const customerData = await db.select({
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
    }).from(user).where(eq(user.id, orderInfo.customerId)).limit(1)

    const notificationData = {
      type: 'order_assigned',
      data: {
        orderId: orderInfo.id,
        customerId: orderInfo.customerId,
        customerName: customerData[0]?.name || 'Customer',
        customerPhone: customerData[0]?.phoneNumber || null,
        pickupAddress: orderInfo.pickupAddress,
        deliveryAddress: orderInfo.deliveryAddress,
        materials: orderInfo.materials,
        vehicleType: orderInfo.vehicleType,
        notes: orderInfo.notes,
        status: orderInfo.status,
        finalPrice: orderInfo.finalPrice,
        pickupLocation: {
          latitude: orderInfo.pickupLatitude,
          longitude: orderInfo.pickupLongitude
        },
        deliveryLocation: {
          latitude: orderInfo.deliveryLatitude,
          longitude: orderInfo.deliveryLongitude
        }
      }
    }

    connection.ws.send(JSON.stringify(notificationData))
    console.log(`✅ Order ${orderId} assignment notification sent to driver ${driverId}`)
    
  } catch (error) {
    console.error('Error notifying driver of order assignment:', error)
  }
}

// Notify a specific agent when order is assigned to them
export const notifyAgentOrderAssigned = async (agentId: string, orderId: string) => {
  try {
    const connection = connections.get(agentId)
    if (!connection || connection.ws.readyState !== 1) {
      console.log(`Agent ${agentId} not connected via WebSocket`)
      return
    }

    // Fetch full order details
    const orderData = await db.select().from(order).where(eq(order.id, orderId)).limit(1)
    if (!orderData.length) return

    const orderInfo = orderData[0]

    // Get customer info
    const customerData = await db.select({
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
    }).from(user).where(eq(user.id, orderInfo.customerId)).limit(1)

    const notificationData = {
      type: 'order_assigned_to_agent',
      data: {
        orderId: orderInfo.id,
        customerId: orderInfo.customerId,
        customerName: customerData[0]?.name || 'Customer',
        customerPhone: customerData[0]?.phoneNumber || null,
        pickupAddress: orderInfo.pickupAddress,
        deliveryAddress: orderInfo.deliveryAddress,
        materials: orderInfo.materials,
        vehicleType: orderInfo.vehicleType,
        notes: orderInfo.notes,
        status: orderInfo.status,
        pickupLocation: {
          latitude: orderInfo.pickupLatitude,
          longitude: orderInfo.pickupLongitude,
        },
        deliveryLocation: {
          latitude: orderInfo.deliveryLatitude,
          longitude: orderInfo.deliveryLongitude,
        },
      }
    }

    connection.ws.send(JSON.stringify(notificationData))
    console.log(`✅ Order ${orderId} assignment notification sent to agent ${agentId}`)

  } catch (error) {
    console.error('Error notifying agent of order assignment:', error)
  }
}

// NEW: Broadcast order to call center agents
export const broadcastOrderToCallCenter = async (orderId: string) => {
  try {
    const orderData = await db.select().from(order).where(eq(order.id, orderId)).limit(1)
    if (!orderData.length) return

    const orderInfo = orderData[0]
    
    // Get customer info
    const customerData = await db.select({
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
    }).from(user).where(eq(user.id, orderInfo.customerId)).limit(1)

    const broadcastData = {
      type: 'new_order_for_approval',
      data: {
        orderId: orderInfo.id,
        customerId: orderInfo.customerId,
        customerName: customerData[0]?.name || 'Unknown',
        customerPhone: customerData[0]?.phoneNumber || 'N/A',
        pickupAddress: orderInfo.pickupAddress,
        deliveryAddress: orderInfo.deliveryAddress,
        materials: orderInfo.materials,
        vehicleType: orderInfo.vehicleType,
        notes: orderInfo.notes,
        status: orderInfo.status,
        createdAt: orderInfo.createdAt,
        pickupLocation: {
          latitude: orderInfo.pickupLatitude,
          longitude: orderInfo.pickupLongitude
        },
        deliveryLocation: {
          latitude: orderInfo.deliveryLatitude,
          longitude: orderInfo.deliveryLongitude
        }
      }
    }

    // Send to all call center agents
    let sentCount = 0
    connections.forEach((connection) => {
      if ((connection.role === 'call_center' || connection.role === 'admin') && connection.ws.readyState === 1) {
        connection.ws.send(JSON.stringify(broadcastData))
        sentCount++
      }
    })

    console.log(`Order ${orderId} sent to ${sentCount} call center agents for approval`)
    
  } catch (error) {
    console.error('Error broadcasting order to call center:', error)
  }
}
