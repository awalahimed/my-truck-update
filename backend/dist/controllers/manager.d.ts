export declare const managerRouter: {
    dashboard: {
        getMyProfile: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
            data?: undefined;
        } | {
            success: boolean;
            data: {
                id: string;
                userId: string;
                townName: string;
                cityName: string;
                region: string;
                status: string;
                totalAgents: number;
                regionalRevenue: string;
                cityRanking: number;
                latitude: string;
                longitude: string;
                contactPhone: string;
                contactEmail: string;
                approvalStatus: string;
                approvedBy: string;
                notes: string;
                createdAt: Date;
                updatedAt: Date;
            };
            message?: undefined;
        }, {
            success: boolean;
            message: string;
            data?: undefined;
        } | {
            success: boolean;
            data: {
                id: string;
                userId: string;
                townName: string;
                cityName: string;
                region: string;
                status: string;
                totalAgents: number;
                regionalRevenue: string;
                cityRanking: number;
                latitude: string;
                longitude: string;
                contactPhone: string;
                contactEmail: string;
                approvalStatus: string;
                approvedBy: string;
                notes: string;
                createdAt: Date;
                updatedAt: Date;
            };
            message?: undefined;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
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
            message: string;
            profile?: undefined;
            totals?: undefined;
            agents?: undefined;
        } | {
            success: boolean;
            profile: {
                townName: string;
                cityName: string;
                region: string;
                status: string;
            };
            totals: {
                totalRevenue: string;
                totalAgents: number;
                totalRegistered: number;
                totalActive: number;
                totalDrivers: number;
                totalOrders: number;
            };
            agents: {
                agentId: any;
                agentName: any;
                agentPhone: any;
                assignedCity: any;
                assignedTown: any;
                tier: any;
                totalRegistered: number;
                totalDrivers: number;
                activeUsers: number;
                activeDrivers: number;
                completedOrders: number;
                totalRevenue: number;
                conversionRate: number;
            }[];
            message?: undefined;
        }, {
            success: boolean;
            message: string;
            profile?: undefined;
            totals?: undefined;
            agents?: undefined;
        } | {
            success: boolean;
            profile: {
                townName: string;
                cityName: string;
                region: string;
                status: string;
            };
            totals: {
                totalRevenue: string;
                totalAgents: number;
                totalRegistered: number;
                totalActive: number;
                totalDrivers: number;
                totalOrders: number;
            };
            agents: {
                agentId: any;
                agentName: any;
                agentPhone: any;
                assignedCity: any;
                assignedTown: any;
                tier: any;
                totalRegistered: number;
                totalDrivers: number;
                activeUsers: number;
                activeDrivers: number;
                completedOrders: number;
                totalRevenue: number;
                conversionRate: number;
            }[];
            message?: undefined;
        }>, import("@orpc/server").MergedErrorMap<Record<never, never>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
    agents: {
        approve: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
        suspend: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
        assignTerritory: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
};
//# sourceMappingURL=manager.d.ts.map