import { wsOwnerProcedure } from '../../middlewares/ws-auth.js'
import { db } from '../../database/db.js'
import { order } from '../../database/schema/order-schema.js'
import { user } from '../../database/schema/auth-schema.js'
import { eq } from 'drizzle-orm'

export const ownerController = {
  getAllOrders: wsOwnerProcedure
    .handler(async () => {
      const orders = await db.select({
        id: order.id,
        status: order.status,
        pickupAddress: order.pickupAddress,
        deliveryAddress: order.deliveryAddress,
        vehicleType: order.vehicleType,
        estimatedPrice: order.estimatedPrice,
        finalPrice: order.finalPrice,
        createdAt: order.createdAt,
        customerPhone: user.phoneNumber
      })
      .from(order)
      .leftJoin(user, eq(order.customerId, user.id))
      
      return { orders }
    }),

  getDriverLocations: wsOwnerProcedure
    .handler(async () => {
      return { drivers: [] }
    })
}
