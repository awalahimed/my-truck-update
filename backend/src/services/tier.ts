import { db } from '../database/db.js';
import { user } from '../database/schema/auth-schema.js';
import { agentProfile } from '../database/schema/agent-schema.js';
import { eq, sql, and, gte, lt } from 'drizzle-orm';
import { logger } from '../utils/logger.js';

export const TIERS = ['new', 'bronze', 'silver', 'gold', 'platinum'] as const;
export type Tier = (typeof TIERS)[number];

export const TIER_MULTIPLIERS: Record<Tier, number> = {
  new: 1.0,
  bronze: 1.0,
  silver: 1.1,
  gold: 1.25,
  platinum: 1.5,
};

interface TierRequirements {
  trucksRegistered: number;
  usersRegistered: number;
  completedDeliveries: number;
  conversionRate: number; // percentage
  minReliability: number; // percentage, 0 means no minimum
  monthlyActivity: boolean;
  revenueContribution: number; // minimum total finalPrice
  fraudFree: boolean;
}

const TIER_REQUIREMENTS: Record<Exclude<Tier, 'new'>, TierRequirements> = {
  bronze: {
    trucksRegistered: 7,
    usersRegistered: 7,
    completedDeliveries: 5,
    conversionRate: 15,
    minReliability: 1,
    monthlyActivity: false,
    revenueContribution: 0,
    fraudFree: false,
  },
  silver: {
    trucksRegistered: 15,
    usersRegistered: 20,
    completedDeliveries: 15,
    conversionRate: 25,
    minReliability: 60,
    monthlyActivity: true,
    revenueContribution: 0,
    fraudFree: false,
  },
  gold: {
    trucksRegistered: 30,
    usersRegistered: 30,
    completedDeliveries: 40,
    conversionRate: 35,
    minReliability: 80,
    monthlyActivity: true,
    revenueContribution: 2000,
    fraudFree: false,
  },
  platinum: {
    trucksRegistered: 60,
    usersRegistered: 60,
    completedDeliveries: 100,
    conversionRate: 50,
    minReliability: 90,
    monthlyActivity: true,
    revenueContribution: 5000,
    fraudFree: true,
  },
};

export function getTierMultiplier(tier: string): number {
  return TIER_MULTIPLIERS[tier as Tier] ?? 1.0;
}

export interface AgentTierStats {
  trucksRegistered: number;
  usersRegistered: number;
  completedDeliveries: number;
  conversionRate: number;
  reliabilityScore: number;
  totalRevenue: number;
  monthlyActivity: boolean;
  fraudFree: boolean;
}

export interface TierProgress {
  currentTier: Tier;
  qualifiedTier: Tier;
  nextTier: Tier | null;
  stats: AgentTierStats;
  progress: Record<string, { current: number; required: number; met: boolean }>;
  benefits: string[];
  nextTierBenefits: string[] | null;
}

const TIER_BENEFITS: Record<Tier, string[]> = {
  new: [
    'Getting started — complete deliveries to unlock Bronze tier',
    'Access to the MyTruck agent dashboard',
    'Basic commission access',
  ],
  bronze: [
    'Eligible to participate in monthly giveaways',
    'Access to the MyTruck agent dashboard',
    'Standard commission access',
    'Entry into regional competitions',
    'Access to basic platform training and announcements',
  ],
  silver: [
    'Includes all Bronze benefits',
    'Priority access to support agent',
    'Higher giveaway priority',
    'Faster withdrawal processing',
    'Silver verification badge',
    'Access to regional performance bonuses',
    'Priority support assistance',
    'Eligibility for special campaigns and promotions',
  ],
  gold: [
    'Includes all Silver benefits',
    'Higher commission opportunities during campaigns',
    'Access to leadership opportunities',
    'Gold verification badge',
    'Priority access to new operational regions',
    'Exclusive growth incentives',
    'Eligibility for larger monthly rewards',
  ],
  platinum: [
    'Includes all Gold benefits',
    'Elite platform recognition',
    'Highest giveaway eligibility priority',
    'Faster and priority payout processing',
    'Platinum verification badge',
    'Access to exclusive bonuses and rewards',
    'Manager promotion eligibility',
    'Strategic partnership opportunities',
    'Direct communication access with regional management',
    'Invitation to special MyTruck events and leadership programs',
  ],
};

