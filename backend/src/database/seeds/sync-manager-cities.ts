import { db } from '../db.js';
import { townManager, managerAssignedCities } from '../schema/manager-schema.js';
import { cities } from '../schema/master-data-schema.js';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

export async function syncExistingManagerCities() {
  console.log('[Sync Manager Cities] Starting synchronization of existing town managers...');
  
  const managers = await db.select().from(townManager);
  const allCities = await db.select().from(cities);
  
  let syncedCount = 0;

  for (const manager of managers) {
    // Check if manager already has any assigned cities
    const existing = await db
      .select()
      .from(managerAssignedCities)
      .where(eq(managerAssignedCities.managerId, manager.id));

    if (existing.length > 0) {
      console.log(`[Sync Manager Cities] Manager ${manager.townName} (${manager.id}) already has ${existing.length} assigned cities.`);
      continue;
    }

    // Attempt to match manager.cityName with cities table
    const targetName = manager.cityName.trim().toLowerCase();
    const matchedCity = allCities.find(
      (c) => c.nameEn.toLowerCase() === targetName || c.nameAm === manager.cityName || targetName.includes(c.nameEn.toLowerCase())
    );

    if (matchedCity) {
      await db.insert(managerAssignedCities).values({
        id: crypto.randomUUID(),
        managerId: manager.id,
        cityId: matchedCity.id,
      });
      console.log(`[Sync Manager Cities] Successfully assigned ${matchedCity.nameEn} (${matchedCity.id}) to Manager ${manager.townName} (${manager.id})`);
      syncedCount++;
    } else {
      console.warn(`[Sync Manager Cities] No matching city found in master data for cityName: "${manager.cityName}" (Manager ID: ${manager.id})`);
    }
  }

  console.log(`[Sync Manager Cities] Finished. Synced ${syncedCount} manager(s).`);
}

syncExistingManagerCities()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
