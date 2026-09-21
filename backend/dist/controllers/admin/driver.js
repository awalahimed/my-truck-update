import { z } from 'zod';
import { os } from '@orpc/server';
import { adminProcedure } from '../../middlewares/auth-admin.js';
import { db } from '../../database/db.js';
import { user, accountStatus } from '../../database/schema/auth-schema.js';
import { vehicle } from '../../database/schema/vehicle-schema.js';
import { uploadedFile } from '../../database/schema/file-schema.js';
import { driverDocument } from '../../database/schema/driver-document-schema.js';
import { eq } from 'drizzle-orm';
export const adminDriverController = os.router({
    // Get all drivers with their details
    getAllDrivers: adminProcedure
        .handler(async () => {
        try {
            console.log('[Admin] getAllDrivers called');
            // Get all users with driver role
            const drivers = await db.select({
                id: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                accountStatus: user.accountStatus,
                banned: user.banned,
                createdAt: user.createdAt,
                image: user.image,
            })
                .from(user)
                .where(eq(user.role, 'driver'));
            // Get vehicle info for each driver
            const driverIds = drivers.map(d => d.id);
            const vehicles = driverIds.length > 0
                ? await db.select()
                    .from(vehicle)
                    .where(eq(vehicle.driverId, driverIds[0])) // This is a simplified query
                : [];
            const vehicleMap = new Map(vehicles.map(v => [v.driverId, v]));
            // Combine driver and vehicle data
            const driversWithVehicles = drivers.map(driver => ({
                ...driver,
                vehicleType: vehicleMap.get(driver.id)?.type || null,
                vehiclePlate: vehicleMap.get(driver.id)?.plateNumber || null,
            }));
            console.log('[Admin] Found drivers:', driversWithVehicles.length);
            return { success: true, drivers: driversWithVehicles };
        }
        catch (error) {
            console.error('[Admin] Error getting drivers:', error);
            throw error;
        }
    }),
    // Get driver details with vehicle image
    getDriverDetails: adminProcedure
        .input(z.object({ driverId: z.string() }))
        .handler(async ({ input }) => {
        console.log('[Admin] getDriverDetails called for:', input.driverId);
        const { driverId } = input;
        // Get driver info
        const driverData = await db.select()
            .from(user)
            .where(eq(user.id, driverId))
            .limit(1);
        if (!driverData.length) {
            throw new Error('Driver not found');
        }
        const driver = driverData[0];
        console.log('[Admin] Driver found:', driver?.name);
        console.log('[Admin] Driver image:', driver?.image);
        // Get vehicle info
        const vehicleData = await db.select()
            .from(vehicle)
            .where(eq(vehicle.driverId, driverId))
            .limit(1);
        // Get driver document record (contains file IDs)
        const driverDocData = await db.select()
            .from(driverDocument)
            .where(eq(driverDocument.driverId, driverId))
            .limit(1);
        let licenseFront = null;
        let licenseBack = null;
        let vehiclePhoto = null;
        if (driverDocData.length > 0) {
            const doc = driverDocData[0];
            console.log('[Admin] Document IDs:', {
                licenseFrontId: doc?.licenseFrontId,
                licenseBackId: doc?.licenseBackId,
                vehiclePhotoId: doc?.vehiclePhotoId
            });
            // Fetch actual file records
            if (doc?.licenseFrontId) {
                const frontFile = await db.select()
                    .from(uploadedFile)
                    .where(eq(uploadedFile.id, doc.licenseFrontId))
                    .limit(1);
                licenseFront = frontFile.length > 0 ? frontFile[0]?.path : null;
                console.log('[Admin] License front file:', licenseFront);
            }
            if (doc?.licenseBackId) {
                const backFile = await db.select()
                    .from(uploadedFile)
                    .where(eq(uploadedFile.id, doc.licenseBackId))
                    .limit(1);
                licenseBack = backFile.length > 0 ? backFile[0]?.path : null;
                console.log('[Admin] License back file:', licenseBack);
            }
            if (doc?.vehiclePhotoId) {
                const vehicleFile = await db.select()
                    .from(uploadedFile)
                    .where(eq(uploadedFile.id, doc.vehiclePhotoId))
                    .limit(1);
                vehiclePhoto = vehicleFile.length > 0 ? vehicleFile[0]?.path : null;
                console.log('[Admin] Vehicle photo file:', vehiclePhoto);
            }
        }
        console.log('[Admin] Returning:', {
            licenseFront,
            licenseBack,
            vehiclePhoto
        });
        return {
            success: true,
            driver: {
                ...driver,
                vehicle: vehicleData.length > 0 ? vehicleData[0] : null,
                vehicleImage: vehiclePhoto,
                licenseFrontImage: licenseFront,
                licenseBackImage: licenseBack,
            },
        };
    }),
    // Reject driver with document selection
    rejectDriver: adminProcedure
        .input(z.object({
        driverId: z.string(),
        reason: z.string().min(1),
        rejectedDocument: z.enum(['license', 'vehicle']),
    }))
        .handler(async ({ input }) => {
        try {
            console.log('[Admin] rejectDriver called:', input);
            const { driverId, reason, rejectedDocument } = input;
            console.log('[Admin] Updating user with rejection details...');
            // Update user with rejection details and set status to rejected
            await db.update(user)
                .set({
                accountStatus: accountStatus.REJECTED,
                rejectionReason: reason,
                rejectedDocument,
                rejectedAt: new Date(),
            })
                .where(eq(user.id, driverId));
            console.log('[Admin] Driver rejected successfully (status: rejected):', driverId);
            return { success: true, message: 'Driver rejected' };
        }
        catch (error) {
            console.error('[Admin] Error rejecting driver:', error);
            throw error;
        }
    }),
    // Get rejection status for current user
    getRejectionStatus: adminProcedure
        .handler(async ({ context }) => {
        const userId = context.user.id;
        const userData = await db.select({
            rejectionReason: user.rejectionReason,
            rejectedDocument: user.rejectedDocument,
            rejectedAt: user.rejectedAt,
            accountStatus: user.accountStatus,
        })
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);
        if (!userData.length) {
            return { success: true, hasRejection: false };
        }
        const data = userData[0];
        if (!data) {
            return { success: true, hasRejection: false };
        }
        // Check if rejected status with rejection details
        if (data.accountStatus === accountStatus.REJECTED && data.rejectionReason && data.rejectedDocument) {
            return {
                success: true,
                hasRejection: true,
                rejectionReason: data.rejectionReason,
                rejectedDocument: data.rejectedDocument,
                rejectedAt: data.rejectedAt,
            };
        }
        return { success: true, hasRejection: false };
    }),
    // Clear rejection after re-upload
    clearRejection: adminProcedure
        .handler(async ({ context }) => {
        const userId = context.user.id;
        await db.update(user)
            .set({
            accountStatus: accountStatus.PENDING,
            rejectionReason: null,
            rejectedDocument: null,
            rejectedAt: null,
        })
            .where(eq(user.id, userId));
        return { success: true, message: 'Rejection cleared, pending review' };
    }),
});
console.log('[Admin Driver Controller] Driver controller created successfully');
//# sourceMappingURL=driver.js.map