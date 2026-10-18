import { db } from '../database/db.js';
import { user, userRoles } from '../database/schema/auth-schema.js';
import { order, orderStatus } from '../database/schema/order-schema.js';
import { vehicle } from '../database/schema/vehicle-schema.js';
import { wallet, walletTransaction } from '../database/schema/wallet-schema.js';
import { agentProfile } from '../database/schema/agent-schema.js';
import { commissionHistory, assistanceVerification, NewCommissionHistory } from '../database/schema/commission-schema.js';
import { townManager, territory, managerCompensation, managerAssignedCities } from '../database/schema/manager-schema.js';
import { cities } from '../database/schema/master-data-schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { getTierMultiplier } from './tier.js';
import crypto, { randomUUID } from 'node:crypto';
import { logger } from '../utils/logger.js';

const PLATFORM_COMMISSION_RATE = 0.07; // 7% of final freight value

const USER_COMMISSION_RATES = [
  0.35, // 1st usage cycle (35% of platform commission)
  0.25, // 2nd usage cycle (25% of platform commission)
  0.15, // 3rd+ usage cycle (15% of platform commission)
];

const DRIVER_COMMISSION_RATES = [
  0.15, // 1st completed transport job (15% of platform commission)
  0.135, // 2nd completed transport job (13.5% of platform commission)
  0.10, // 3rd+ completed transport job (10% of platform commission)
];

const ASSISTED_COMMISSION_RATE = 0.15; // 15% of platform commission
const TOWN_MANAGER_TERRITORIAL_RATE = 0.015; // 1.5% of total freight value for origin Town Manager

async function getAgentTier(agentId: string): Promise<string> {
  try {
    const profile = await db.query.agentProfile.findFirst({
      where: eq(agentProfile.userId, agentId),
    });
    return profile?.tier || 'bronze';
  } catch {
    return 'bronze';
  }
}
const MANAGER_OVERRIDE_COMMISSION_RATE = 0.05; // 5% of agent earnings

export async function calculateCommission(orderId: string): Promise<void> {
  try {
    logger.info(`[CommissionService] Starting commission calculation for order: ${orderId}`);

    const orderData = await db.query.order.findFirst({
      where: eq(order.id, orderId),
    });

    if (!orderData || orderData.status !== orderStatus.COMPLETED || !orderData.finalPrice) {
      logger.warn(`[CommissionService] Order ${orderId} not found, not completed, or missing final price. Skipping commission calculation.`);
      return;
    }

    const customer = await db.query.user.findFirst({
      where: eq(user.id, orderData.customerId),
    });

    if (!customer) {
      logger.error(`[CommissionService] Customer not found for order: ${orderId}`);
      return;
    }

    const driver = orderData.driverId ? await db.query.user.findFirst({
      where: eq(user.id, orderData.driverId),
    }) : null;

    const vehicleData = driver ? await db.query.vehicle.findFirst({
      where: eq(vehicle.driverId, driver.id),
    }) : null;

    const finalPrice = parseFloat(orderData.finalPrice);
    const platformCommissionBase = finalPrice * PLATFORM_COMMISSION_RATE;

    logger.info(`[CommissionService] Order ${orderId} details: Final Price=${finalPrice}, Platform Commission Base=${platformCommissionBase}`);

    // Process User Commission
    if (customer.registeredByAgentId) {
      await processUserCommission(orderData, customer, platformCommissionBase);
      // Process manager override commission for user commission
      await processManagerCompensation(customer.registeredByAgentId, orderData.id, 'override_commission', platformCommissionBase * USER_COMMISSION_RATES[0]);
    }

    // Process Driver Commission
    if (driver && vehicleData && vehicleData.registeredByAgentId) {
      await processDriverCommission(orderData, driver, vehicleData, platformCommissionBase);
      // Process manager override commission for driver commission
      await processManagerCompensation(vehicleData.registeredByAgentId, orderData.id, 'override_commission', platformCommissionBase * DRIVER_COMMISSION_RATES[0]);
    }

    // Process Assisted Commission
    await processAssistedCommission(orderData, platformCommissionBase);

    // Process Town Manager Territorial Origin Commission (1.5% of trip freight value)
    await processTerritorialManagerCommission(orderData, finalPrice);

    logger.info(`[CommissionService] Completed commission calculation for order: ${orderId}`);
  } catch (error) {
    logger.error(`[CommissionService] Error calculating commission for order ${orderId}:`, error);
  }
}

