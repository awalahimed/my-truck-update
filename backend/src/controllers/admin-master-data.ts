import { os, ORPCError } from '@orpc/server';
import { adminProcedure, authProcedure } from '../middlewares/auth.js';
import { db } from '../database/db.js';
import {
  cities,
  pricingUnits,
  truckTypes,
  goodsTypes,
  marketRates,
} from '../database/schema/master-data-schema.js';
import { eq, desc } from 'drizzle-orm';
import {
  createCitySchema,
  updateCitySchema,
  createPricingUnitSchema,
  updatePricingUnitSchema,
  createTruckTypeSchema,
  updateTruckTypeSchema,
  createGoodsTypeSchema,
  updateGoodsTypeSchema,
  createMarketRateSchema,
  updateMarketRateSchema,
  toggleActiveSchema,
} from '../schemas/master-data-schemas.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

/**
 * Admin Master Data CRUD Router
 * Protected by adminProcedure for mutations, authProcedure for lists.
 * Implements soft-delete via isActive flag to preserve historic shipments & orders.
 * Note: Database IDs are varchar(36), matching crypto.randomUUID() exactly.
 */
export const adminMasterDataRouter = os.router({
  // ==========================================
  // CITIES MANAGEMENT
  // ==========================================
  listCities: authProcedure.handler(async () => {
    try {
      const data = await db.select().from(cities).orderBy(desc(cities.createdAt));
      return { success: true, data };
    } catch (error: any) {
      logger.error('Admin list cities failed:', { error });
      return { success: false, message: error?.message || 'Failed to fetch cities', data: [] };
    }
  }),

  createCity: authProcedure.handler(async ({ input, context }) => {
    const allowed = ['admin', 'town_manager'];
    if (!allowed.includes(context.user.role)) {
      throw new ORPCError('FORBIDDEN', { message: 'Admin or Town Manager access required' });
    }
    const validated = createCitySchema.parse(input);
    try {
      const id = crypto.randomUUID();
      await db.insert(cities).values({
        id,
        ...validated,
        isActive: true,
      });
      return {
        success: true,
        message: 'City created successfully',
        id,
        city: { id, ...validated, isActive: true },
      };
    } catch (error: any) {
      logger.error('Create city failed:', { error });
      return { success: false, message: error?.message || 'Failed to create city' };
    }
  }),

  updateCity: adminProcedure.handler(async ({ input }) => {
    const validated = updateCitySchema.parse(input);
    const { id, ...updates } = validated;
    try {
      await db.update(cities).set(updates).where(eq(cities.id, id));
      return { success: true, message: 'City updated successfully' };
    } catch (error: any) {
      logger.error('Admin update city failed:', { error });
      return { success: false, message: error?.message || 'Failed to update city' };
    }
  }),

  toggleCityStatus: adminProcedure.handler(async ({ input }) => {
    const { id, isActive } = toggleActiveSchema.parse(input);
    try {
      const [existing] = await db.select({ isActive: cities.isActive }).from(cities).where(eq(cities.id, id)).limit(1);
      if (!existing) return { success: false, message: 'City not found' };

      const newStatus = isActive !== undefined ? isActive : !existing.isActive;
      await db.update(cities).set({ isActive: newStatus }).where(eq(cities.id, id));
      return { success: true, message: `City ${newStatus ? 'activated' : 'deactivated'} successfully` };
    } catch (error: any) {
      logger.error('Admin toggle city failed:', { error });
      return { success: false, message: error?.message || 'Failed to update city status' };
    }
  }),

  // ==========================================
  // PRICING UNITS MANAGEMENT
  // ==========================================
  listUnits: authProcedure.handler(async () => {
    try {
      const data = await db.select().from(pricingUnits).orderBy(desc(pricingUnits.createdAt));
      return { success: true, data };
    } catch (error: any) {
      logger.error('Admin list units failed:', { error });
      return { success: false, message: error?.message || 'Failed to fetch pricing units', data: [] };
    }
  }),

  createUnit: adminProcedure.handler(async ({ input }) => {
    const validated = createPricingUnitSchema.parse(input);
    try {
      const id = crypto.randomUUID();
      await db.insert(pricingUnits).values({
        id,
        ...validated,
        isActive: true,
      });
      return { success: true, message: 'Pricing unit created successfully', id };
    } catch (error: any) {
      logger.error('Admin create unit failed:', { error });
      return { success: false, message: error?.message || 'Failed to create unit (Code may already exist)' };
    }
  }),

  updateUnit: adminProcedure.handler(async ({ input }) => {
    const validated = updatePricingUnitSchema.parse(input);
    const { id, ...updates } = validated;
    try {
      await db.update(pricingUnits).set(updates).where(eq(pricingUnits.id, id));
      return { success: true, message: 'Pricing unit updated successfully' };
    } catch (error: any) {
      logger.error('Admin update unit failed:', { error });
      return { success: false, message: error?.message || 'Failed to update pricing unit' };
    }
  }),

  toggleUnitStatus: adminProcedure.handler(async ({ input }) => {
    const { id, isActive } = toggleActiveSchema.parse(input);
    try {
      const [existing] = await db.select({ isActive: pricingUnits.isActive }).from(pricingUnits).where(eq(pricingUnits.id, id)).limit(1);
      if (!existing) return { success: false, message: 'Unit not found' };

      const newStatus = isActive !== undefined ? isActive : !existing.isActive;
      await db.update(pricingUnits).set({ isActive: newStatus }).where(eq(pricingUnits.id, id));
      return { success: true, message: `Pricing unit ${newStatus ? 'activated' : 'deactivated'} successfully` };
    } catch (error: any) {
      logger.error('Admin toggle unit failed:', { error });
      return { success: false, message: error?.message || 'Failed to update unit status' };
    }
  }),

  // ==========================================
  // TRUCK TYPES MANAGEMENT
  // ==========================================
  listTrucks: authProcedure.handler(async () => {
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
          createdAt: truckTypes.createdAt,
          unit: {
            id: pricingUnits.id,
            unitCode: pricingUnits.unitCode,
            nameEn: pricingUnits.nameEn,
          },
        })
        .from(truckTypes)
        .leftJoin(pricingUnits, eq(truckTypes.unitId, pricingUnits.id))
        .orderBy(desc(truckTypes.createdAt));

      return { success: true, data };
    } catch (error: any) {
      logger.error('Admin list trucks failed:', { error });
      return { success: false, message: error?.message || 'Failed to fetch trucks', data: [] };
    }
  }),

  createTruck: adminProcedure.handler(async ({ input }) => {
    const validated = createTruckTypeSchema.parse(input);
    try {
      const id = crypto.randomUUID();
      await db.insert(truckTypes).values({
        id,
        ...validated,
        isActive: true,
      });
      return { success: true, message: 'Truck type created successfully', id };
    } catch (error: any) {
      logger.error('Admin create truck failed:', { error });
      return { success: false, message: error?.message || 'Failed to create truck type' };
    }
  }),

  updateTruck: adminProcedure.handler(async ({ input }) => {
    const validated = updateTruckTypeSchema.parse(input);
    const { id, ...updates } = validated;
    try {
      await db.update(truckTypes).set(updates).where(eq(truckTypes.id, id));
      return { success: true, message: 'Truck type updated successfully' };
    } catch (error: any) {
      logger.error('Admin update truck failed:', { error });
      return { success: false, message: error?.message || 'Failed to update truck type' };
    }
  }),

  toggleTruckStatus: adminProcedure.handler(async ({ input }) => {
    const { id, isActive } = toggleActiveSchema.parse(input);
    try {
      const [existing] = await db.select({ isActive: truckTypes.isActive }).from(truckTypes).where(eq(truckTypes.id, id)).limit(1);
      if (!existing) return { success: false, message: 'Truck type not found' };

      const newStatus = isActive !== undefined ? isActive : !existing.isActive;
      await db.update(truckTypes).set({ isActive: newStatus }).where(eq(truckTypes.id, id));
      return { success: true, message: `Truck ${newStatus ? 'activated' : 'deactivated'} successfully` };
    } catch (error: any) {
      logger.error('Admin toggle truck failed:', { error });
      return { success: false, message: error?.message || 'Failed to update truck status' };
    }
  }),

  // ==========================================
  // GOODS TYPES MANAGEMENT
  // ==========================================
  listGoods: authProcedure.handler(async () => {
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
          createdAt: goodsTypes.createdAt,
          defaultUnit: {
            id: pricingUnits.id,
            unitCode: pricingUnits.unitCode,
            nameEn: pricingUnits.nameEn,
          },
        })
        .from(goodsTypes)
        .leftJoin(pricingUnits, eq(goodsTypes.defaultUnitId, pricingUnits.id))
        .orderBy(desc(goodsTypes.createdAt));

      return { success: true, data };
    } catch (error: any) {
      logger.error('Admin list goods failed:', { error });
      return { success: false, message: error?.message || 'Failed to fetch goods types', data: [] };
    }
  }),

  createGoods: adminProcedure.handler(async ({ input }) => {
    const validated = createGoodsTypeSchema.parse(input);
    try {
      const id = crypto.randomUUID();
      await db.insert(goodsTypes).values({
        id,
        ...validated,
        isActive: true,
      });
      return { success: true, message: 'Goods type created successfully', id };
    } catch (error: any) {
      logger.error('Admin create goods failed:', { error });
      return { success: false, message: error?.message || 'Failed to create goods type' };
    }
  }),

  createGood: adminProcedure.handler(async ({ input }) => {
    const validated = createGoodsTypeSchema.parse(input);
    try {
      const id = crypto.randomUUID();
      await db.insert(goodsTypes).values({
        id,
        ...validated,
        isActive: true,
      });
      return { success: true, message: 'Goods type created successfully', id };
    } catch (error: any) {
      logger.error('Admin create goods failed:', { error });
      return { success: false, message: error?.message || 'Failed to create goods type' };
    }
  }),

  updateGoods: adminProcedure.handler(async ({ input }) => {
    const validated = updateGoodsTypeSchema.parse(input);
    const { id, ...updates } = validated;
    try {
      await db.update(goodsTypes).set(updates).where(eq(goodsTypes.id, id));
      return { success: true, message: 'Goods type updated successfully' };
    } catch (error: any) {
      logger.error('Admin update goods failed:', { error });
      return { success: false, message: error?.message || 'Failed to update goods type' };
    }
  }),

  updateGood: adminProcedure.handler(async ({ input }) => {
    const validated = updateGoodsTypeSchema.parse(input);
    const { id, ...updates } = validated;
    try {
      await db.update(goodsTypes).set(updates).where(eq(goodsTypes.id, id));
      return { success: true, message: 'Goods type updated successfully' };
    } catch (error: any) {
      logger.error('Admin update goods failed:', { error });
      return { success: false, message: error?.message || 'Failed to update goods type' };
    }
  }),

  toggleGoodsStatus: adminProcedure.handler(async ({ input }) => {
    const { id, isActive } = toggleActiveSchema.parse(input);
    try {
      const [existing] = await db.select({ isActive: goodsTypes.isActive }).from(goodsTypes).where(eq(goodsTypes.id, id)).limit(1);
      if (!existing) return { success: false, message: 'Goods type not found' };

      const newStatus = isActive !== undefined ? isActive : !existing.isActive;
      await db.update(goodsTypes).set({ isActive: newStatus }).where(eq(goodsTypes.id, id));
      return { success: true, message: `Goods type ${newStatus ? 'activated' : 'deactivated'} successfully` };
    } catch (error: any) {
      logger.error('Admin toggle goods failed:', { error });
      return { success: false, message: error?.message || 'Failed to update goods status' };
    }
  }),

  toggleGoodStatus: adminProcedure.handler(async ({ input }) => {
    const { id, isActive } = toggleActiveSchema.parse(input);
    try {
      const [existing] = await db.select({ isActive: goodsTypes.isActive }).from(goodsTypes).where(eq(goodsTypes.id, id)).limit(1);
      if (!existing) return { success: false, message: 'Goods type not found' };

      const newStatus = isActive !== undefined ? isActive : !existing.isActive;
      await db.update(goodsTypes).set({ isActive: newStatus }).where(eq(goodsTypes.id, id));
      return { success: true, message: `Goods type ${newStatus ? 'activated' : 'deactivated'} successfully` };
    } catch (error: any) {
      logger.error('Admin toggle goods failed:', { error });
      return { success: false, message: error?.message || 'Failed to update goods status' };
    }
  }),

  // ==========================================
  // MARKET RATES MANAGEMENT
  // ==========================================
  listRates: authProcedure.handler(async () => {
    try {
      const data = await db
        .select({
          id: marketRates.id,
          originCityId: marketRates.originCityId,
          destinationCityId: marketRates.destinationCityId,
          pricingUnitId: marketRates.pricingUnitId,
          minRate: marketRates.minRate,
          maxRate: marketRates.maxRate,
          isActive: marketRates.isActive,
          createdAt: marketRates.createdAt,
          updatedAt: marketRates.updatedAt,
        })
        .from(marketRates)
        .orderBy(desc(marketRates.updatedAt));

      return { success: true, data };
    } catch (error: any) {
      logger.error('Admin list rates failed:', { error });
      return { success: false, message: error?.message || 'Failed to fetch market rates', data: [] };
    }
  }),

  createRate: adminProcedure.handler(async ({ input, context }) => {
    const validated = createMarketRateSchema.parse(input);
    try {
      const id = crypto.randomUUID();
      await db.insert(marketRates).values({
        id,
        ...validated,
        updatedBy: context.user.id,
        isActive: true,
      });
      return { success: true, message: 'Market rate created successfully', id };
    } catch (error: any) {
      logger.error('Admin create rate failed:', { error });
      return { success: false, message: error?.message || 'Failed to create rate (Route with unit may already exist)' };
    }
  }),

  updateRate: adminProcedure.handler(async ({ input, context }) => {
    const validated = updateMarketRateSchema.parse(input);
    const { id, ...updates } = validated;
    try {
      await db
        .update(marketRates)
        .set({
          ...updates,
          updatedBy: context.user.id,
        })
        .where(eq(marketRates.id, id));
      return { success: true, message: 'Market rate updated successfully' };
    } catch (error: any) {
      logger.error('Admin update rate failed:', { error });
      return { success: false, message: error?.message || 'Failed to update market rate' };
    }
  }),

  toggleRateStatus: adminProcedure.handler(async ({ input }) => {
    const { id, isActive } = toggleActiveSchema.parse(input);
    try {
      const [existing] = await db.select({ isActive: marketRates.isActive }).from(marketRates).where(eq(marketRates.id, id)).limit(1);
      if (!existing) return { success: false, message: 'Market rate not found' };

      const newStatus = isActive !== undefined ? isActive : !existing.isActive;
      await db.update(marketRates).set({ isActive: newStatus }).where(eq(marketRates.id, id));
      return { success: true, message: `Market rate ${newStatus ? 'activated' : 'deactivated'} successfully` };
    } catch (error: any) {
      logger.error('Admin toggle rate failed:', { error });
      return { success: false, message: error?.message || 'Failed to update rate status' };
    }
  }),
});
