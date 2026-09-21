import { z } from 'zod';
export declare const adminDriverController: {
    getAllDrivers: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getDriverDetails: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
        driverId: z.ZodString;
    }, z.core.$strip>, import("@orpc/server").Schema<{
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
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    rejectDriver: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
        driverId: z.ZodString;
        reason: z.ZodString;
        rejectedDocument: z.ZodEnum<{
            vehicle: "vehicle";
            license: "license";
        }>;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getRejectionStatus: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    clearRejection: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
//# sourceMappingURL=driver.d.ts.map