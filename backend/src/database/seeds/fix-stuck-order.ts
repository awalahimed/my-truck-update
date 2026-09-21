import { db } from '../db.js';
import { order, orderStatus } from '../schema/order-schema.js';
import { eq } from 'drizzle-orm';

/**
 * Fix orders that are stuck in "delivered" status but payment was already processed
 * This can happen if the payment succeeded but the status update failed
 */
async function fixStuckOrders() {
  try {
    console.log('🔍 Looking for orders stuck in delivered status...');

    // Find all orders in delivered status
    const deliveredOrders = await db
      .select()
      .from(order)
      .where(eq(order.status, orderStatus.DELIVERED));

    console.log(`📦 Found ${deliveredOrders.length} orders in delivered status`);

    if (deliveredOrders.length === 0) {
      console.log('✅ No stuck orders found');
      return;
    }

    // Display orders for manual review
    console.log('\n📋 Orders in delivered status:');
    deliveredOrders.forEach((o, index) => {
      console.log(`\n${index + 1}. Order ID: ${o.id}`);
      console.log(`   Customer ID: ${o.customerId}`);
      console.log(`   Driver ID: ${o.driverId}`);
      console.log(`   Final Price: ${o.finalPrice} ETB`);
      console.log(`   Status: ${o.status}`);
      console.log(`   Delivered At: ${o.deliveredAt}`);
      console.log(`   Created At: ${o.createdAt}`);
    });

    // Ask which order to complete
    console.log('\n⚠️  MANUAL ACTION REQUIRED:');
    console.log('To complete a specific order, run:');
    console.log('npm run fix-order -- <order_id>');
    console.log('\nOr to complete ALL delivered orders (use with caution):');
    console.log('npm run fix-order -- --all');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

/**
 * Complete a specific order by ID
 */
async function completeOrder(orderId: string) {
  try {
    console.log(`\n🔄 Completing order: ${orderId}`);

    // Get order details
    const orderData = await db
      .select()
      .from(order)
      .where(eq(order.id, orderId))
      .limit(1);

    if (!orderData.length) {
      console.error('❌ Order not found');
      return;
    }

    const targetOrder = orderData[0];
    console.log(`📦 Order found:`);
    console.log(`   Status: ${targetOrder?.status}`);
    console.log(`   Final Price: ${targetOrder?.finalPrice} ETB`);
    console.log(`   Customer: ${targetOrder?.customerId}`);
    console.log(`   Driver: ${targetOrder?.driverId}`);

    if (targetOrder?.status !== orderStatus.DELIVERED) {
      console.error(`❌ Order is not in delivered status (current: ${targetOrder?.status})`);
      return;
    }

    // Update order to completed
    await db
      .update(order)
      .set({
        status: orderStatus.COMPLETED,
        completedAt: new Date(),
      })
      .where(eq(order.id, orderId));

    console.log('✅ Order status updated to COMPLETED');
    console.log('⚠️  NOTE: This only updates the status. Payment was already processed.');

  } catch (error) {
    console.error('❌ Error completing order:', error);
    throw error;
  }
}

/**
 * Complete all delivered orders
 */
async function completeAllDeliveredOrders() {
  try {
    console.log('\n⚠️  WARNING: This will complete ALL orders in delivered status!');
    console.log('Press Ctrl+C to cancel...\n');

    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    const result = await db
      .update(order)
      .set({
        status: orderStatus.COMPLETED,
        completedAt: new Date(),
      })
      .where(eq(order.status, orderStatus.DELIVERED));

    console.log(`✅ Updated orders to COMPLETED`);


  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  // No arguments - just list stuck orders
  fixStuckOrders()
    .then(() => {
      console.log('\n✅ Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
} else if (args[0] === '--all') {
  // Complete all delivered orders
  completeAllDeliveredOrders()
    .then(() => {
      console.log('\n✅ Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
} else {
  // Complete specific order
  const orderId = args[0];
  completeOrder(orderId)
    .then(() => {
      console.log('\n✅ Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}
