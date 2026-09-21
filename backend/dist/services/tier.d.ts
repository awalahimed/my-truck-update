export declare const TIERS: readonly ["new", "bronze", "silver", "gold", "platinum"];
export type Tier = (typeof TIERS)[number];
export declare const TIER_MULTIPLIERS: Record<Tier, number>;
export declare function getTierMultiplier(tier: string): number;
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
    progress: Record<string, {
        current: number;
        required: number;
        met: boolean;
    }>;
    benefits: string[];
    nextTierBenefits: string[] | null;
}
export declare function determineQualifiedTier(stats: AgentTierStats): Tier;
export declare function getProgressToNext(stats: AgentTierStats, currentTier: Tier): {
    nextTier: Tier | null;
    progress: Record<string, {
        current: number;
        required: number;
        met: boolean;
    }>;
};
export declare function evaluateAgentTier(agentId: string): Promise<TierProgress>;
export declare function evaluateAndUpgrade(agentId: string): Promise<{
    upgraded: boolean;
    fromTier: Tier;
    toTier: Tier;
}>;
export declare function recalculateAllTiers(): Promise<{
    total: number;
    upgrades: number;
    breakdown: Record<string, number>;
}>;
export declare function getTierBreakdown(): Promise<{
    distribution: Record<string, number>;
    allAgents: Array<{
        agentId: string;
        agentName: string;
        tier: string;
        stats: AgentTierStats;
        qualifiedTier: string;
        canUpgrade: boolean;
    }>;
}>;
//# sourceMappingURL=tier.d.ts.map