async function processUserCommission(orderData: typeof order.$inferSelect, customer: typeof user.$inferSelect, platformCommissionBase: number): Promise<void> {
  try {
    const agentId = customer.registeredByAgentId;
    if (!agentId) return; // Should not happen if checked before

    // Check for idempotency
    const existingCommission = await db.query.commissionHistory.findFirst({
      where: and(
        eq(commissionHistory.orderId, orderData.id),
        eq(commissionHistory.agentId, agentId),
        eq(commissionHistory.subjectId, customer.id),
        eq(commissionHistory.commissionType, 'user'),
      ),
    });

    if (existingCommission) {
      logger.warn(`[CommissionService] Duplicate user commission for order ${orderData.id}, agent ${agentId}, customer ${customer.id}. Skipping.`);
      return;
    }

    // Increment user cycle count
    await db.update(user)
      .set({ userCycleCount: sql`${user.userCycleCount} + 1` })
      .where(eq(user.id, customer.id));

    const updatedCustomer = await db.query.user.findFirst({
      where: eq(user.id, customer.id),
    });

    if (!updatedCustomer) {
        logger.error(`[CommissionService] Failed to find updated customer ${customer.id}`);
        return;
    }

    const cycleIndex = Math.min(updatedCustomer.userCycleCount!, USER_COMMISSION_RATES.length) - 1;
    const rateApplied = USER_COMMISSION_RATES[cycleIndex];
    const tier = await getAgentTier(agentId);
    const tierMultiplier = getTierMultiplier(tier);
    const payoutAmount = platformCommissionBase * rateApplied * tierMultiplier;

    await recordAndCreditCommission({
      agentId,
      subjectId: customer.id,
      orderId: orderData.id,
      commissionType: 'user',
      baseAmount: platformCommissionBase,
      rateApplied,
      payoutAmount,
      stageIndex: updatedCustomer.userCycleCount!,
      isAssisted: false,
      antiAbuseFlag: false,
      status: 'completed',
    });

    // Update user lifetime earnings (for the agent's analytics)
    await db.update(user)
      .set({ userLifetimeEarnings: sql`${user.userLifetimeEarnings} + ${payoutAmount}` })
      .where(eq(user.id, customer.id)); // This is actually the customer's lifetime earnings towards an agent.

    logger.info(`[CommissionService] User commission processed for order ${orderData.id}: Agent=${agentId}, Customer=${customer.id}, Payout=${payoutAmount}`);
  } catch (error) {
    logger.error(`[CommissionService] Error processing user commission for order ${orderData.id}:`, error);
  }
}

