export declare const adminController: {
    dashboard: {
        getStats: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            stats: {
                totalUsers: number;
                totalOrders: number;
                monthlyRevenue: string;
                totalRevenue: string;
                activeOrders: number;
                recentTransactions: number;
                roleBreakdown: Record<string, number>;
                statusBreakdown: Record<string, number>;
                ordersByDay: Record<string, number>;
                revenueByDay: Record<string, number>;
            };
        }, {
            success: boolean;
            stats: {
                totalUsers: number;
                totalOrders: number;
                monthlyRevenue: string;
                totalRevenue: string;
                activeOrders: number;
                recentTransactions: number;
                roleBreakdown: Record<string, number>;
                statusBreakdown: Record<string, number>;
                ordersByDay: Record<string, number>;
                revenueByDay: Record<string, number>;
            };
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        getRecentActivity: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            recentOrders: {
                id: string;
                status: string;
                finalPrice: string;
                createdAt: Date;
                customerName: string;
            }[];
            recentUsers: ({
                id: any;
                name: any;
                role: any;
                createdAt: any;
            } | {
                id: any;
                name: any;
                role: any;
                createdAt: any;
            })[];
        }, {
            success: boolean;
            recentOrders: {
                id: string;
                status: string;
                finalPrice: string;
                createdAt: Date;
                customerName: string;
            }[];
            recentUsers: ({
                id: any;
                name: any;
                role: any;
                createdAt: any;
            } | {
                id: any;
                name: any;
                role: any;
                createdAt: any;
            })[];
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    };
    wallet: {
        getStats: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            stats: any;
        } | {
            success: boolean;
            stats: {
                currentBalance: string;
                totalFeesCollected: string;
                monthlyFees: string;
                todayFees: string;
                totalOrders: number;
                earningsByDay: Record<string, {
                    amount: number;
                    count: number;
                }>;
            };
            message?: undefined;
        }, {
            success: boolean;
            message: string;
            stats: any;
        } | {
            success: boolean;
            stats: {
                currentBalance: string;
                totalFeesCollected: string;
                monthlyFees: string;
                todayFees: string;
                totalOrders: number;
                earningsByDay: Record<string, {
                    amount: number;
                    count: number;
                }>;
            };
            message?: undefined;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        getTransactions: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            limit: import("zod").ZodDefault<import("zod").ZodNumber>;
            offset: import("zod").ZodDefault<import("zod").ZodNumber>;
            startDate: import("zod").ZodOptional<import("zod").ZodString>;
            endDate: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            transactions: ({
                id: string;
                amount: string;
                txRef: string;
                description: string;
                meta: unknown;
                createdAt: Date;
                fromUserName: any;
                fromUserPhone: any;
                fromUserProfilePhoto: any;
            } | {
                id: string;
                amount: string;
                txRef: string;
                description: string;
                meta: unknown;
                createdAt: Date;
                fromUserName: any;
                fromUserPhone: any;
                fromUserProfilePhoto: any;
            })[];
            total: number;
            limit: number;
            offset: number;
        }, {
            success: boolean;
            transactions: ({
                id: string;
                amount: string;
                txRef: string;
                description: string;
                meta: unknown;
                createdAt: Date;
                fromUserName: any;
                fromUserPhone: any;
                fromUserProfilePhoto: any;
            } | {
                id: string;
                amount: string;
                txRef: string;
                description: string;
                meta: unknown;
                createdAt: Date;
                fromUserName: any;
                fromUserPhone: any;
                fromUserProfilePhoto: any;
            })[];
            total: number;
            limit: number;
            offset: number;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        getWithdrawals: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            limit: import("zod").ZodDefault<import("zod").ZodNumber>;
            offset: import("zod").ZodDefault<import("zod").ZodNumber>;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            withdrawals: {
                id: string;
                amount: string;
                txRef: string;
                description: string;
                status: import("../database/schema/payment-schema.js").PaymentStatus;
                createdAt: Date;
            }[];
            total: number;
            limit: number;
            offset: number;
        }, {
            success: boolean;
            withdrawals: {
                id: string;
                amount: string;
                txRef: string;
                description: string;
                status: import("../database/schema/payment-schema.js").PaymentStatus;
                createdAt: Date;
            }[];
            total: number;
            limit: number;
            offset: number;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        createPlatformWallet: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    };
    referral: {
        getAnalytics: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            analytics: {
                totalReferrals: number;
                completedReferrals: number;
                pendingReferrals: number;
                expiredReferrals: number;
                totalRewardsPaid: string;
                conversionRate: string;
                referralsByMonth: Record<string, number>;
            };
        }, {
            success: boolean;
            analytics: {
                totalReferrals: number;
                completedReferrals: number;
                pendingReferrals: number;
                expiredReferrals: number;
                totalRewardsPaid: string;
                conversionRate: string;
                referralsByMonth: Record<string, number>;
            };
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        getConfig: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            config: {
                referrerRewardAmount: string;
                refereeRewardAmount: string;
                minOrderAmount: string;
                expiryDays: number;
                enabled: boolean;
            };
        } | {
            success: boolean;
            config: {
                id: string;
                referrerRewardAmount: string;
                refereeRewardAmount: string;
                minOrderAmount: string;
                expiryDays: number;
                enabled: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        }, {
            success: boolean;
            config: {
                referrerRewardAmount: string;
                refereeRewardAmount: string;
                minOrderAmount: string;
                expiryDays: number;
                enabled: boolean;
            };
        } | {
            success: boolean;
            config: {
                id: string;
                referrerRewardAmount: string;
                refereeRewardAmount: string;
                minOrderAmount: string;
                expiryDays: number;
                enabled: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        updateConfig: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            referrerRewardAmount: import("zod").ZodOptional<import("zod").ZodString>;
            refereeRewardAmount: import("zod").ZodOptional<import("zod").ZodString>;
            minOrderAmount: import("zod").ZodOptional<import("zod").ZodString>;
            expiryDays: import("zod").ZodOptional<import("zod").ZodNumber>;
            enabled: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        getTopReferrers: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            limit: import("zod").ZodDefault<import("zod").ZodNumber>;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            topReferrers: ({
                totalEarned: string;
                completedReferrals: number;
                userId: any;
                name: any;
                phoneNumber: any;
                referralCode: any;
                referralCount: any;
            } | {
                totalEarned: string;
                completedReferrals: number;
                userId: any;
                name: any;
                phoneNumber: any;
                referralCode: any;
                referralCount: any;
            })[];
        }, {
            success: boolean;
            topReferrers: ({
                totalEarned: string;
                completedReferrals: number;
                userId: any;
                name: any;
                phoneNumber: any;
                referralCode: any;
                referralCount: any;
            } | {
                totalEarned: string;
                completedReferrals: number;
                userId: any;
                name: any;
                phoneNumber: any;
                referralCode: any;
                referralCount: any;
            })[];
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        getAllReferrals: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            status: import("zod").ZodOptional<import("zod").ZodEnum<{
                pending: "pending";
                completed: "completed";
                cancelled: "cancelled";
                expired: "expired";
            }>>;
            limit: import("zod").ZodDefault<import("zod").ZodNumber>;
            offset: import("zod").ZodDefault<import("zod").ZodNumber>;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            referrals: {
                id: string;
                status: import("../database/schema/referral-schema.js").ReferralStatus;
                referrerReward: string;
                refereeReward: string;
                completedAt: Date;
                createdAt: Date;
                referrerName: string;
                referrerPhone: string;
                refereeName: string;
                refereePhone: string;
            }[];
            total: number;
            limit: number;
            offset: number;
        }, {
            success: boolean;
            referrals: {
                id: string;
                status: import("../database/schema/referral-schema.js").ReferralStatus;
                referrerReward: string;
                refereeReward: string;
                completedAt: Date;
                createdAt: Date;
                referrerName: string;
                referrerPhone: string;
                refereeName: string;
                refereePhone: string;
            }[];
            total: number;
            limit: number;
            offset: number;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    };
    agents: {
        list: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodOptional<import("zod").ZodObject<{
            search: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("better-auth").$strip>>, import("@orpc/server").Schema<{
            success: boolean;
            agents: ({
                id: any;
                name: any;
                phoneNumber: any;
                email: any;
                accountStatus: any;
                createdAt: any;
                image: any;
                rejectionReason: any;
                nationalId: string;
                gender: string;
                agentType: string;
                assignedCity: string;
                assignedTown: string;
                assignedTownManager: string;
                latitude: string;
                longitude: string;
                idCardFrontId: string;
                idCardBackId: string;
            } | {
                id: any;
                name: any;
                phoneNumber: any;
                email: any;
                accountStatus: any;
                createdAt: any;
                image: any;
                rejectionReason: any;
                nationalId: string;
                gender: string;
                agentType: string;
                assignedCity: string;
                assignedTown: string;
                assignedTownManager: string;
                latitude: string;
                longitude: string;
                idCardFrontId: string;
                idCardBackId: string;
            })[];
            manager?: undefined;
        } | {
            success: boolean;
            agents: ({
                id: any;
                name: any;
                phoneNumber: any;
                email: any;
                accountStatus: any;
                createdAt: any;
                image: any;
                rejectionReason: any;
                nationalId: string;
                gender: string;
                agentType: string;
                assignedCity: string;
                assignedTown: string;
                assignedTownManager: string;
                latitude: string;
                longitude: string;
                idCardFrontId: string;
                idCardBackId: string;
            } | {
                id: any;
                name: any;
                phoneNumber: any;
                email: any;
                accountStatus: any;
                createdAt: any;
                image: any;
                rejectionReason: any;
                nationalId: string;
                gender: string;
                agentType: string;
                assignedCity: string;
                assignedTown: string;
                assignedTownManager: string;
                latitude: string;
                longitude: string;
                idCardFrontId: string;
                idCardBackId: string;
            })[];
            manager: {
                townName: string;
                cityName: string;
                region: string;
            };
        }, {
            success: boolean;
            agents: ({
                id: any;
                name: any;
                phoneNumber: any;
                email: any;
                accountStatus: any;
                createdAt: any;
                image: any;
                rejectionReason: any;
                nationalId: string;
                gender: string;
                agentType: string;
                assignedCity: string;
                assignedTown: string;
                assignedTownManager: string;
                latitude: string;
                longitude: string;
                idCardFrontId: string;
                idCardBackId: string;
            } | {
                id: any;
                name: any;
                phoneNumber: any;
                email: any;
                accountStatus: any;
                createdAt: any;
                image: any;
                rejectionReason: any;
                nationalId: string;
                gender: string;
                agentType: string;
                assignedCity: string;
                assignedTown: string;
                assignedTownManager: string;
                latitude: string;
                longitude: string;
                idCardFrontId: string;
                idCardBackId: string;
            })[];
            manager?: undefined;
        } | {
            success: boolean;
            agents: ({
                id: any;
                name: any;
                phoneNumber: any;
                email: any;
                accountStatus: any;
                createdAt: any;
                image: any;
                rejectionReason: any;
                nationalId: string;
                gender: string;
                agentType: string;
                assignedCity: string;
                assignedTown: string;
                assignedTownManager: string;
                latitude: string;
                longitude: string;
                idCardFrontId: string;
                idCardBackId: string;
            } | {
                id: any;
                name: any;
                phoneNumber: any;
                email: any;
                accountStatus: any;
                createdAt: any;
                image: any;
                rejectionReason: any;
                nationalId: string;
                gender: string;
                agentType: string;
                assignedCity: string;
                assignedTown: string;
                assignedTownManager: string;
                latitude: string;
                longitude: string;
                idCardFrontId: string;
                idCardBackId: string;
            })[];
            manager: {
                townName: string;
                cityName: string;
                region: string;
            };
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        create: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            name: import("zod").ZodString;
            phone: import("zod").ZodString;
            email: import("zod").ZodOptional<import("zod").ZodString>;
            password: import("zod").ZodString;
            nationalId: import("zod").ZodOptional<import("zod").ZodString>;
            gender: import("zod").ZodOptional<import("zod").ZodString>;
            assignedCity: import("zod").ZodOptional<import("zod").ZodString>;
            assignedTown: import("zod").ZodOptional<import("zod").ZodString>;
            assignedTownManager: import("zod").ZodOptional<import("zod").ZodString>;
            agentType: import("zod").ZodOptional<import("zod").ZodString>;
            latitude: import("zod").ZodOptional<import("zod").ZodString>;
            longitude: import("zod").ZodOptional<import("zod").ZodString>;
            idCardFrontId: import("zod").ZodOptional<import("zod").ZodString>;
            idCardBackId: import("zod").ZodOptional<import("zod").ZodString>;
            profilePhotoId: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            message: string;
            agentId: any;
        }, {
            success: boolean;
            message: string;
            agentId: any;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        update: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            id: import("zod").ZodString;
            name: import("zod").ZodOptional<import("zod").ZodString>;
            phone: import("zod").ZodOptional<import("zod").ZodString>;
            email: import("zod").ZodOptional<import("zod").ZodString>;
            password: import("zod").ZodOptional<import("zod").ZodString>;
            nationalId: import("zod").ZodOptional<import("zod").ZodString>;
            gender: import("zod").ZodOptional<import("zod").ZodString>;
            assignedCity: import("zod").ZodOptional<import("zod").ZodString>;
            assignedTown: import("zod").ZodOptional<import("zod").ZodString>;
            assignedTownManager: import("zod").ZodOptional<import("zod").ZodString>;
            agentType: import("zod").ZodOptional<import("zod").ZodString>;
            latitude: import("zod").ZodOptional<import("zod").ZodString>;
            longitude: import("zod").ZodOptional<import("zod").ZodString>;
            idCardFrontId: import("zod").ZodOptional<import("zod").ZodString>;
            idCardBackId: import("zod").ZodOptional<import("zod").ZodString>;
            profilePhotoId: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        updateStatus: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            id: import("zod").ZodString;
            status: import("zod").ZodEnum<{
                active: "active";
                suspended: "suspended";
                pending: "pending";
                rejected: "rejected";
            }>;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        rejectAgent: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            agentId: import("zod").ZodString;
            reason: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getPerformance: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            agentId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            agent: {
                id: any;
                name: any;
                phoneNumber: any;
                assignedCity: string;
                assignedTown: string;
                accountStatus: any;
            } | {
                id: any;
                name: any;
                phoneNumber: any;
                assignedCity: string;
                assignedTown: string;
                accountStatus: any;
            };
            stats: {
                totalOrders: number;
                completedOrders: number;
                pendingOrders: number;
                rejectedOrders: number;
            };
            commissions: {
                totalEarnings: number;
                userCommissions: number;
                driverCommissions: number;
                assistedCommissions: number;
            };
            recentJobs: {
                finalPrice: number;
                id: string;
                status: string;
                createdAt: Date;
                completedAt: Date;
            }[];
        }, {
            success: boolean;
            agent: {
                id: any;
                name: any;
                phoneNumber: any;
                assignedCity: string;
                assignedTown: string;
                accountStatus: any;
            } | {
                id: any;
                name: any;
                phoneNumber: any;
                assignedCity: string;
                assignedTown: string;
                accountStatus: any;
            };
            stats: {
                totalOrders: number;
                completedOrders: number;
                pendingOrders: number;
                rejectedOrders: number;
            };
            commissions: {
                totalEarnings: number;
                userCommissions: number;
                driverCommissions: number;
                assistedCommissions: number;
            };
            recentJobs: {
                finalPrice: number;
                id: string;
                status: string;
                createdAt: Date;
                completedAt: Date;
            }[];
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getMapData: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            agents: ({
                id: any;
                name: any;
                phoneNumber: any;
                latitude: string;
                longitude: string;
                assignedCity: string;
                assignedTown: string;
                accountStatus: any;
                agentType: string;
            } | {
                id: any;
                name: any;
                phoneNumber: any;
                latitude: string;
                longitude: string;
                assignedCity: string;
                assignedTown: string;
                accountStatus: any;
                agentType: string;
            })[];
        }, {
            success: boolean;
            agents: ({
                id: any;
                name: any;
                phoneNumber: any;
                latitude: string;
                longitude: string;
                assignedCity: string;
                assignedTown: string;
                accountStatus: any;
                agentType: string;
            } | {
                id: any;
                name: any;
                phoneNumber: any;
                latitude: string;
                longitude: string;
                assignedCity: string;
                assignedTown: string;
                accountStatus: any;
                agentType: string;
            })[];
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        updateLocation: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            id: import("zod").ZodString;
            latitude: import("zod").ZodOptional<import("zod").ZodString>;
            longitude: import("zod").ZodOptional<import("zod").ZodString>;
            assignedCity: import("zod").ZodOptional<import("zod").ZodString>;
            assignedTown: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getAnalytics: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            stats: {
                totalAgents: number;
                avgReliability: number;
                totalLateDeliveries: number;
                totalCompleted: number;
            };
            topAgents: {
                agentId: string;
                agentName: unknown;
                totalOrders: number;
                completedOrders: number;
                rejectedOrders: number;
                cancelledOrders: number;
                lateDeliveries: number;
                reliability: number;
            }[];
            lowestAgents: {
                agentId: string;
                agentName: unknown;
                totalOrders: number;
                completedOrders: number;
                rejectedOrders: number;
                cancelledOrders: number;
                lateDeliveries: number;
                reliability: number;
            }[];
            allAgents: {
                agentId: string;
                agentName: unknown;
                totalOrders: number;
                completedOrders: number;
                rejectedOrders: number;
                cancelledOrders: number;
                lateDeliveries: number;
                reliability: number;
            }[];
            reliabilityTrends: {
                month: unknown;
                totalOrders: number;
                completedOrders: number;
                reliability: number;
            }[];
        }, {
            success: boolean;
            stats: {
                totalAgents: number;
                avgReliability: number;
                totalLateDeliveries: number;
                totalCompleted: number;
            };
            topAgents: {
                agentId: string;
                agentName: unknown;
                totalOrders: number;
                completedOrders: number;
                rejectedOrders: number;
                cancelledOrders: number;
                lateDeliveries: number;
                reliability: number;
            }[];
            lowestAgents: {
                agentId: string;
                agentName: unknown;
                totalOrders: number;
                completedOrders: number;
                rejectedOrders: number;
                cancelledOrders: number;
                lateDeliveries: number;
                reliability: number;
            }[];
            allAgents: {
                agentId: string;
                agentName: unknown;
                totalOrders: number;
                completedOrders: number;
                rejectedOrders: number;
                cancelledOrders: number;
                lateDeliveries: number;
                reliability: number;
            }[];
            reliabilityTrends: {
                month: unknown;
                totalOrders: number;
                completedOrders: number;
                reliability: number;
            }[];
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getConversionStats: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            overall: {
                totalRegistered: any;
                totalActiveUsers: any;
                totalDrivers: any;
                totalActiveDrivers: any;
                totalInactive: any;
                overallConversion: number;
            };
            agents: {
                agentId: any;
                agentName: any;
                totalRegistered: number;
                totalDrivers: number;
                activeUsers: number;
                activeDrivers: number;
                inactiveUsers: number;
                userConversionRate: number;
                driverConversionRate: number;
            }[];
            trends: {
                month: any;
                newRegistrations: number;
                firstOrders: number;
                conversionRate: number;
            }[];
        }, {
            success: boolean;
            overall: {
                totalRegistered: any;
                totalActiveUsers: any;
                totalDrivers: any;
                totalActiveDrivers: any;
                totalInactive: any;
                overallConversion: number;
            };
            agents: {
                agentId: any;
                agentName: any;
                totalRegistered: number;
                totalDrivers: number;
                activeUsers: number;
                activeDrivers: number;
                inactiveUsers: number;
                userConversionRate: number;
                driverConversionRate: number;
            }[];
            trends: {
                month: any;
                newRegistrations: number;
                firstOrders: number;
                conversionRate: number;
            }[];
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getTierBreakdown: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<any, any>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        recalculateTiers: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            total: number;
            upgrades: number;
            breakdown: Record<string, number>;
            success: boolean;
        }, {
            total: number;
            upgrades: number;
            breakdown: Record<string, number>;
            success: boolean;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
    driver: {
        getAllDrivers: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            drivers: ({
                vehicleType: string;
                vehiclePlate: string;
                id: any;
                name: any;
                phoneNumber: any;
                accountStatus: any;
                banned: any;
                createdAt: any;
                image: any;
            } | {
                vehicleType: string;
                vehiclePlate: string;
                id: any;
                name: any;
                phoneNumber: any;
                accountStatus: any;
                banned: any;
                createdAt: any;
                image: any;
            })[];
        }, {
            success: boolean;
            drivers: ({
                vehicleType: string;
                vehiclePlate: string;
                id: any;
                name: any;
                phoneNumber: any;
                accountStatus: any;
                banned: any;
                createdAt: any;
                image: any;
            } | {
                vehicleType: string;
                vehiclePlate: string;
                id: any;
                name: any;
                phoneNumber: any;
                accountStatus: any;
                banned: any;
                createdAt: any;
                image: any;
            })[];
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getDriverDetails: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            driverId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            driver: {
                vehicle: {
                    id: string;
                    driverId: string;
                    type: string;
                    make: string;
                    model: string;
                    year: string;
                    plateNumber: string;
                    color: string;
                    capacity: string;
                    registeredByAgentId: string;
                    driverCycleCount: number;
                    driverLifetimeEarnings: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
                vehicleImage: any;
                licenseFrontImage: any;
                licenseBackImage: any;
            };
        }, {
            success: boolean;
            driver: {
                vehicle: {
                    id: string;
                    driverId: string;
                    type: string;
                    make: string;
                    model: string;
                    year: string;
                    plateNumber: string;
                    color: string;
                    capacity: string;
                    registeredByAgentId: string;
                    driverCycleCount: number;
                    driverLifetimeEarnings: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
                vehicleImage: any;
                licenseFrontImage: any;
                licenseBackImage: any;
            };
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        rejectDriver: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            driverId: import("zod").ZodString;
            reason: import("zod").ZodString;
            rejectedDocument: import("zod").ZodEnum<{
                vehicle: "vehicle";
                license: "license";
            }>;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getRejectionStatus: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            hasRejection: boolean;
            rejectionReason?: undefined;
            rejectedDocument?: undefined;
            rejectedAt?: undefined;
        } | {
            success: boolean;
            hasRejection: boolean;
            rejectionReason: any;
            rejectedDocument: any;
            rejectedAt: any;
        }, {
            success: boolean;
            hasRejection: boolean;
            rejectionReason?: undefined;
            rejectedDocument?: undefined;
            rejectedAt?: undefined;
        } | {
            success: boolean;
            hasRejection: boolean;
            rejectionReason: any;
            rejectedDocument: any;
            rejectedAt: any;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        clearRejection: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
    user: {
        createManager: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            name: import("zod").ZodString;
            phoneNumber: import("zod").ZodString;
            password: import("zod").ZodString;
            townName: import("zod").ZodString;
            cityName: import("zod").ZodString;
            region: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            message: string;
            userId: any;
            managerId: `${string}-${string}-${string}-${string}-${string}`;
        }, {
            success: boolean;
            message: string;
            userId: any;
            managerId: `${string}-${string}-${string}-${string}-${string}`;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        softDeleteUser: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            userId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        restoreUser: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            userId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
    order: {
        getAllOrders: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            page: import("zod").ZodDefault<import("zod").ZodNumber>;
            pageSize: import("zod").ZodDefault<import("zod").ZodNumber>;
            search: import("zod").ZodOptional<import("zod").ZodString>;
            status: import("zod").ZodOptional<import("zod").ZodString>;
            dateFrom: import("zod").ZodOptional<import("zod").ZodString>;
            dateTo: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            stats: {
                totalToday: number;
                active: number;
                completed: number;
                cancelled: number;
                delayed: number;
                avgRevenue: string;
            };
            orders: {
                id: string;
                customerId: string;
                customerName: unknown;
                customerPhone: unknown;
                driverId: string;
                driverName: unknown;
                driverPhone: unknown;
                pickupAddress: string;
                deliveryAddress: string;
                materials: unknown;
                vehicleType: string;
                status: string;
                estimatedPrice: string;
                finalPrice: string;
                createdAt: Date;
                updatedAt: Date;
            }[];
            total: number;
            page: number;
            pageSize: number;
        }, {
            success: boolean;
            stats: {
                totalToday: number;
                active: number;
                completed: number;
                cancelled: number;
                delayed: number;
                avgRevenue: string;
            };
            orders: {
                id: string;
                customerId: string;
                customerName: unknown;
                customerPhone: unknown;
                driverId: string;
                driverName: unknown;
                driverPhone: unknown;
                pickupAddress: string;
                deliveryAddress: string;
                materials: unknown;
                vehicleType: string;
                status: string;
                estimatedPrice: string;
                finalPrice: string;
                createdAt: Date;
                updatedAt: Date;
            }[];
            total: number;
            page: number;
            pageSize: number;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    };
    giveaway: {
        getAgents: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            search: import("zod").ZodOptional<import("zod").ZodString>;
            offset: import("zod").ZodDefault<import("zod").ZodNumber>;
            limit: import("zod").ZodDefault<import("zod").ZodNumber>;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            agents: {
                id: any;
                name: any;
                phone: any;
                email: any;
                tier: any;
                assignedCity: any;
                assignedTown: any;
                totalRegistered: number;
                totalDrivers: number;
                activeUsers: number;
                activeDrivers: number;
                inactiveUsers: number;
                conversionRate: number;
                walletBalance: any;
            }[];
            total: number;
            offset: number;
            limit: number;
        }, {
            success: boolean;
            agents: {
                id: any;
                name: any;
                phone: any;
                email: any;
                tier: any;
                assignedCity: any;
                assignedTown: any;
                totalRegistered: number;
                totalDrivers: number;
                activeUsers: number;
                activeDrivers: number;
                inactiveUsers: number;
                conversionRate: number;
                walletBalance: any;
            }[];
            total: number;
            offset: number;
            limit: number;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        awardBonus: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            agentIds: import("zod").ZodArray<import("zod").ZodString>;
            amount: import("zod").ZodNumber;
            reason: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            succeeded: number;
            failed: number;
            totalAmount: string;
            results: {
                agentId: string;
                name: string;
                success: boolean;
                error?: string;
            }[];
        }, {
            success: boolean;
            succeeded: number;
            failed: number;
            totalAmount: string;
            results: {
                agentId: string;
                name: string;
                success: boolean;
                error?: string;
            }[];
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    };
    townManager: {
        getReport: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodOptional<import("zod").ZodObject<{
            search: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("better-auth").$strip>>, import("@orpc/server").Schema<{
            success: boolean;
            managers: {
                userId: any;
                name: any;
                phone: any;
                email: any;
                status: any;
                approvalStatus: any;
                townName: any;
                cityName: any;
                region: any;
                agentCount: number;
                totalRegisteredUsers: number;
                activeUsers: number;
                totalDrivers: number;
                totalOrders: number;
                totalRevenue: string;
                conversionRate: number;
            }[];
            totals: {
                totalRevenue: string;
                totalManagers: number;
                totalAgents: number;
                totalUsers: number;
                totalActive: number;
                totalDrivers: number;
                totalOrders: number;
            };
        }, {
            success: boolean;
            managers: {
                userId: any;
                name: any;
                phone: any;
                email: any;
                status: any;
                approvalStatus: any;
                townName: any;
                cityName: any;
                region: any;
                agentCount: number;
                totalRegisteredUsers: number;
                activeUsers: number;
                totalDrivers: number;
                totalOrders: number;
                totalRevenue: string;
                conversionRate: number;
            }[];
            totals: {
                totalRevenue: string;
                totalManagers: number;
                totalAgents: number;
                totalUsers: number;
                totalActive: number;
                totalDrivers: number;
                totalOrders: number;
            };
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        listByCity: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            cityName: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            managers: ({
                userId: string;
                name: any;
                phone: any;
                townName: string;
                cityName: string;
            } | {
                userId: string;
                name: any;
                phone: any;
                townName: string;
                cityName: string;
            })[];
        }, {
            success: boolean;
            managers: ({
                userId: string;
                name: any;
                phone: any;
                townName: string;
                cityName: string;
            } | {
                userId: string;
                name: any;
                phone: any;
                townName: string;
                cityName: string;
            })[];
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    };
};
//# sourceMappingURL=admin.d.ts.map