async function queryAgentStats(agentId: string): Promise<AgentTierStats> {
  const [truckRows] = await db.execute(sql`
    SELECT COUNT(*) AS cnt FROM vehicle WHERE registered_by_agent_id = ${agentId}
  `) as any[];
  const trucksRegistered = Number((truckRows as any[])?.[0]?.cnt || 0);

  const [userRows] = await db.execute(sql`
    SELECT COUNT(*) AS cnt FROM user WHERE registered_by_agent_id = ${agentId}
  `) as any[];
  const usersRegistered = Number((userRows as any[])?.[0]?.cnt || 0);

  const [driverRows] = await db.execute(sql`
    SELECT COUNT(*) AS cnt FROM user WHERE registered_by_agent_id = ${agentId} AND role = 'driver'
  `) as any[];
  const driversRegistered = Number((driverRows as any[])?.[0]?.cnt || 0);

  const [orderRows] = await db.execute(sql`
    SELECT
      COUNT(DISTINCT o.id) AS completed,
      COUNT(DISTINCT o.customer_id) AS active,
      COALESCE(SUM(o.final_price), 0) AS revenue
    FROM \`order\` o
    LEFT JOIN user cu ON o.customer_id = cu.id
    LEFT JOIN user du ON o.driver_id = du.id
    WHERE (cu.registered_by_agent_id = ${agentId} OR du.registered_by_agent_id = ${agentId})
      AND o.status = 'completed'
  `) as any[];
  const orderRow = (orderRows as any[])?.[0] || {};
  const completedDeliveries = Number(orderRow.completed || 0);
  const activeUsers = Number(orderRow.active || 0);
  const totalRevenue = Number(orderRow.revenue || 0);

  const [relRows] = await db.execute(sql`
    SELECT
      CASE WHEN COUNT(DISTINCT o2.id) > 0
        THEN ROUND(COUNT(DISTINCT CASE WHEN o2.status = 'completed' THEN o2.id END) / NULLIF(COUNT(DISTINCT o2.id), 0) * 100, 1)
        ELSE 0 END AS reliability
    FROM \`order\` o2
    LEFT JOIN user cu2 ON o2.customer_id = cu2.id
    LEFT JOIN user du2 ON o2.driver_id = du2.id
    WHERE (cu2.registered_by_agent_id = ${agentId} OR du2.registered_by_agent_id = ${agentId})
      AND o2.status NOT IN ('pending_approval', 'approved', 'has_offers', 'assigned', 'on_the_way', 'delivered')
  `) as any[];
  const reliabilityScore = Number((relRows as any[])?.[0]?.reliability || 0);

  const [recentRows] = await db.execute(sql`
    SELECT COUNT(DISTINCT DATE_FORMAT(created_at, '%Y-%m')) AS month_count
    FROM user WHERE registered_by_agent_id = ${agentId} AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
  `) as any[];
  const monthlyActivity = Number((recentRows as any[])?.[0]?.month_count || 0) >= 1;

  const conversionRate = usersRegistered > 0 ? parseFloat(((activeUsers / usersRegistered) * 100).toFixed(1)) : 0;

  return {
    trucksRegistered,
    usersRegistered,
    completedDeliveries,
    conversionRate,
    reliabilityScore,
    totalRevenue,
    monthlyActivity,
    fraudFree: true,
  };
}

function meetsBronze(stats: AgentTierStats): boolean {
  const req = TIER_REQUIREMENTS.bronze;
  return (
    stats.trucksRegistered >= req.trucksRegistered &&
    stats.usersRegistered >= req.usersRegistered &&
    stats.completedDeliveries >= req.completedDeliveries &&
    stats.conversionRate >= req.conversionRate &&
    stats.reliabilityScore >= req.minReliability
  );
}

function meetsSilver(stats: AgentTierStats): boolean {
  const req = TIER_REQUIREMENTS.silver;
  return (
    stats.trucksRegistered >= req.trucksRegistered &&
    stats.usersRegistered >= req.usersRegistered &&
    stats.completedDeliveries >= req.completedDeliveries &&
    stats.conversionRate >= req.conversionRate &&
    stats.reliabilityScore >= req.minReliability &&
    (!req.monthlyActivity || stats.monthlyActivity)
  );
}

function meetsGold(stats: AgentTierStats): boolean {
  const req = TIER_REQUIREMENTS.gold;
  return (
    stats.trucksRegistered >= req.trucksRegistered &&
    stats.usersRegistered >= req.usersRegistered &&
    stats.completedDeliveries >= req.completedDeliveries &&
    stats.conversionRate >= req.conversionRate &&
    stats.reliabilityScore >= req.minReliability &&
    (!req.monthlyActivity || stats.monthlyActivity) &&
    stats.totalRevenue >= req.revenueContribution
  );
}

