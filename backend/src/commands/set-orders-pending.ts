import { db } from '../database/db.js'
import { order, orderStatus } from '../database/schema/order-schema.js'
import { eq } from 'drizzle-orm'
import { logger } from '../utils/logger.js'

async function setOrdersPending(orderId?: string) {
  try {
    if (orderId) {
      await db.update(order).set({ status: orderStatus.PENDING_APPROVAL }).where(eq(order.id, orderId))
      logger.info(`Order ${orderId} set to pending_approval`)
    } else {
      await db.update(order).set({ status: orderStatus.PENDING_APPROVAL })
      logger.info('All orders set to pending_approval')
    }
  } catch (error) {
    logger.error('Error setting orders to pending:', error)
    throw error
  }
}

const orderId = process.argv[2]

async function main() {
  try {
    if (orderId) {
      logger.info(`Setting order ${orderId} to pending...`)
      await setOrdersPending(orderId)
    } else {
      logger.info('Setting all orders to pending...')
      await setOrdersPending()
    }
    
    logger.info('✅ Orders set to pending successfully')
    process.exit(0)
  } catch (error) {
    logger.error('❌ Failed to set orders to pending:', error)
    process.exit(1)
  }
}

main()
