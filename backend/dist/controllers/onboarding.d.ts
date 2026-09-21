/**
 * Onboarding Routes
 * These routes UPDATE existing users (created with role "unknown") to complete onboarding
 * They only work if the user's current role is "unknown"
 */
export declare const onboarding: {
    updateOwnerProfile: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        userId: string;
    }, {
        success: boolean;
        userId: string;
    }>, Record<never, never>, Record<never, never>>;
    updateDriverProfile: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        userId: string;
        licenseStatus: string;
    }, {
        success: boolean;
        userId: string;
        licenseStatus: string;
    }>, Record<never, never>, Record<never, never>>;
    reuploadDriverLicense: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        userId: string;
        licenseStatus: string;
        message: string;
    }, {
        success: boolean;
        userId: string;
        licenseStatus: string;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    reuploadVehiclePhoto: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        userId: string;
        vehicleStatus: string;
        message: string;
    }, {
        success: boolean;
        userId: string;
        vehicleStatus: string;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=onboarding.d.ts.map