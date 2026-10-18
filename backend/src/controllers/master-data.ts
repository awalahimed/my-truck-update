import { os } from '@orpc/server';
import { db } from '../database/db.js';
import {
  cities,
  pricingUnits,
  truckTypes,
  goodsTypes,
} from '../database/schema/master-data-schema.js';
import { eq, asc } from 'drizzle-orm';
import { logger } from '../utils/logger.js';

/**
 * Public & Authenticated Router for accessing active master data
 * Used by Shipper Wizard, Driver Onboarding, and general forms.
 */
export const masterDataRouter = os.router({
  /**
   * 1. Get all active cities
   */
  getCities: os.handler(async () => {
    try {
      const data = await db
        .select()
        .from(cities)
        .where(eq(cities.isActive, true))
        .orderBy(asc(cities.nameEn));

      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error('Failed to get cities:', { error });
      return {
        success: false,
        message: 'Failed to retrieve cities list',
        data: [],
      };
    }
  }),

  /**
   * 2. Get all active pricing units
   */
  getUnits: os.handler(async () => {
    try {
      const data = await db
        .select()
        .from(pricingUnits)
        .where(eq(pricingUnits.isActive, true))
        .orderBy(asc(pricingUnits.nameEn));

      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error('Failed to get pricing units:', { error });
      return {
        success: false,
        message: 'Failed to retrieve pricing units',
        data: [],
      };
    }
  }),

  /**
   * 3. Get all active truck types joined with their unit of measurement
   */
  getTrucks: os.handler(async () => {
    try {
      const data = await db
        .select({
          id: truckTypes.id,
          nameEn: truckTypes.nameEn,
          nameAm: truckTypes.nameAm,
          nameOm: truckTypes.nameOm,
          maxCapacity: truckTypes.maxCapacity,
          unitId: truckTypes.unitId,
          imageUrl: truckTypes.imageUrl,
          description: truckTypes.description,
          isActive: truckTypes.isActive,
          unit: {
            id: pricingUnits.id,
            unitCode: pricingUnits.unitCode,
            nameEn: pricingUnits.nameEn,
            nameAm: pricingUnits.nameAm,
            nameOm: pricingUnits.nameOm,
          },
        })
        .from(truckTypes)
        .leftJoin(pricingUnits, eq(truckTypes.unitId, pricingUnits.id))
        .where(eq(truckTypes.isActive, true))
        .orderBy(asc(truckTypes.nameEn));

      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error('Failed to get truck types:', { error });
      return {
        success: false,
        message: 'Failed to retrieve truck types',
        data: [],
      };
    }
  }),

  /**
   * 4. Get all active goods types joined with their default pricing unit
   */
  getGoods: os.handler(async () => {
    try {
      const data = await db
        .select({
          id: goodsTypes.id,
          nameEn: goodsTypes.nameEn,
          nameAm: goodsTypes.nameAm,
          nameOm: goodsTypes.nameOm,
          category: goodsTypes.category,
          defaultUnitId: goodsTypes.defaultUnitId,
          isActive: goodsTypes.isActive,
          defaultUnit: {
            id: pricingUnits.id,
            unitCode: pricingUnits.unitCode,
            nameEn: pricingUnits.nameEn,
            nameAm: pricingUnits.nameAm,
            nameOm: pricingUnits.nameOm,
          },
        })
        .from(goodsTypes)
        .leftJoin(pricingUnits, eq(goodsTypes.defaultUnitId, pricingUnits.id))
        .where(eq(goodsTypes.isActive, true))
        .orderBy(asc(goodsTypes.nameEn));

      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error('Failed to get goods types:', { error });
      return {
        success: false,
        message: 'Failed to retrieve goods types',
        data: [],
      };
    }
  }),
});