async function processDriverCommission(orderData: typeof order.$inferSelect, driver: typeof user.$inferSelect, vehicleData: typeof vehicle.$inferSelect, platformCommissionBase: number): Promise<void> {
  try {
    const agentId = vehicleData.registeredByAgentId;
    if (!agentId) return; // Should not happen if checked before

    // Check for idempotency
    const existingCommission = await db.query.commissionHistory.findFirst({
      where: and(
        eq(commissionHistory.orderId, orderData.id),
        eq(commissionHistory.agentId, agentId),
        eq(commissionHistory.subjectId, vehicleData.id),
        eq(commissionHistory.commissionType, 'driver'),
      ),
    });

    if (existingCommission) {
      logger.warn(`[CommissionService] Duplicate driver commission for order ${orderData.id}, agent ${agentId}, vehicle ${vehicleData.id}. Skipping.`);
      return;
    }

    // Increment driver cycle count for the vehicle
    await db.update(vehicle)
      .set({ driverCycleCount: sql`${vehicle.driverCycleCount} + 1` })
      .where(eq(vehicle.id, vehicleData.id));

    const updatedVehicle = await db.query.vehicle.findFirst({
      where: eq(vehicle.id, vehicleData.id),
    });

    if (!updatedVehicle) {
        logger.error(`[CommissionService] Failed to find updated vehicle ${vehicleData.id}`);
        return;
    }

    const cycleIndex = Math.min(updatedVehicle.driverCycleCount!, DRIVER_COMMISSION_RATES.length) - 1;
    const rateApplied = DRIVER_COMMISSION_RATES[cycleIndex];
    const tier = await getAgentTier(agentId);
    const tierMultiplier = getTierMultiplier(tier);
    const payoutAmount = platformCommissionBase * rateApplied * tierMultiplier;

    await recordAndCreditCommission({
      agentId,
      subjectId: vehicleData.id,
      orderId: orderData.id,
      commissionType: 'driver',
      baseAmount: platformCommissionBase,
      rateApplied,
      payoutAmount,
      stageIndex: updatedVehicle.driverCycleCount!,
      isAssisted: false,
      antiAbuseFlag: false,
      status: 'completed',
    });

    // Update driver lifetime earnings (for the agent's analytics)
    await db.update(vehicle)
      .set({ driverLifetimeEarnings: sql`${vehicle.driverLifetimeEarnings} + ${payoutAmount}` })
      .where(eq(vehicle.id, vehicleData.id));

    logger.info(`[CommissionService] Driver commission processed for order ${orderData.id}: Agent=${agentId}, Driver=${driver.id}, Vehicle=${vehicleData.id}, Payout=${payoutAmount}`);
  } catch (error) {
    logger.error(`[CommissionService] Error processing driver commission for order ${orderData.id}:`, error);
  }
}

async function processAssistedCommission(orderData: typeof order.$inferSelect, platformCommissionBase: number): Promise<void> {
  try {
    const assistanceRecord = await db.query.assistanceVerification.findFirst({
      where: and(
        eq(assistanceVerification.orderId, orderData.id),
        eq(assistanceVerification.verificationStatus, 'verified'),
      ),
    });

    if (!assistanceRecord) {
      logger.info(`[CommissionService] No verified assistance record for order ${orderData.id}. Skipping assisted commission.`);
      return;
    }

    const assistingAgentId = assistanceRecord.assistingAgentId;

    // Anti-abuse check: Prevent assisted commission if original agent is still actively earning on the user within the first 3 cycles.
    // This requires fetching the customer and checking their userCycleCount.
    const customer = await db.query.user.findFirst({
      where: eq(user.id, orderData.customerId),
    });

    if (customer && customer.registeredByAgentId && customer.userCycleCount && customer.userCycleCount <= 3) {
        // Also ensure the assisting agent is NOT the registering agent for this customer
        if (customer.registeredByAgentId === assistingAgentId) {
            logger.warn(`[CommissionService] Assisted commission blocked for order ${orderData.id}: Assisting agent is also registering agent, and user is in early cycle.`);
            return;
        }

      logger.warn(`[CommissionService] Assisted commission blocked for order ${orderData.id}: Original registering agent still active for user (cycle ${customer.userCycleCount}).`);
      return; // Block assisted commission
    }

    // Check for idempotency
    const existingCommission = await db.query.commissionHistory.findFirst({
      where: and(
        eq(commissionHistory.orderId, orderData.id),
        eq(commissionHistory.agentId, assistingAgentId),
        eq(commissionHistory.commissionType, 'assisted'),
      ),
    });

    if (existingCommission) {
      logger.warn(`[CommissionService] Duplicate assisted commission for order ${orderData.id}, agent ${assistingAgentId}. Skipping.`);
      return;
    }

    const tier = await getAgentTier(assistingAgentId);
    const tierMultiplier = getTierMultiplier(tier);
    const payoutAmount = platformCommissionBase * ASSISTED_COMMISSION_RATE * tierMultiplier;

    await recordAndCreditCommission({
      agentId: assistingAgentId,
      subjectId: orderData.customerId, // Subject is the customer who received assistance
      orderId: orderData.id,
      commissionType: 'assisted',
      baseAmount: platformCommissionBase,
      rateApplied: ASSISTED_COMMISSION_RATE,
      payoutAmount,
      stageIndex: 1, // Assisted is a flat rate, no stages
      isAssisted: true,
      antiAbuseFlag: false,
      status: 'completed',
    });

    logger.info(`[CommissionService] Assisted commission processed for order ${orderData.id}: Agent=${assistingAgentId}, Payout=${payoutAmount}`);
  } catch (error) {
    logger.error(`[CommissionService] Error processing assisted commission for order ${orderData.id}:`, error);
  }
}

