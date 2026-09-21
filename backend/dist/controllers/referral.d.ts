export declare const referralController: {
    getMyReferralCode: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, import("@orpc/server").MergedCurrentContext<{
        req?: Request;
    }, {
        user: {
            id: string;
            email: string;
            name?: string;
            role?: string;
            phoneNumber?: string;
            phoneNumberVerified?: boolean;
            emailVerified?: boolean;
        };
        session: {
            id: string;
            userId: string;
            token: string;
            expiresAt: Date;
        };
        role: string;
    }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        code: string;
        shareUrl: string;
    }, {
        success: boolean;
        code: string;
        shareUrl: string;
    }>, Record<never, never>, Record<never, never>>;
    validateCode: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        valid: boolean;
        message: string;
        reward?: undefined;
    } | {
        success: boolean;
        valid: boolean;
        reward: string;
        message: string;
    }, {
        success: boolean;
        valid: boolean;
        message: string;
        reward?: undefined;
    } | {
        success: boolean;
        valid: boolean;
        reward: string;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    applyCode: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, import("@orpc/server").MergedCurrentContext<{
        req?: Request;
    }, {
        user: {
            id: string;
            email: string;
            name?: string;
            role?: string;
            phoneNumber?: string;
            phoneNumberVerified?: boolean;
            emailVerified?: boolean;
        };
        session: {
            id: string;
            userId: string;
            token: string;
            expiresAt: Date;
        };
        role: string;
    }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    getStats: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, import("@orpc/server").MergedCurrentContext<{
        req?: Request;
    }, {
        user: {
            id: string;
            email: string;
            name?: string;
            role?: string;
            phoneNumber?: string;
            phoneNumberVerified?: boolean;
            emailVerified?: boolean;
        };
        session: {
            id: string;
            userId: string;
            token: string;
            expiresAt: Date;
        };
        role: string;
    }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        totalReferrals: number;
        completedReferrals: number;
        pendingReferrals: number;
        totalEarned: string;
        availableRewards: string;
        success: boolean;
    }, {
        totalReferrals: number;
        completedReferrals: number;
        pendingReferrals: number;
        totalEarned: string;
        availableRewards: string;
        success: boolean;
    }>, Record<never, never>, Record<never, never>>;
    getHistory: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, import("@orpc/server").MergedCurrentContext<{
        req?: Request;
    }, {
        user: {
            id: string;
            email: string;
            name?: string;
            role?: string;
            phoneNumber?: string;
            phoneNumberVerified?: boolean;
            emailVerified?: boolean;
        };
        session: {
            id: string;
            userId: string;
            token: string;
            expiresAt: Date;
        };
        role: string;
    }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        referrals: ({
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
        })[];
    }, {
        success: boolean;
        referrals: ({
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
        })[];
    }>, Record<never, never>, Record<never, never>>;
    getProgramStatus: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        enabled: boolean;
        referrerReward: string;
        refereeReward: string;
        minOrderAmount: string;
        expiryDays: number;
    } | {
        success: boolean;
        enabled: boolean;
        referrerReward?: undefined;
        refereeReward?: undefined;
        minOrderAmount?: undefined;
        expiryDays?: undefined;
    }, {
        success: boolean;
        enabled: boolean;
        referrerReward: string;
        refereeReward: string;
        minOrderAmount: string;
        expiryDays: number;
    } | {
        success: boolean;
        enabled: boolean;
        referrerReward?: undefined;
        refereeReward?: undefined;
        minOrderAmount?: undefined;
        expiryDays?: undefined;
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=referral.d.ts.map