function meetsPlatinum(stats: AgentTierStats): boolean {
  const req = TIER_REQUIREMENTS.platinum;
  return (
    stats.trucksRegistered >= req.trucksRegistered &&
    stats.usersRegistered >= req.usersRegistered &&
    stats.completedDeliveries >= req.completedDeliveries &&
    stats.conversionRate >= req.conversionRate &&
    stats.reliabilityScore >= req.minReliability &&
    (!req.monthlyActivity || stats.monthlyActivity) &&
    stats.totalRevenue >= req.revenueContribution &&
    (!req.fraudFree || stats.fraudFree)
  );
}

export function determineQualifiedTier(stats: AgentTierStats): Tier {
  if (meetsPlatinum(stats)) return 'platinum';
  if (meetsGold(stats)) return 'gold';
  if (meetsSilver(stats)) return 'silver';
  if (meetsBronze(stats)) return 'bronze';
  return 'new';
}

export function getProgressToNext(stats: AgentTierStats, currentTier: Tier): {
  nextTier: Tier | null;
  progress: Record<string, { current: number; required: number; met: boolean }>;
} {
  const tierIndex = TIERS.indexOf(currentTier);
  if (tierIndex >= TIERS.length - 1) {
    return { nextTier: null, progress: {} };
  }
  const nextTier = TIERS[tierIndex + 1] as Tier;
  const req = TIER_REQUIREMENTS[nextTier];

  const progress: Record<string, { current: number; required: number; met: boolean }> = {
    trucksRegistered: { current: stats.trucksRegistered, required: req.trucksRegistered, met: stats.trucksRegistered >= req.trucksRegistered },
    usersRegistered: { current: stats.usersRegistered, required: req.usersRegistered, met: stats.usersRegistered >= req.usersRegistered },
    completedDeliveries: { current: stats.completedDeliveries, required: req.completedDeliveries, met: stats.completedDeliveries >= req.completedDeliveries },
    conversionRate: { current: stats.conversionRate, required: req.conversionRate, met: stats.conversionRate >= req.conversionRate },
    reliabilityScore: { current: stats.reliabilityScore, required: req.minReliability, met: stats.reliabilityScore >= req.minReliability },
  };

  if (req.revenueContribution > 0) {
    progress.totalRevenue = { current: stats.totalRevenue, required: req.revenueContribution, met: stats.totalRevenue >= req.revenueContribution };
  }
  if (req.monthlyActivity) {
    progress.monthlyActivity = { current: stats.monthlyActivity ? 1 : 0, required: 1, met: stats.monthlyActivity };
  }
  if (req.fraudFree) {
    progress.fraudFree = { current: stats.fraudFree ? 1 : 0, required: 1, met: stats.fraudFree };
  }

  return { nextTier, progress };
}

export async function evaluateAgentTier(agentId: string): Promise<TierProgress> {
  const stats = await queryAgentStats(agentId);
  const qualifiedTier = determineQualifiedTier(stats);

  const profile = await db.query.agentProfile.findFirst({
    where: eq(agentProfile.userId, agentId),
  });
  const currentTier = (profile?.tier as Tier) || 'new';

  const { nextTier, progress } = getProgressToNext(stats, currentTier);

  // Determine effective tier for display (show the higher of current vs qualified if upgraded)
  const displayTier = TIERS.indexOf(qualifiedTier) > TIERS.indexOf(currentTier) ? qualifiedTier : currentTier;

  const benefits = TIER_BENEFITS[displayTier as Tier] || TIER_BENEFITS.bronze;
  const nextTierBenefits = nextTier ? TIER_BENEFITS[nextTier] : null;

  return {
    currentTier,
    qualifiedTier,
    nextTier,
    stats,
    progress,
    benefits,
    nextTierBenefits,
  };
}

