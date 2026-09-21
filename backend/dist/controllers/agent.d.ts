import { z } from 'zod';
export declare const agentController: {
    dashboard: {
        getStats: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
                totalCustomers: number;
                totalDrivers: number;
                totalOrders: number;
                activeOrders: number;
                recentTransactions: number;
                currentBalance: number;
                totalCommissionEarnings: number;
                userCommissionEarnings: number;
                driverCommissionEarnings: number;
                assistedCommissionEarnings: number;
                statusBreakdown: Record<string, number>;
                ordersByDay: Record<string, number>;
                revenueByDay: Record<string, number>;
                referredCustomers: number;
                referredDrivers: number;
            };
        }, {
            success: boolean;
            stats: {
                totalCustomers: number;
                totalDrivers: number;
                totalOrders: number;
                activeOrders: number;
                recentTransactions: number;
                currentBalance: number;
                totalCommissionEarnings: number;
                userCommissionEarnings: number;
                driverCommissionEarnings: number;
                assistedCommissionEarnings: number;
                statusBreakdown: Record<string, number>;
                ordersByDay: Record<string, number>;
                revenueByDay: Record<string, number>;
                referredCustomers: number;
                referredDrivers: number;
            };
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
    getAssignedOrders: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
        orders: {
            customerName: any;
            customerPhone: any;
            pickupLocation: {
                latitude: string;
                longitude: string;
            };
            deliveryLocation: {
                latitude: string;
                longitude: string;
            };
            id: string;
            customerId: string;
            driverId: string;
            agentId: string;
            pickupAddress: string;
            pickupLatitude: string;
            pickupLongitude: string;
            deliveryAddress: string;
            deliveryLatitude: string;
            deliveryLongitude: string;
            materials: unknown;
            vehicleType: string;
            notes: string;
            estimatedPrice: string;
            finalPrice: string;
            agentFee: string;
            status: string;
            rejectionReason: string;
            createdAt: Date;
            updatedAt: Date;
            approvedAt: Date;
            rejectedAt: Date;
            assignedAt: Date;
            pickedUpAt: Date;
            deliveredAt: Date;
            completedAt: Date;
        }[];
    }, {
        success: boolean;
        orders: {
            customerName: any;
            customerPhone: any;
            pickupLocation: {
                latitude: string;
                longitude: string;
            };
            deliveryLocation: {
                latitude: string;
                longitude: string;
            };
            id: string;
            customerId: string;
            driverId: string;
            agentId: string;
            pickupAddress: string;
            pickupLatitude: string;
            pickupLongitude: string;
            deliveryAddress: string;
            deliveryLatitude: string;
            deliveryLongitude: string;
            materials: unknown;
            vehicleType: string;
            notes: string;
            estimatedPrice: string;
            finalPrice: string;
            agentFee: string;
            status: string;
            rejectionReason: string;
            createdAt: Date;
            updatedAt: Date;
            approvedAt: Date;
            rejectedAt: Date;
            assignedAt: Date;
            pickedUpAt: Date;
            deliveredAt: Date;
            completedAt: Date;
        }[];
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    commissions: {
        getUserProgression: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
            customers: ({
                currentRate: number;
                userLifetimeEarnings: number;
                id: any;
                name: any;
                phoneNumber: any;
                userCycleCount: any;
                createdAt: any;
            } | {
                currentRate: number;
                userLifetimeEarnings: number;
                id: any;
                name: any;
                phoneNumber: any;
                userCycleCount: any;
                createdAt: any;
            })[];
        }, {
            success: boolean;
            customers: ({
                currentRate: number;
                userLifetimeEarnings: number;
                id: any;
                name: any;
                phoneNumber: any;
                userCycleCount: any;
                createdAt: any;
            } | {
                currentRate: number;
                userLifetimeEarnings: number;
                id: any;
                name: any;
                phoneNumber: any;
                userCycleCount: any;
                createdAt: any;
            })[];
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getDriverProgression: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
            vehicles: ({
                currentRate: number;
                userLifetimeEarnings: number;
                id: any;
                name: any;
                phoneNumber: any;
                userCycleCount: any;
                createdAt: any;
            } | {
                currentRate: number;
                userLifetimeEarnings: number;
                id: any;
                name: any;
                phoneNumber: any;
                userCycleCount: any;
                createdAt: any;
            })[];
        }, {
            success: boolean;
            vehicles: ({
                currentRate: number;
                userLifetimeEarnings: number;
                id: any;
                name: any;
                phoneNumber: any;
                userCycleCount: any;
                createdAt: any;
            } | {
                currentRate: number;
                userLifetimeEarnings: number;
                id: any;
                name: any;
                phoneNumber: any;
                userCycleCount: any;
                createdAt: any;
            })[];
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getConversionMetrics: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
            metrics: {
                totalCustomers: number;
                activeCustomers: number;
                inactiveCustomers: number;
                customerConversionRate: number;
                totalDrivers: number;
                activeDrivers: number;
                inactiveDrivers: number;
                driverConversionRate: number;
            };
        }, {
            success: boolean;
            metrics: {
                totalCustomers: number;
                activeCustomers: number;
                inactiveCustomers: number;
                customerConversionRate: number;
                totalDrivers: number;
                activeDrivers: number;
                inactiveDrivers: number;
                driverConversionRate: number;
            };
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getAssistanceVerifications: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
            verifications: {
                id: string;
                orderId: string;
                assistingAgentId: string;
                verifiedById: string;
                verificationStatus: string;
                verificationNotes: string;
                createdAt: Date;
                updatedAt: Date;
            }[];
        }, {
            success: boolean;
            verifications: {
                id: string;
                orderId: string;
                assistingAgentId: string;
                verifiedById: string;
                verificationStatus: string;
                verificationNotes: string;
                createdAt: Date;
                updatedAt: Date;
            }[];
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
    wallet: {
        getWallet: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
            wallet: {
                currentBalance: number;
                pendingEarnings: number;
                withdrawableAmount: number;
                totalLifetimeEarnings: number;
                lastPaymentDate: Date;
            };
        }, {
            success: boolean;
            wallet: {
                currentBalance: number;
                pendingEarnings: number;
                withdrawableAmount: number;
                totalLifetimeEarnings: number;
                lastPaymentDate: Date;
            };
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getTransactions: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
        }>, z.ZodOptional<z.ZodObject<{
            limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            offset: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, z.core.$strip>>, import("@orpc/server").Schema<{
            success: boolean;
            transactions: {
                id: string;
                type: string;
                amount: number;
                description: string;
                status: string;
                createdAt: Date;
            }[];
        }, {
            success: boolean;
            transactions: {
                id: string;
                type: string;
                amount: number;
                description: string;
                status: string;
                createdAt: Date;
            }[];
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
    completeOnboarding: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
    }>, z.ZodObject<{
        name: z.ZodString;
        nationalId: z.ZodOptional<z.ZodString>;
        idCardFrontId: z.ZodString;
        idCardBackId: z.ZodString;
        gender: z.ZodOptional<z.ZodString>;
        agentType: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            paid_agent: "paid_agent";
            field_agent: "field_agent";
            verification_agent: "verification_agent";
        }>>>;
        assignedCity: z.ZodOptional<z.ZodString>;
        assignedTown: z.ZodOptional<z.ZodString>;
        latitude: z.ZodOptional<z.ZodString>;
        longitude: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
    }, {
        success: boolean;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    selfRegister: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, Record<never, never>, Record<never, never>>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getTier: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
        currentTier: import("../services/tier.js").Tier;
        qualifiedTier: import("../services/tier.js").Tier;
        nextTier: import("../services/tier.js").Tier | null;
        stats: import("../services/tier.js").AgentTierStats;
        progress: Record<string, {
            current: number;
            required: number;
            met: boolean;
        }>;
        benefits: string[];
        nextTierBenefits: string[] | null;
        success: boolean;
    }, {
        currentTier: import("../services/tier.js").Tier;
        qualifiedTier: import("../services/tier.js").Tier;
        nextTier: import("../services/tier.js").Tier | null;
        stats: import("../services/tier.js").AgentTierStats;
        progress: Record<string, {
            current: number;
            required: number;
            met: boolean;
        }>;
        benefits: string[];
        nextTierBenefits: string[] | null;
        success: boolean;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
};
//# sourceMappingURL=agent.d.ts.map