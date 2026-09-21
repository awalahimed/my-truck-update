/**
 * Create referral code for a user
 */
export declare function createUserReferralCode(userId: string): Promise<string>;
/**
 * Apply referral code during registration
 */
export declare function applyReferralCode(userId: string, referralCode: string): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Complete referral when first order is completed
 */
export declare function completeReferral(userId: string, orderId: string, orderAmount: number): Promise<void>;
/**
 * Get referral configuration
 */
export declare function getReferralConfig(): Promise<{
    id: string;
    referrerRewardAmount: string;
    refereeRewardAmount: string;
    minOrderAmount: string;
    expiryDays: number;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
} | {
    referrerRewardAmount: string;
    refereeRewardAmount: string;
    minOrderAmount: string;
    expiryDays: number;
    enabled: boolean;
}>;
/**
 * Get referral statistics for a user
 */
export declare function getReferralStats(userId: string): Promise<{
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalEarned: string;
    availableRewards: string;
}>;
/**
 * Get referral history for a user
 */
export declare function getReferralHistory(userId: string): Promise<({
    id: string;
    status: import("../database/schema/referral-schema.js").ReferralStatus;
    referrerReward: string;
    referrerRewardClaimed: boolean;
    completedAt: Date;
    createdAt: Date;
    expiresAt: Date;
    refereeName: any;
    refereePhone: any;
} | {
    id: string;
    status: import("../database/schema/referral-schema.js").ReferralStatus;
    referrerReward: string;
    referrerRewardClaimed: boolean;
    completedAt: Date;
    createdAt: Date;
    expiresAt: Date;
    refereeName: any;
    refereePhone: any;
})[]>;
//# sourceMappingURL=referral.d.ts.map