export async function evaluateAndUpgrade(agentId: string): Promise<{ upgraded: boolean; fromTier: Tier; toTier: Tier }> {
  const stats = await queryAgentStats(agentId);
  const qualifiedTier = determineQualifiedTier(stats);

  const profile = await db.query.agentProfile.findFirst({
    where: eq(agentProfile.userId, agentId),
  });
  const currentTier = (profile?.tier as Tier) || 'new';

  const currentIndex = TIERS.indexOf(currentTier);
  const qualifiedIndex = TIERS.indexOf(qualifiedTier);

  if (qualifiedIndex > currentIndex) {
    await db.update(agentProfile)
      .set({
        tier: qualifiedTier,
        tierEarnedAt: new Date(),
        tierCheckedAt: new Date(),
      })
      .where(eq(agentProfile.userId, agentId));
    logger.info(`[TierService] Agent ${agentId} upgraded from ${currentTier} to ${qualifiedTier}`);
    return { upgraded: true, fromTier: currentTier, toTier: qualifiedTier };
  }

  if (qualifiedIndex < currentIndex) {
    // Downgrade — agent no longer meets their current tier
    await db.update(agentProfile)
      .set({
        tier: qualifiedTier,
        tierCheckedAt: new Date(),
      })
      .where(eq(agentProfile.userId, agentId));
    logger.info(`[TierService] Agent ${agentId} downgraded from ${currentTier} to ${qualifiedTier}`);
    return { upgraded: false, fromTier: currentTier, toTier: qualifiedTier };
  }

  // Still update tierCheckedAt
  await db.update(agentProfile)
    .set({ tierCheckedAt: new Date() })
    .where(eq(agentProfile.userId, agentId));

  return { upgraded: false, fromTier: currentTier, toTier: currentTier };
}

export async function recalculateAllTiers(): Promise<{
  total: number;
  upgrades: number;
  breakdown: Record<string, number>;
}> {
  const rows = await db.select({ userId: agentProfile.userId, tier: agentProfile.tier }).from(agentProfile);
  let upgrades = 0;
  const breakdown: Record<string, number> = { new: 0, bronze: 0, silver: 0, gold: 0, platinum: 0 };

  for (const row of rows) {
    try {
      const result = await evaluateAndUpgrade(row.userId);
      if (result.upgraded) upgrades++;
      breakdown[result.toTier] = (breakdown[result.toTier] || 0) + 1;
    } catch (error) {
      logger.error(`[TierService] Failed to evaluate agent ${row.userId}:`, error);
    }
  }

  return { total: rows.length, upgrades, breakdown };
}

export async function getTierBreakdown(): Promise<{
  distribution: Record<string, number>;
  allAgents: Array<{
    agentId: string;
    agentName: string;
    tier: string;
    stats: AgentTierStats;
    qualifiedTier: string;
    canUpgrade: boolean;
  }>;
}> {
  console.log('[TierService] getTierBreakdown: querying agent profiles');
  let rows;
  try {
    rows = await db.select({
      userId: agentProfile.userId,
      tier: agentProfile.tier,
      tierEarnedAt: agentProfile.tierEarnedAt,
    }).from(agentProfile);
    console.log('[TierService] getTierBreakdown: found', rows.length, 'agent profiles');
  } catch (queryError: any) {
    console.error('[TierService] getTierBreakdown: FAILED to query agentProfile:', {
      message: queryError?.message,
      code: queryError?.code,
      errno: queryError?.errno,
      sqlMessage: queryError?.sqlMessage,
      stack: queryError?.stack,
    });
    throw queryError;
  }

  const distribution: Record<string, number> = { new: 0, bronze: 0, silver: 0, gold: 0, platinum: 0 };
  const allAgents: Array<any> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      console.log('[TierService] Processing agent', i + 1, 'of', rows.length, ':', row.userId);

      let agentUser;
      try {
        agentUser = await db.query.user.findFirst({
          where: eq(user.id, row.userId),
        });
      } catch (agentError: any) {
        console.error('[TierService] Failed to find user for agent', row.userId, ':', agentError?.message, agentError?.code, agentError?.sqlMessage);
        throw agentError;
      }

      console.log('[TierService] Querying stats for agent', row.userId);
      const stats = await queryAgentStats(row.userId);
      console.log('[TierService] Determining qualified tier for agent', row.userId);
      const qualifiedTier = determineQualifiedTier(stats);
      const currentTier = row.tier || 'new';
      const currentIdx = TIERS.indexOf(currentTier as Tier);
      const qualifiedIdx = TIERS.indexOf(qualifiedTier);

      distribution[currentTier] = (distribution[currentTier] || 0) + 1;

      allAgents.push({
        agentId: row.userId,
        agentName: agentUser?.name || 'Unknown',
        tier: currentTier,
        stats,
        qualifiedTier,
        canUpgrade: qualifiedIdx > currentIdx,
      });
    } catch (error: any) {
      logger.error(`[TierService] Failed to get breakdown for agent ${row.userId}:`, {
        message: error?.message,
        stack: error?.stack,
        code: error?.code,
        errno: error?.errno,
        sqlMessage: error?.sqlMessage,
      });
    }
  }

  console.log('[TierService] getTierBreakdown: done, distribution:', distribution);
  return { distribution, allAgents };
}
