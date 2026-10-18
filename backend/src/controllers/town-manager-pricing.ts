import { os, ORPCError } from '@orpc/server';
import { z } from 'zod';
import { authProcedure } from '../middlewares/auth.js';
import { db } from '../database/db.js';
import { townManager, managerAssignedCities } from '../database/schema/manager-schema.js';
import { marketRates, cities, pricingUnits, truckTypes } from '../database/schema/master-data-schema.js';
import { eq, and, inArray, desc, sql, isNull } from 'drizzle-orm';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

export const setMarketRateSchema = z.object({
  originCityId: z.string().min(1, 'Origin city is required'),
  destinationCityId: z.string().min(1, 'Destination city is required'),
  pricingUnitId: z.string().min(1, 'Pricing unit is required'),
  truckTypeId: z.string().optional().nullable(),
  baseRate: z.number().positive('Base rate must be a positive number'),
  marketCondition: z.enum(['NORMAL', 'HIGH_DEMAND', 'POOR_ROAD']).default('NORMAL'),
  isFixedPrice: z.boolean().default(true),
  notes: z.string().optional(),
});

/**
 * Town Manager & Admin Pricing Controller
 * Enforces territory authorization boundaries and automates rate range calculations.
 */
export const townManagerPricingRouter = os.router({
  /**
   * Set or update a market rate (የወቅቱ መነሻ ዋጋ)
   */
  setMarketRate: authProcedure
    .input(setMarketRateSchema)
    .handler(async ({ input, context }) => {
      const user = context.user;
      const isAdmin = user.role === 'admin';
      let managerId: string | null = null;

      if (!isAdmin) {
        // Must be a town manager
        const [profile] = await db
          .select({ id: townManager.id })
          .from(townManager)
          .where(eq(townManager.userId, user.id))
          .limit(1);

        if (!profile) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You are not registered as an authorized Town Manager.',
          });
        }

        managerId = profile.id;

        // Retrieve assigned cities for this manager
        const assignedRecords = await db
          .select({ cityId: managerAssignedCities.cityId })
          .from(managerAssignedCities)
          .where(eq(managerAssignedCities.managerId, profile.id));

        const assignedCityIds = assignedRecords.map((r) => r.cityId);

        // Validation Guard: Origin city must be in assigned territory
        if (!assignedCityIds.includes(input.originCityId)) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You are not authorized to publish rates outside your assigned territory.',
          });
        }
      } else {
        // If admin, find or leave managerId null
        const [profile] = await db
          .select({ id: townManager.id })
          .from(townManager)
          .where(eq(townManager.userId, user.id))
          .limit(1);
        managerId = profile?.id || null;
      }

      // Automatic calculation of minRate and maxRate based on baseRate, isFixedPrice & marketCondition
      const base = input.baseRate;
      let calculatedMinRate: string;
      let calculatedMaxRate: string;

      if (input.isFixedPrice) {
        calculatedMinRate = base.toFixed(2);
        calculatedMaxRate = base.toFixed(2);
      } else {
        let minMultiplier = 0.90;
        let maxMultiplier = 1.15;

        if (input.marketCondition === 'HIGH_DEMAND') {
          minMultiplier = 0.95;
          maxMultiplier = 1.25;
        } else if (input.marketCondition === 'POOR_ROAD') {
          minMultiplier = 1.00;
          maxMultiplier = 1.30;
        }

        calculatedMinRate = (Math.round(base * minMultiplier * 100) / 100).toFixed(2);
        calculatedMaxRate = (Math.round(base * maxMultiplier * 100) / 100).toFixed(2);
      }
      const baseRateFormatted = base.toFixed(2);

      try {
        // Check if an existing rate exists for (origin, destination, unit, truckType)
        const truckTypeCondition = input.truckTypeId
          ? eq(marketRates.truckTypeId, input.truckTypeId)
          : isNull(marketRates.truckTypeId);

        const [existingRate] = await db
          .select({ id: marketRates.id })
          .from(marketRates)
          .where(
            and(
              eq(marketRates.originCityId, input.originCityId),
              eq(marketRates.destinationCityId, input.destinationCityId),
              eq(marketRates.pricingUnitId, input.pricingUnitId),
              truckTypeCondition
            )
          )
          .limit(1);

        if (existingRate) {
          await db
            .update(marketRates)
            .set({
              truckTypeId: input.truckTypeId || null,
              baseRate: baseRateFormatted,
              minRate: calculatedMinRate,
              maxRate: calculatedMaxRate,
              marketCondition: input.marketCondition,
              isFixedPrice: input.isFixedPrice,
              notes: input.notes || null,
              managerId: managerId,
              updatedBy: user.id,
              isActive: true,
              updatedAt: new Date(),
            })
            .where(eq(marketRates.id, existingRate.id));

          logger.info(`[MarketRate] Updated benchmark rate ${existingRate.id} (Truck: ${input.truckTypeId || 'General'}) by user ${user.id} (Fixed: ${input.isFixedPrice})`);
          return {
            success: true,
            id: existingRate.id,
            action: 'updated' as const,
            truckTypeId: input.truckTypeId || null,
            baseRate: baseRateFormatted,
            minRate: calculatedMinRate,
            maxRate: calculatedMaxRate,
            marketCondition: input.marketCondition,
            isFixedPrice: input.isFixedPrice,
          };
        } else {
          const newId = crypto.randomUUID();
          await db.insert(marketRates).values({
            id: newId,
            originCityId: input.originCityId,
            destinationCityId: input.destinationCityId,
            pricingUnitId: input.pricingUnitId,
            truckTypeId: input.truckTypeId || null,
            baseRate: baseRateFormatted,
            minRate: calculatedMinRate,
            maxRate: calculatedMaxRate,
            marketCondition: input.marketCondition,
            isFixedPrice: input.isFixedPrice,
            notes: input.notes || null,
            managerId: managerId,
            updatedBy: user.id,
            isActive: true,
          });

          logger.info(`[MarketRate] Created new benchmark rate ${newId} (Truck: ${input.truckTypeId || 'General'}) by user ${user.id} (Fixed: ${input.isFixedPrice})`);
          return {
            success: true,
            id: newId,
            action: 'created' as const,
            truckTypeId: input.truckTypeId || null,
            baseRate: baseRateFormatted,
            minRate: calculatedMinRate,
            maxRate: calculatedMaxRate,
            marketCondition: input.marketCondition,
            isFixedPrice: input.isFixedPrice,
          };
        }
      } catch (error) {
        logger.error('Failed to set market rate:', { error });
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to save market rate benchmark.',
        });
      }
    }),

  /**
   * Get assigned cities for the authenticated manager
   */
  getMyAssignedCities: authProcedure.handler(async ({ context }) => {
    const user = context.user;
    const isAdmin = user.role === 'admin';

    if (isAdmin) {
      // Admins have access to all active cities
      const allCities = await db
        .select()
        .from(cities)
        .where(eq(cities.isActive, true))
        .orderBy(cities.nameEn);
      return { success: true, cities: allCities, isAdmin: true };
    }

    const [profile] = await db
      .select({ id: townManager.id, townName: townManager.townName, cityName: townManager.cityName })
      .from(townManager)
      .where(eq(townManager.userId, user.id))
      .limit(1);

    if (!profile) {
      return { success: false, message: 'Manager profile not found', cities: [], isAdmin: false };
    }

    const assigned = await db
      .select({
        id: cities.id,
        nameEn: cities.nameEn,
        nameAm: cities.nameAm,
        nameOm: cities.nameOm,
        region: cities.region,
        isActive: cities.isActive,
      })
      .from(managerAssignedCities)
      .innerJoin(cities, eq(managerAssignedCities.cityId, cities.id))
      .where(
        and(
          eq(managerAssignedCities.managerId, profile.id),
          eq(cities.isActive, true)
        )
      )
      .orderBy(cities.nameEn);

    return {
      success: true,
      cities: assigned,
      manager: profile,
      isAdmin: false,
    };
  }),

  /**
   * List market rates originating from manager's assigned jurisdiction
   */
  listMarketRates: authProcedure.handler(async ({ context }) => {
    const user = context.user;
    const isAdmin = user.role === 'admin';

    let originCityFilter: string[] = [];

    if (!isAdmin) {
      const [profile] = await db
        .select({ id: townManager.id })
        .from(townManager)
        .where(eq(townManager.userId, user.id))
        .limit(1);

      if (!profile) {
        return { success: false, message: 'Manager profile not found', rates: [] };
      }

      const assigned = await db
        .select({ cityId: managerAssignedCities.cityId })
        .from(managerAssignedCities)
        .where(eq(managerAssignedCities.managerId, profile.id));

      originCityFilter = assigned.map((a) => a.cityId);
      if (originCityFilter.length === 0) {
        return { success: true, rates: [] };
      }
    }

    // Build query with city aliases for origin and destination
    const query = db
      .select({
        id: marketRates.id,
        originCityId: marketRates.originCityId,
        originNameEn: sql<string>`origin_c.name_en`,
        originNameAm: sql<string>`origin_c.name_am`,
        destinationCityId: marketRates.destinationCityId,
        destNameEn: sql<string>`dest_c.name_en`,
        destNameAm: sql<string>`dest_c.name_am`,
        pricingUnitId: marketRates.pricingUnitId,
        unitCode: pricingUnits.unitCode,
        unitNameEn: pricingUnits.nameEn,
        unitNameAm: pricingUnits.nameAm,
        truckTypeId: marketRates.truckTypeId,
        truckNameEn: truckTypes.nameEn,
        truckNameAm: truckTypes.nameAm,
        truckCapacity: truckTypes.maxCapacity,
        baseRate: marketRates.baseRate,
        minRate: marketRates.minRate,
        maxRate: marketRates.maxRate,
        marketCondition: marketRates.marketCondition,
        isFixedPrice: marketRates.isFixedPrice,
        notes: marketRates.notes,
        managerId: marketRates.managerId,
        isActive: marketRates.isActive,
        updatedAt: marketRates.updatedAt,
      })
      .from(marketRates)
      .innerJoin(sql`cities as origin_c`, sql`origin_c.id = ${marketRates.originCityId}`)
      .innerJoin(sql`cities as dest_c`, sql`dest_c.id = ${marketRates.destinationCityId}`)
      .innerJoin(pricingUnits, eq(marketRates.pricingUnitId, pricingUnits.id))
      .leftJoin(truckTypes, eq(marketRates.truckTypeId, truckTypes.id))
      .orderBy(desc(marketRates.updatedAt));

    const rows = originCityFilter.length > 0
      ? await query.where(inArray(marketRates.originCityId, originCityFilter))
      : await query;

    return {
      success: true,
      rates: rows,
    };
  }),

  /**
   * Toggle active status of a market rate
   */
  toggleMarketRateStatus: authProcedure
    .input(z.object({ id: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      const user = context.user;
      const isAdmin = user.role === 'admin';

      const [rate] = await db
        .select()
        .from(marketRates)
        .where(eq(marketRates.id, input.id))
        .limit(1);

      if (!rate) {
        throw new ORPCError('NOT_FOUND', { message: 'Rate not found' });
      }

      if (!isAdmin) {
        // Verify manager is assigned to this rate's originCityId
        const [profile] = await db
          .select({ id: townManager.id })
          .from(townManager)
          .where(eq(townManager.userId, user.id))
          .limit(1);

        if (!profile) {
          throw new ORPCError('FORBIDDEN', { message: 'Manager profile not found' });
        }

        const [assigned] = await db
          .select()
          .from(managerAssignedCities)
          .where(
            and(
              eq(managerAssignedCities.managerId, profile.id),
              eq(managerAssignedCities.cityId, rate.originCityId)
            )
          )
          .limit(1);

        if (!assigned) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You are not authorized to modify rates outside your jurisdiction.',
          });
        }
      }

      const updatedStatus = !rate.isActive;
      await db
        .update(marketRates)
        .set({
          isActive: updatedStatus,
          updatedBy: user.id,
          updatedAt: new Date(),
        })
        .where(eq(marketRates.id, rate.id));

      return { success: true, isActive: updatedStatus };
    }),

  /**
   * Toggle between Constant Fixed Rate and Flexible Market Band
   */
  toggleFixedPriceMode: authProcedure
    .input(z.object({ id: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      const user = context.user;
      const isAdmin = user.role === 'admin';

      const [rate] = await db
        .select()
        .from(marketRates)
        .where(eq(marketRates.id, input.id))
        .limit(1);

      if (!rate) {
        throw new ORPCError('NOT_FOUND', { message: 'Rate not found' });
      }

      if (!isAdmin) {
        // Verify manager is assigned to this rate's originCityId
        const [profile] = await db
          .select({ id: townManager.id })
          .from(townManager)
          .where(eq(townManager.userId, user.id))
          .limit(1);

        if (!profile) {
          throw new ORPCError('FORBIDDEN', { message: 'Manager profile not found' });
        }

        const [assigned] = await db
          .select()
          .from(managerAssignedCities)
          .where(
            and(
              eq(managerAssignedCities.managerId, profile.id),
              eq(managerAssignedCities.cityId, rate.originCityId)
            )
          )
          .limit(1);

        if (!assigned) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You are not authorized to modify rates outside your jurisdiction.',
          });
        }
      }

      const nextIsFixed = !rate.isFixedPrice;
      const base = parseFloat(rate.baseRate);
      let calculatedMinRate: string;
      let calculatedMaxRate: string;

      if (nextIsFixed) {
        calculatedMinRate = base.toFixed(2);
        calculatedMaxRate = base.toFixed(2);
      } else {
        let minMultiplier = 0.90;
        let maxMultiplier = 1.15;
        if (rate.marketCondition === 'HIGH_DEMAND') {
          minMultiplier = 0.95;
          maxMultiplier = 1.25;
        } else if (rate.marketCondition === 'POOR_ROAD') {
          minMultiplier = 1.00;
          maxMultiplier = 1.30;
        }
        calculatedMinRate = (Math.round(base * minMultiplier * 100) / 100).toFixed(2);
        calculatedMaxRate = (Math.round(base * maxMultiplier * 100) / 100).toFixed(2);
      }

      await db
        .update(marketRates)
        .set({
          isFixedPrice: nextIsFixed,
          minRate: calculatedMinRate,
          maxRate: calculatedMaxRate,
          updatedBy: user.id,
          updatedAt: new Date(),
        })
        .where(eq(marketRates.id, rate.id));

      logger.info(`[MarketRate] Toggled fixed price mode for rate ${rate.id} to ${nextIsFixed}`);

      return {
        success: true,
        isFixedPrice: nextIsFixed,
        minRate: calculatedMinRate,
        maxRate: calculatedMaxRate,
      };
    }),
});
