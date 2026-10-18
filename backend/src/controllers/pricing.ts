import { os } from '@orpc/server';
import { db } from '../database/db.js';
import {
  marketRates,
  cities,
  pricingUnits,
} from '../database/schema/master-data-schema.js';
import { managerAssignedCities } from '../database/schema/manager-schema.js';
import { user } from '../database/schema/auth-schema.js';
import { eq, and } from 'drizzle-orm';
import { getEstimateSchema } from '../schemas/master-data-schemas.js';
import { logger } from '../utils/logger.js';

/**
 * Hybrid Pricing Engine Router
 * Computes price guidance using:
 *  Tier 1: Town Manager / Delala Verified Benchmark Rates
 *  Tier 2: Standardized Heuristic Fallback (e.g., base trip/distance calculations)
 */
export const pricingRouter = os.router({
  getEstimate: os.handler(async ({ input }) => {
    const validated = getEstimateSchema.parse(input);
    const { originCityId, destinationCityId, pricingUnitId, quantity, truckTypeId } = validated;

    try {
      // 1. Check for Curated Market Rate (Tier 1: Town Manager Ground Benchmark)
      // Must be published by a manager assigned to the pickup origin city (or admin)
      const matchingRates = await db
        .select({
          id: marketRates.id,
          truckTypeId: marketRates.truckTypeId,
          baseRate: marketRates.baseRate,
          minRate: marketRates.minRate,
          maxRate: marketRates.maxRate,
          marketCondition: marketRates.marketCondition,
          isFixedPrice: marketRates.isFixedPrice,
          notes: marketRates.notes,
          managerId: marketRates.managerId,
          updatedBy: marketRates.updatedBy,
          unitCode: pricingUnits.unitCode,
          originName: cities.nameEn,
          destinationName: cities.nameEn,
          publisherRole: user.role,
        })
        .from(marketRates)
        .innerJoin(pricingUnits, eq(marketRates.pricingUnitId, pricingUnits.id))
        .innerJoin(cities, eq(marketRates.originCityId, cities.id))
        .leftJoin(user, eq(marketRates.updatedBy, user.id))
        .where(
          and(
            eq(marketRates.originCityId, originCityId),
            eq(marketRates.destinationCityId, destinationCityId),
            eq(marketRates.pricingUnitId, pricingUnitId),
            eq(marketRates.isActive, true)
          )
        );

      // Prioritize truck-type specific benchmark if truckTypeId is provided
      let prioritizedCandidates = matchingRates;
      if (truckTypeId) {
        const truckSpecific = matchingRates.filter((r) => r.truckTypeId === truckTypeId);
        if (truckSpecific.length > 0) {
          prioritizedCandidates = truckSpecific;
        } else {
          // Fallback to corridor general rate where truckTypeId is null
          const generalRates = matchingRates.filter((r) => !r.truckTypeId);
          if (generalRates.length > 0) {
            prioritizedCandidates = generalRates;
          }
        }
      } else {
        // No truck specified, prefer general rates first
        const generalRates = matchingRates.filter((r) => !r.truckTypeId);
        if (generalRates.length > 0) {
          prioritizedCandidates = generalRates;
        }
      }

      let verifiedRate: typeof matchingRates[0] | null = null;

      if (prioritizedCandidates.length === 1) {
        const candidate = prioritizedCandidates[0];
        // Check if publisher is admin or if manager is verified for origin city
        if (candidate.publisherRole === 'admin') {
          verifiedRate = candidate;
        } else if (candidate.managerId) {
          const [isAssigned] = await db
            .select()
            .from(managerAssignedCities)
            .where(
              and(
                eq(managerAssignedCities.managerId, candidate.managerId),
                eq(managerAssignedCities.cityId, originCityId)
              )
            )
            .limit(1);

          if (isAssigned) {
            verifiedRate = candidate;
          }
        }
      } else if (prioritizedCandidates.length > 1) {
        // Multiple rates exist: prioritize manager strictly assigned to originCityId
        for (const candidate of prioritizedCandidates) {
          if (candidate.managerId) {
            const [isAssigned] = await db
              .select()
              .from(managerAssignedCities)
              .where(
                and(
                  eq(managerAssignedCities.managerId, candidate.managerId),
                  eq(managerAssignedCities.cityId, originCityId)
                )
              )
              .limit(1);

            if (isAssigned) {
              if (verifiedRate) {
                // Ambiguous: multiple assigned managers published rates -> conflict fallback to Tier 2
                logger.warn('Multiple assigned manager rates detected for route, falling back to heuristic:', {
                  originCityId,
                  destinationCityId,
                  truckTypeId,
                });
                verifiedRate = null;
                break;
              }
              verifiedRate = candidate;
            }
          }
        }
      }

      if (verifiedRate) {
        const baseRateNum = parseFloat(verifiedRate.baseRate) || 0;
        const minRateNum = parseFloat(verifiedRate.minRate);
        const maxRateNum = parseFloat(verifiedRate.maxRate);
        const benchmarkRate = baseRateNum > 0 ? baseRateNum : (minRateNum + maxRateNum) / 2;

        const totalMin = Math.round(minRateNum * quantity);
        const totalMax = Math.round(maxRateNum * quantity);
        const totalBenchmark = Math.round(benchmarkRate * quantity);

        const isFixed = verifiedRate.isFixedPrice ?? false;

        return {
          success: true,
          source: 'manager_curated' as const,
          isFixedPrice: isFixed,
          badgeText: isFixed
            ? 'Guaranteed Fixed Tariff (የተረጋገጠ ቋሚ ዋጋ)'
            : 'Verified Market Benchmark (የተረጋገጠ የወቅቱ ዋጋ)',
          unitCode: verifiedRate.unitCode,
          quantity,
          marketCondition: verifiedRate.marketCondition,
          notes: verifiedRate.notes,
          unitRate: {
            min: minRateNum,
            max: maxRateNum,
            benchmark: benchmarkRate,
          },
          totalEstimate: {
            min: totalMin,
            max: totalMax,
            benchmark: totalBenchmark,
          },
          guidance: {
            recommendedBudget: totalBenchmark,
            fastPickupBudget: Math.round(totalBenchmark * 1.1), // +10% fast match
            economyBudget: Math.round(totalBenchmark * 0.95),   // -5% flexible
          },
        };
      }

      // 2. Tier 2: Heuristic / Base Distance Fallback
      // When no Town Manager rate is logged, calculate a baseline market heuristic
      logger.info('No curated market rate found, calculating heuristic fallback for route:', {
        originCityId,
        destinationCityId,
        pricingUnitId,
      });

      // Get unit details for heuristic multiplier
      const [unit] = await db
        .select()
        .from(pricingUnits)
        .where(eq(pricingUnits.id, pricingUnitId))
        .limit(1);

      const unitCode = unit?.unitCode || 'QTL';
      
      // Default baseline multipliers per Ethiopian freight conventions
      let baseRatePerUnit = 55; // baseline ~55 ETB / quintal
      if (unitCode === 'TON') baseRatePerUnit = 550;
      else if (unitCode === 'HD') baseRatePerUnit = 175; // per livestock head
      else if (unitCode === 'TRP') baseRatePerUnit = 25000; // full flat trip base

      const heuristicRate = baseRatePerUnit;
      const totalMin = Math.round(heuristicRate * 0.9 * quantity);
      const totalMax = Math.round(heuristicRate * 1.15 * quantity);
      const totalBenchmark = Math.round(heuristicRate * quantity);

      return {
        success: true,
        source: 'estimated' as const,
        badgeText: 'Estimated Market Rate (ግምታዊ የገበያ ዋጋ)',
        unitCode,
        quantity,
        unitRate: {
          min: Math.round(heuristicRate * 0.9),
          max: Math.round(heuristicRate * 1.15),
          benchmark: heuristicRate,
        },
        totalEstimate: {
          min: totalMin,
          max: totalMax,
          benchmark: totalBenchmark,
        },
        guidance: {
          recommendedBudget: totalBenchmark,
          fastPickupBudget: Math.round(totalBenchmark * 1.1),
          economyBudget: Math.round(totalBenchmark * 0.95),
        },
      };
    } catch (error) {
      logger.error('Failed to calculate pricing estimate:', { error });
      return {
        success: false,
        message: 'Could not calculate price estimate',
        source: 'estimated' as const,
        badgeText: 'Estimated Rate',
        totalEstimate: { min: 0, max: 0, benchmark: 0 },
      };
    }
  }),
});
