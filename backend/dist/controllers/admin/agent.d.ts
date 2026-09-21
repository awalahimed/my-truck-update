import { z } from 'zod';
export declare const adminAgentController: {
    list: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
    }>, z.ZodOptional<z.ZodObject<{
        search: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>, import("@orpc/server").Schema<{
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
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    create: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
        phone: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
        password: z.ZodString;
        nationalId: z.ZodOptional<z.ZodString>;
        gender: z.ZodOptional<z.ZodString>;
        assignedCity: z.ZodOptional<z.ZodString>;
        assignedTown: z.ZodOptional<z.ZodString>;
        assignedTownManager: z.ZodOptional<z.ZodString>;
        agentType: z.ZodOptional<z.ZodString>;
        latitude: z.ZodOptional<z.ZodString>;
        longitude: z.ZodOptional<z.ZodString>;
        idCardFrontId: z.ZodOptional<z.ZodString>;
        idCardBackId: z.ZodOptional<z.ZodString>;
        profilePhotoId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
        agentId: any;
    }, {
        success: boolean;
        message: string;
        agentId: any;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    update: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
        id: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        nationalId: z.ZodOptional<z.ZodString>;
        gender: z.ZodOptional<z.ZodString>;
        assignedCity: z.ZodOptional<z.ZodString>;
        assignedTown: z.ZodOptional<z.ZodString>;
        assignedTownManager: z.ZodOptional<z.ZodString>;
        agentType: z.ZodOptional<z.ZodString>;
        latitude: z.ZodOptional<z.ZodString>;
        longitude: z.ZodOptional<z.ZodString>;
        idCardFrontId: z.ZodOptional<z.ZodString>;
        idCardBackId: z.ZodOptional<z.ZodString>;
        profilePhotoId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    updateStatus: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
        id: z.ZodString;
        status: z.ZodEnum<{
            active: "active";
            suspended: "suspended";
            pending: "pending";
            rejected: "rejected";
        }>;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    rejectAgent: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
        agentId: z.ZodString;
        reason: z.ZodString;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getPerformance: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
        agentId: z.ZodString;
    }, z.core.$strip>, import("@orpc/server").Schema<{
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
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getMapData: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    updateLocation: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
        id: z.ZodString;
        latitude: z.ZodOptional<z.ZodString>;
        longitude: z.ZodOptional<z.ZodString>;
        assignedCity: z.ZodOptional<z.ZodString>;
        assignedTown: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
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
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getConversionStats: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getTierBreakdown: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
    }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<any, any>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    recalculateTiers: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
        total: number;
        upgrades: number;
        breakdown: Record<string, number>;
        success: boolean;
    }, {
        total: number;
        upgrades: number;
        breakdown: Record<string, number>;
        success: boolean;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
};
//# sourceMappingURL=agent.d.ts.map