// Helper to record commission history and credit agent's wallet
async function recordAndCreditCommission(data: {
  agentId: string;
  subjectId: string;
  orderId: string;
  commissionType: string;
  baseAmount: number;
  rateApplied: number;
  payoutAmount: number;
  stageIndex: number;
  isAssisted: boolean;
  antiAbuseFlag: boolean;
  status: string;
}): Promise<void> {
  try {
    const { randomUUID } = crypto;
    const commissionId = randomUUID();
    
    // Insert into commission history
    await db.insert(commissionHistory).values({
      id: commissionId,
      agentId: data.agentId,
      subjectId: data.subjectId,
      orderId: data.orderId,
      commissionType: data.commissionType,
      baseAmount: data.baseAmount.toFixed(2),
      rateApplied: data.rateApplied.toFixed(4),
      payoutAmount: data.payoutAmount.toFixed(2),
      stageIndex: data.stageIndex,
      isAssisted: data.isAssisted,
      antiAbuseFlag: data.antiAbuseFlag,
      status: data.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Get or create agent wallet
    let agentWallet = await db.query.wallet.findFirst({
      where: eq(wallet.userId, data.agentId),
    });

    if (!agentWallet) {
      await db.insert(wallet).values({
        id: randomUUID(),
        userId: data.agentId,
        balance: '0.00',
        reservedBalance: '0.00',
        totalTopup: '0.00',
        totalWithdrawn: '0.00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      agentWallet = await db.query.wallet.findFirst({
        where: eq(wallet.userId, data.agentId),
      });
    }

    if (!agentWallet) {
        throw new Error(`Agent wallet not found or could not be created for agent ${data.agentId}`);
    }

    // Update wallet balance
    await db.update(wallet)
      .set({
        balance: sql`${wallet.balance} + ${data.payoutAmount}`,
        totalTopup: sql`${wallet.totalTopup} + ${data.payoutAmount}`,
        updatedAt: new Date(),
      })
      .where(eq(wallet.id, agentWallet.id));

    // Create wallet transaction record
    await db.insert(walletTransaction).values({
      id: randomUUID(),
      userId: data.agentId,
      walletId: agentWallet.id,
      type: 'commission',
      amount: data.payoutAmount.toFixed(2),
      description: `Commission for ${data.commissionType} (Order: ${data.orderId}, Subject: ${data.subjectId})`,
      status: 'completed',
      referenceId: data.orderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    logger.info(`[CommissionService] Credited ${data.payoutAmount} to agent ${data.agentId} for ${data.commissionType} commission.`);
  } catch (error) {
    logger.error(`[CommissionService] Error recording and crediting commission for agent ${data.agentId}:`, error);
    throw error;
  }
}

/**
 * Process manager override commission (5% of agent earnings)
 */
async function processManagerCompensation(
  agentId: string,
  orderId: string,
  compensationType: string,
  agentCommissionAmount: number
): Promise<void> {
  try {
    const [agentTerritory] = await db
      .select({ managerId: territory.managerId })
      .from(territory)
      .where(and(eq(territory.agentId, agentId), eq(territory.status, 'active')))
      .limit(1);

    if (!agentTerritory) return;

    const managerCut = Math.round(agentCommissionAmount * MANAGER_OVERRIDE_COMMISSION_RATE * 100) / 100;
    if (managerCut <= 0) return;

    const [mgr] = await db
      .select()
      .from(townManager)
      .where(eq(townManager.id, agentTerritory.managerId))
      .limit(1);

    if (!mgr) return;

    const currentMonth = new Date().toISOString().slice(0, 7);
    await db.insert(managerCompensation).values({
      id: randomUUID(),
      managerId: mgr.id,
      type: compensationType,
      amount: managerCut.toFixed(2),
      sourceAgentId: agentId,
      referenceId: orderId,
      month: currentMonth,
      status: 'approved',
    });

    logger.info(`[CommissionService] Recorded ${managerCut} ETB agent override for Manager ${mgr.townName}`);
  } catch (error) {
    logger.error(`[CommissionService] Error processing manager compensation for agent ${agentId}:`, error);
  }
}

/**
 * Process Town Manager territorial commission (1.5% of trip freight value)
 * Automatically credits the local Town Manager who oversees the pickup origin city!
 */
async function processTerritorialManagerCommission(
  orderData: typeof order.$inferSelect,
  finalPrice: number
): Promise<void> {
  try {
    const allCities = await db.select().from(cities).where(eq(cities.isActive, true));
    const pickupLower = (orderData.pickupAddress || '').toLowerCase();
    const matchedCity = allCities.find(
      (c) => pickupLower.includes(c.nameEn.toLowerCase()) || pickupLower.includes(c.nameAm)
    );

    if (!matchedCity) {
      logger.info(`[CommissionService] No matching master city found for pickup address: "${orderData.pickupAddress}". Skipping territorial commission.`);
      return;
    }

    // Find assigned manager for this origin city
    const [assigned] = await db
      .select({ manager: townManager })
      .from(managerAssignedCities)
      .innerJoin(townManager, eq(managerAssignedCities.managerId, townManager.id))
      .where(eq(managerAssignedCities.cityId, matchedCity.id))
      .limit(1);

    if (!assigned?.manager) {
      logger.info(`[CommissionService] No assigned Town Manager for origin city ${matchedCity.nameEn} (${matchedCity.id}).`);
      return;
    }

    const manager = assigned.manager;
    const managerPayout = Math.round(finalPrice * TOWN_MANAGER_TERRITORIAL_RATE * 100) / 100;
    if (managerPayout <= 0) return;

    const currentMonth = new Date().toISOString().slice(0, 7);

    // 1. Record manager compensation ledger
    await db.insert(managerCompensation).values({
      id: randomUUID(),
      managerId: manager.id,
      type: 'territorial_override',
      amount: managerPayout.toFixed(2),
      referenceId: orderData.id,
      month: currentMonth,
      status: 'approved',
    });

    // 2. Find or create manager digital wallet
    let [managerWallet] = await db
      .select()
      .from(wallet)
      .where(eq(wallet.userId, manager.userId))
      .limit(1);

    if (!managerWallet) {
      const newWalletId = randomUUID();
      await db.insert(wallet).values({
        id: newWalletId,
        userId: manager.userId,
        balance: '0.00',
        reservedBalance: '0.00',
        totalTopup: '0.00',
        totalWithdrawn: '0.00',
        isActive: true,
      });

      [managerWallet] = await db
        .select()
        .from(wallet)
        .where(eq(wallet.id, newWalletId))
        .limit(1);
    }

    if (managerWallet) {
      // 3. Credit wallet balance
      await db
        .update(wallet)
        .set({
          balance: sql`${wallet.balance} + ${managerPayout}`,
          totalTopup: sql`${wallet.totalTopup} + ${managerPayout}`,
          updatedAt: new Date(),
        })
        .where(eq(wallet.id, managerWallet.id));

      // 4. Create wallet transaction
      await db.insert(walletTransaction).values({
        id: randomUUID(),
        userId: manager.userId,
        walletId: managerWallet.id,
        type: 'commission',
        amount: managerPayout.toFixed(2),
        description: `Town Manager 1.5% Territorial Commission for Order ${orderData.id} originating from ${matchedCity.nameEn}`,
        status: 'completed',
        referenceId: orderData.id,
      });
    }

    // 5. Update regional revenue on townManager
    await db
      .update(townManager)
      .set({
        regionalRevenue: sql`COALESCE(${townManager.regionalRevenue}, 0) + ${finalPrice}`,
        updatedAt: new Date(),
      })
      .where(eq(townManager.id, manager.id));

    logger.info(
      `[CommissionService] ✅ Credited ${managerPayout} ETB territorial commission to Town Manager ${manager.townName} (User ${manager.userId}) for Order ${orderData.id}`
    );
  } catch (error) {
    logger.error('[CommissionService] Error processing territorial manager commission:', error);
  }
}
