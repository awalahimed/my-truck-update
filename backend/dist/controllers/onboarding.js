import { os } from '@orpc/server';
import { z } from 'zod';
import crypto from 'node:crypto';
import { db } from '../database/db.js';
import { user } from '../database/schema/auth-schema.js';
import { vehicle } from '../database/schema/vehicle-schema.js';
import { driverDocument } from '../database/schema/driver-document-schema.js';
import { userRoles, accountStatus } from '../database/schema/auth-schema.js';
import { eq } from 'drizzle-orm';
import { deleteFileById } from '../utils/upload.js';
/**
 * Onboarding Routes
 * These routes UPDATE existing users (created with role "unknown") to complete onboarding
 * They only work if the user's current role is "unknown"
 */
export const onboarding = {
    // Update owner profile and role
    updateOwnerProfile: os.handler(async (ctx) => {
        const input = z.object({
            userId: z.string(),
            name: z.string().optional(),
            profilePhotoId: z.string().optional(),
            registeredByAgentId: z.string().optional(),
        }).parse(ctx.input);
        const existingUser = await db.query.user.findFirst({
            where: eq(user.id, input.userId),
        });
        if (!existingUser) {
            throw new Error('User not found');
        }
        if (existingUser.role !== userRoles.UNKNOWN) {
            throw new Error('User has already completed onboarding');
        }
        const updateFields = {
            role: userRoles.OWNER_SHOP,
            accountStatus: accountStatus.ACTIVE,
            name: input.name || existingUser.name,
            image: input.profilePhotoId ? `/uploads/${input.profilePhotoId}` : existingUser.image,
            updatedAt: new Date(),
        };
        if (input.registeredByAgentId && !existingUser.registeredByAgentId) {
            updateFields.registeredByAgentId = input.registeredByAgentId;
        }
        await db.update(user).set(updateFields).where(eq(user.id, input.userId));
        return { success: true, userId: input.userId };
    }),
    // Update driver profile and role
    updateDriverProfile: os.handler(async (ctx) => {
        const input = z.object({
            userId: z.string(),
            name: z.string(),
            profilePhotoId: z.string().optional(),
            licenseFrontId: z.string(),
            licenseBackId: z.string(),
            vehiclePhotoId: z.string().optional(), // Vehicle photo
            vehicleType: z.enum(['motorcycle', 'car', 'truck']),
            plateNumber: z.string(),
            registeredByAgentId: z.string().optional(), // NEW: Optional agent ID
        }).parse(ctx.input);
        // Get existing user
        const existingUser = await db.query.user.findFirst({
            where: eq(user.id, input.userId),
        });
        if (!existingUser) {
            throw new Error('User not found');
        }
        // Only allow update if role is unknown
        if (existingUser.role !== userRoles.UNKNOWN) {
            throw new Error('User has already completed onboarding');
        }
        const userUpdateFields = {
            role: userRoles.DRIVER,
            accountStatus: accountStatus.PENDING, // Drivers need approval
            name: input.name,
            image: input.profilePhotoId ? `/uploads/${input.profilePhotoId}` : existingUser.image,
            updatedAt: new Date(),
        };
        // Only set registeredByAgentId for user if it's provided and not already set
        if (input.registeredByAgentId && !existingUser.registeredByAgentId) {
            // TODO: Validate if registeredByAgentId is an actual agent
            userUpdateFields.registeredByAgentId = input.registeredByAgentId;
        }
        // Update user with new role and pending status (needs admin approval for drivers)
        await db.update(user)
            .set(userUpdateFields)
            .where(eq(user.id, input.userId));
        // Save vehicle information
        const capacityMap = {
            motorcycle: 'Up to 20kg',
            car: 'Up to 100kg',
            truck: 'Up to 1000kg'
        };
        const vehicleInsertFields = {
            id: crypto.randomUUID(),
            driverId: input.userId,
            type: input.vehicleType,
            plateNumber: input.plateNumber,
            capacity: capacityMap[input.vehicleType],
            isActive: true,
        };
        // Only set registeredByAgentId for vehicle if it's provided
        if (input.registeredByAgentId) {
            // TODO: Validate if registeredByAgentId is an actual agent
            vehicleInsertFields.registeredByAgentId = input.registeredByAgentId;
        }
        await db.insert(vehicle).values(vehicleInsertFields);
        // Save driver documents
        await db.insert(driverDocument).values({
            id: crypto.randomUUID(),
            driverId: input.userId,
            licenseFrontId: input.licenseFrontId,
            licenseBackId: input.licenseBackId,
            vehiclePhotoId: input.vehiclePhotoId,
        });
        return {
            success: true,
            userId: input.userId,
            licenseStatus: 'pending_approval'
        };
    }),
    // Re-upload driver license when rejected (accountStatus is REJECTED with rejection details)
    reuploadDriverLicense: os.handler(async (ctx) => {
        const input = z.object({
            userId: z.string(),
            licenseFrontId: z.string(),
            licenseBackId: z.string(),
        }).parse(ctx.input);
        // Get existing user
        const existingUser = await db.query.user.findFirst({
            where: eq(user.id, input.userId),
        });
        if (!existingUser) {
            throw new Error('User not found');
        }
        // Only allow re-upload if user is a driver with REJECTED status and has rejection details
        if (existingUser.role !== userRoles.DRIVER) {
            throw new Error('Only drivers can re-upload license');
        }
        if (existingUser.accountStatus !== accountStatus.REJECTED || !existingUser.rejectionReason) {
            throw new Error('License re-upload is only allowed when account is rejected');
        }
        // Get old document IDs before updating
        const oldDocument = await db.query.driverDocument.findFirst({
            where: eq(driverDocument.driverId, input.userId),
        });
        // Clear rejection details and set status to RE_UPLOADED for re-review
        await db.update(user)
            .set({
            accountStatus: accountStatus.RE_UPLOADED,
            rejectionReason: null,
            rejectedDocument: null,
            rejectedAt: null,
            updatedAt: new Date(),
        })
            .where(eq(user.id, input.userId));
        // Update driver documents with new IDs
        await db.update(driverDocument)
            .set({
            licenseFrontId: input.licenseFrontId,
            licenseBackId: input.licenseBackId,
            updatedAt: new Date(),
        })
            .where(eq(driverDocument.driverId, input.userId));
        // Delete old files from database and filesystem
        if (oldDocument) {
            try {
                if (oldDocument.licenseFrontId) {
                    await deleteFileById({ fileId: oldDocument.licenseFrontId });
                    console.log(`✅ Deleted old license front file: ${oldDocument.licenseFrontId}`);
                }
                if (oldDocument.licenseBackId) {
                    await deleteFileById({ fileId: oldDocument.licenseBackId });
                    console.log(`✅ Deleted old license back file: ${oldDocument.licenseBackId}`);
                }
            }
            catch (error) {
                console.error('⚠️ Error deleting old license files:', error);
                // Don't throw - we still want the reupload to succeed even if old file deletion fails
            }
        }
        return {
            success: true,
            userId: input.userId,
            licenseStatus: 'pending_approval',
            message: 'License re-uploaded successfully. Please wait for admin approval.',
        };
    }),
    // Re-upload vehicle photo when rejected
    reuploadVehiclePhoto: os.handler(async (ctx) => {
        const input = z.object({
            userId: z.string(),
            vehiclePhotoId: z.string(),
        }).parse(ctx.input);
        // Get existing user
        const existingUser = await db.query.user.findFirst({
            where: eq(user.id, input.userId),
        });
        if (!existingUser) {
            throw new Error('User not found');
        }
        // Only allow re-upload if user is a driver with REJECTED status and has rejection details
        if (existingUser.role !== userRoles.DRIVER) {
            throw new Error('Only drivers can re-upload vehicle photo');
        }
        if (existingUser.accountStatus !== accountStatus.REJECTED || !existingUser.rejectionReason) {
            throw new Error('Vehicle photo re-upload is only allowed when account is rejected');
        }
        // Get old document ID before updating
        const oldDocument = await db.query.driverDocument.findFirst({
            where: eq(driverDocument.driverId, input.userId),
        });
        // Clear rejection details and set status to RE_UPLOADED for re-review
        await db.update(user)
            .set({
            accountStatus: accountStatus.RE_UPLOADED,
            rejectionReason: null,
            rejectedDocument: null,
            rejectedAt: null,
            updatedAt: new Date(),
        })
            .where(eq(user.id, input.userId));
        // Update driver documents with new ID
        await db.update(driverDocument)
            .set({
            vehiclePhotoId: input.vehiclePhotoId,
            updatedAt: new Date(),
        })
            .where(eq(driverDocument.driverId, input.userId));
        // Delete old vehicle photo from database and filesystem
        if (oldDocument?.vehiclePhotoId) {
            try {
                await deleteFileById({ fileId: oldDocument.vehiclePhotoId });
                console.log(`✅ Deleted old vehicle photo file: ${oldDocument.vehiclePhotoId}`);
            }
            catch (error) {
                console.error('⚠️ Error deleting old vehicle photo:', error);
                // Don't throw - we still want the reupload to succeed even if old file deletion fails
            }
        }
        return {
            success: true,
            userId: input.userId,
            vehicleStatus: 'pending_approval',
            message: 'Vehicle photo re-uploaded successfully. Please wait for admin approval.',
        };
    }),
};
//# sourceMappingURL=onboarding.js.map