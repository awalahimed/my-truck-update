import { db, pool } from '../db.js';
import {
  cities,
  pricingUnits,
  truckTypes,
  goodsTypes,
  marketRates,
} from '../schema/master-data-schema.js';
import { user } from '../schema/auth-schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '../../utils/logger.js';
import crypto from 'crypto';

export async function seedMasterData() {
  try {
    logger.info('🌱 Starting Master Data Seeding (የዋና ዳታ ዝግጅት)...');

    // 0. Ensure Admin user exists for 'updatedBy' references
    const [adminUser] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.role, 'admin'))
      .limit(1);

    const adminId = adminUser?.id ?? 'admin-system-id';

    // 1. Seed Cities
    logger.info('📍 Seeding Cities (ከተሞች)...');
    const citiesData = [
      {
        id: 'city-addis-ababa',
        nameEn: 'Addis Ababa',
        nameAm: 'አዲስ አበባ',
        nameOm: 'Finfinnee',
        region: 'Addis Ababa',
      },
      {
        id: 'city-nekemte',
        nameEn: 'Nekemte',
        nameAm: 'ነቀምቴ',
        nameOm: 'Naqamtee',
        region: 'Oromia',
      },
      {
        id: 'city-hawassa',
        nameEn: 'Hawassa',
        nameAm: 'ሀዋሳ',
        nameOm: 'Hawaasaa',
        region: 'Sidama',
      },
      {
        id: 'city-adama',
        nameEn: 'Adama',
        nameAm: 'አዳማ',
        nameOm: 'Adaamaa',
        region: 'Oromia',
      },
      {
        id: 'city-dire-dawa',
        nameEn: 'Dire Dawa',
        nameAm: 'ድሬዳዋ',
        nameOm: 'Dirre Dawaa',
        region: 'Dire Dawa',
      },
    ];

    for (const city of citiesData) {
      await db
        .insert(cities)
        .values({
          ...city,
          isActive: true,
        })
        .onDuplicateKeyUpdate({
          set: {
            nameEn: city.nameEn,
            nameAm: city.nameAm,
            nameOm: city.nameOm,
            region: city.region,
            isActive: true,
          },
        });
    }

    // 2. Seed Pricing Units
    logger.info('⚖️ Seeding Pricing Units (የዋጋ መለኪያዎች)...');
    const unitsData = [
      {
        id: 'unit-qtl',
        unitCode: 'QTL',
        nameEn: 'Quintal',
        nameAm: 'ኩንታል',
        nameOm: 'Kuntaala',
        description: 'Standard 100kg bag used for grain, coffee, and agricultural commodities',
      },
      {
        id: 'unit-ton',
        unitCode: 'TON',
        nameEn: 'Ton',
        nameAm: 'ቶን',
        nameOm: 'Toonii',
        description: 'Metric ton (1,000 kg) used for cement, heavy cargo, and steel',
      },
      {
        id: 'unit-hd',
        unitCode: 'HD',
        nameEn: 'Head Count',
        nameAm: 'ራስ (የቁጥር)',
        nameOm: 'Mataadhaan',
        description: 'Per-head count for livestock such as cows, oxen, sheep, and goats',
      },
      {
        id: 'unit-trp',
        unitCode: 'TRP',
        nameEn: 'Flat Trip',
        nameAm: 'ሙሉ ጉዞ (ኮንትራት)',
        nameOm: 'Imala Guutuu',
        description: 'Full truck contract rental for furniture, mixed load, and household goods',
      },
    ];

    for (const unit of unitsData) {
      await db
        .insert(pricingUnits)
        .values({
          ...unit,
          isActive: true,
        })
        .onDuplicateKeyUpdate({
          set: {
            nameEn: unit.nameEn,
            nameAm: unit.nameAm,
            nameOm: unit.nameOm,
            description: unit.description,
            isActive: true,
          },
        });
    }

    // 3. Seed Truck Types
    logger.info('🚛 Seeding Truck Types (የጭነት መኪና ዓይነቶች)...');
    const trucksData = [
      {
        id: 'truck-fsr',
        nameEn: 'FSR',
        nameAm: 'ኤፍ ኤስ አር (FSR)',
        nameOm: 'FSR',
        maxCapacity: '100.00',
        unitId: 'unit-qtl', // 100 Quintals
        description: 'Reliable medium-heavy freight carrier, holds up to 100 quintals (10 tons)',
      },
      {
        id: 'truck-cattle',
        nameEn: 'Cattle Truck',
        nameAm: 'የከብት መጫኛ መኪና',
        nameOm: 'Makiinaa Horii',
        maxCapacity: '200.00',
        unitId: 'unit-hd', // 200 Heads of livestock (or sheep/goats)
        description: 'Enclosed gated truck designed specifically for safe livestock transport',
      },
      {
        id: 'truck-isuzu',
        nameEn: 'Isuzu NPR',
        nameAm: 'ኢሱዙ (NPR)',
        nameOm: 'Isuzuu',
        maxCapacity: '40.00',
        unitId: 'unit-qtl', // 40 Quintals
        description: 'Standard medium delivery truck for regional logistics up to 40 quintals',
      },
    ];

    for (const truck of trucksData) {
      await db
        .insert(truckTypes)
        .values({
          ...truck,
          isActive: true,
        })
        .onDuplicateKeyUpdate({
          set: {
            nameEn: truck.nameEn,
            nameAm: truck.nameAm,
            nameOm: truck.nameOm,
            maxCapacity: truck.maxCapacity,
            unitId: truck.unitId,
            description: truck.description,
            isActive: true,
          },
        });
    }

    // 4. Seed Goods Types
    logger.info('📦 Seeding Goods Types (የጭነት ዕቃ ዓይነቶች)...');
    const goodsData = [
      {
        id: 'goods-teff',
        nameEn: 'Teff & Grain',
        nameAm: 'ጤፍ እና እህል',
        nameOm: 'Xaafii fi Midhaan',
        defaultUnitId: 'unit-qtl',
        category: 'agricultural',
      },
      {
        id: 'goods-cows',
        nameEn: 'Livestock (Cows & Oxen)',
        nameAm: 'የቁም እንስሳት (ከብቶች)',
        nameOm: 'Loon fi Sangoota',
        defaultUnitId: 'unit-hd',
        category: 'livestock',
      },
      {
        id: 'goods-coffee',
        nameEn: 'Export Coffee (ቡና)',
        nameAm: 'የኤክስፖርት ቡና',
        nameOm: 'Buna',
        defaultUnitId: 'unit-qtl',
        category: 'agricultural',
      },
      {
        id: 'goods-furniture',
        nameEn: 'Furniture & Household Relocation',
        nameAm: 'የቤት ዕቃዎች እና ማዛወሪያ',
        nameOm: 'Meeshaalee Manaa',
        defaultUnitId: 'unit-trp',
        category: 'commercial',
      },
    ];

    for (const good of goodsData) {
      await db
        .insert(goodsTypes)
        .values({
          ...good,
          isActive: true,
        })
        .onDuplicateKeyUpdate({
          set: {
            nameEn: good.nameEn,
            nameAm: good.nameAm,
            nameOm: good.nameOm,
            defaultUnitId: good.defaultUnitId,
            category: good.category,
            isActive: true,
          },
        });
    }

    // 5. Seed Market Rates (Town Manager Pricing Benchmarks)
    logger.info('📊 Seeding Market Rates (የገበያ ዋጋ መነሻዎች)...');
    const ratesData = [
      {
        id: 'rate-nekemte-addis-qtl',
        originCityId: 'city-nekemte',
        destinationCityId: 'city-addis-ababa',
        pricingUnitId: 'unit-qtl',
        minRate: '60.00',
        maxRate: '75.00',
        updatedBy: adminId,
      },
      {
        id: 'rate-hawassa-addis-qtl',
        originCityId: 'city-hawassa',
        destinationCityId: 'city-addis-ababa',
        pricingUnitId: 'unit-qtl',
        minRate: '50.00',
        maxRate: '65.00',
        updatedBy: adminId,
      },
      {
        id: 'rate-hawassa-addis-hd',
        originCityId: 'city-hawassa',
        destinationCityId: 'city-addis-ababa',
        pricingUnitId: 'unit-hd',
        minRate: '160.00',
        maxRate: '200.00',
        updatedBy: adminId,
      },
    ];

    for (const rate of ratesData) {
      await db
        .insert(marketRates)
        .values({
          ...rate,
          isActive: true,
        })
        .onDuplicateKeyUpdate({
          set: {
            minRate: rate.minRate,
            maxRate: rate.maxRate,
            updatedBy: rate.updatedBy,
            isActive: true,
          },
        });
    }

    logger.info('✅ Master Data Seeding completed successfully!');
  } catch (error) {
    logger.error('❌ Failed to seed master data:', error);
    throw error;
  }
}

// Allow running directly via tsx
if (process.argv[1] && process.argv[1].includes('master-data-seed')) {
  seedMasterData()
    .then(() => {
      logger.info('Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
