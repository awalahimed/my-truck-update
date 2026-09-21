/**
 * Driver Documents Controller
 * Handles CRUD operations for driver vehicle images and documents
 */
export declare const driverDocuments: {
    getVehicleImages: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        images: {
            id: string;
            fileId: string;
            imageType: string;
            description: string;
            displayOrder: number;
            fileName: string;
            mimeType: string;
            size: number;
            url: string;
            createdAt: Date;
            updatedAt: Date;
            isLegacy: boolean;
        }[];
    }, {
        success: boolean;
        images: {
            id: string;
            fileId: string;
            imageType: string;
            description: string;
            displayOrder: number;
            fileName: string;
            mimeType: string;
            size: number;
            url: string;
            createdAt: Date;
            updatedAt: Date;
            isLegacy: boolean;
        }[];
    }>, Record<never, never>, Record<never, never>>;
    addVehicleImage: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        imageId: `${string}-${string}-${string}-${string}-${string}`;
        message: string;
    }, {
        success: boolean;
        imageId: `${string}-${string}-${string}-${string}-${string}`;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    updateVehicleImage: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    deleteVehicleImage: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    reorderVehicleImages: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    migrateLegacyVehiclePhoto: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
        imageId?: undefined;
    } | {
        success: boolean;
        imageId: `${string}-${string}-${string}-${string}-${string}`;
        message: string;
    }, {
        success: boolean;
        message: string;
        imageId?: undefined;
    } | {
        success: boolean;
        imageId: `${string}-${string}-${string}-${string}-${string}`;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=driver-documents.d.ts.map