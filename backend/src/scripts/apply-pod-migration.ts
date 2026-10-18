import { db } from '../database/db.js';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('🚀 Checking and applying PoD schema updates...');

  const columns = [
    { name: 'delivery_pin', type: 'varchar(10)' },
    { name: 'consignee_name', type: 'varchar(255)' },
    { name: 'consignee_phone', type: 'varchar(50)' },
    { name: 'pod_waybill_photo', type: 'text' },
    { name: 'pod_cargo_photo', type: 'text' },
    { name: 'pod_completed_by', type: 'varchar(50)' },
    { name: 'pod_latitude', type: 'decimal(10,8)' },
    { name: 'pod_longitude', type: 'decimal(11,8)' },
    { name: 'pod_dispute_reason', type: 'text' },
    { name: 'pod_disputed_at', type: 'timestamp NULL' },
  ];

  for (const col of columns) {
    try {
      await db.execute(sql.raw(`ALTER TABLE \`order\` ADD \`${col.name}\` ${col.type};`));
      console.log(`✅ Added column order.${col.name}`);
    } catch (err: any) {
      const code = err?.code || err?.cause?.code;
      if (code === 'ER_DUP_FIELDNAME') {
        console.log(`ℹ️ Column order.${col.name} already exists.`);
      } else {
        console.error(`❌ Error adding column order.${col.name}:`, code, err?.cause?.message || err.message);
      }
    }
  }

  // Create trip_waypoints table
  try {
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`trip_waypoints\` (
        \`id\` varchar(36) PRIMARY KEY,
        \`order_id\` varchar(255) NOT NULL,
        \`driver_id\` varchar(255) NOT NULL,
        \`latitude\` decimal(10,8) NOT NULL,
        \`longitude\` decimal(11,8) NOT NULL,
        \`bearing\` decimal(6,2),
        \`speed_kmh\` decimal(6,2),
        \`accuracy\` decimal(6,2),
        \`is_milestone\` boolean NOT NULL DEFAULT false,
        \`recorded_at\` timestamp NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `));
    console.log('✅ Created or verified table `trip_waypoints`.');
  } catch (err: any) {
    console.error('❌ Error creating trip_waypoints:', err.message);
  }

  console.log('🎉 PoD & GPS tracking migration complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
