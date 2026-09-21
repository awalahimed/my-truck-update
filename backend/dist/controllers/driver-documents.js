import { os } from '@orpc/server';
import { z } from 'zod';
import crypto from 'node:crypto';
import { db } from '../database/db.js';
import { vehicleImage, driverDocument } from '../database/schema/driver-document-schema.js';
import { uploadedFile } from '../database/schema/file-schema.js';
import { eq, and } from 'drizzle-orm';
import { deleteFileById } from '../utils/upload.js';
/**
 * Driver Documents Controller
 * Handles CRUD operations for driver vehicle images and documents
 */
export const driverDocuments = {
    // Get all vehicle images for a driver (includes legacy vehicle photo)
    getVehicleImages: os.handler(async (ctx) => {
        const input = z.object({
            driverId: z.string(),
        }).parse(ctx.input);
        // Get new vehicle images
        const images = await db.query.vehicleImage.findMany({
            where: and(eq(vehicleImage.driverId, input.driverId), eq(vehicleImage.isActive, 'true')),
            orderBy: (vehicleImage, { asc }) => [asc(vehicleImage.displayOrder), asc(vehicleImage.createdAt)],
        });
        // Get legacy vehicle photo from driver_document table
        const driverDoc = await db.query.driverDocument.findFirst({
            where: eq(driverDocument.driverId, input.driverId),
        });
        let allImages = [...images];
        // If there's a legacy vehicle photo and no new images, include it
        if (driverDoc?.vehiclePhotoId && images.length === 0) {
            const legacyFile = await db.query.uploadedFile.findFirst({
                where: eq(uploadedFile.id, driverDoc.vehiclePhotoId),
            });
            if (legacyFile) {
                allImages.push({
                    id: `legacy_${driverDoc.vehiclePhotoId}`,
                    driverId: input.driverId,
                    fileId: driverDoc.vehiclePhotoId,
                    imageType: 'other',
                    description: 'Legacy vehicle photo',
                    displayOrder: 0,
                    isActive: 'true',
                    createdAt: driverDoc.createdAt,
                    updatedAt: driverDoc.updatedAt,
                });
            }
        }
        // Get file details for each image
        const imagesWithFiles = await Promise.all(allImages.map(async (image) => {
            const file = await db.query.uploadedFile.findFirst({
                where: eq(uploadedFile.id, image.fileId),
            });
            return {
                id: image.id,
                fileId: image.fileId,
                imageType: image.imageType,
                description: image.description,
                displayOrder: image.displayOrder,
                fileName: file?.fileName,
                mimeType: file?.mimeType,
                size: file?.size,
                url: file ? `/uploads/${file.path}` : null,
                createdAt: image.createdAt,
                updatedAt: image.updatedAt,
                isLegacy: image.id.startsWith('legacy_'),
            };
        }));
        return {
            success: true,
            images: imagesWithFiles,
        };
    }),
    // Add a new vehicle image
    addVehicleImage: os.handler(async (ctx) => {
        const input = z.object({
            driverId: z.string(),
            fileId: z.string(),
            imageType: z.enum(['front', 'back', 'side', 'interior', 'other']),
            description: z.string().optional(),
            displayOrder: z.number().optional(),
        }).parse(ctx.input);
        // Verify the file exists
        const file = await db.query.uploadedFile.findFirst({
            where: eq(uploadedFile.id, input.fileId),
        });
        if (!file) {
            throw new Error('File not found');
        }
        // Check if driver already has 5 images
        const existingImages = await db.query.vehicleImage.findMany({
            where: and(eq(vehicleImage.driverId, input.driverId), eq(vehicleImage.isActive, 'true')),
        });
        if (existingImages.length >= 5) {
            throw new Error('Maximum of 5 vehicle images allowed');
        }
        // Get the next display order if not provided
        const maxOrder = existingImages.reduce((max, img) => Math.max(max, img.displayOrder || 0), 0);
        const displayOrder = input.displayOrder ?? (maxOrder + 1);
        const imageId = crypto.randomUUID();
        await db.insert(vehicleImage).values({
            id: imageId,
            driverId: input.driverId,
            fileId: input.fileId,
            imageType: input.imageType,
            description: input.description || null,
            displayOrder,
            isActive: 'true',
        });
        return {
            success: true,
            imageId,
            message: 'Vehicle image added successfully',
        };
    }),
    // Update vehicle image details
    updateVehicleImage: os.handler(async (ctx) => {
        const input = z.object({
            imageId: z.string(),
            driverId: z.string(),
            imageType: z.enum(['front', 'back', 'side', 'interior', 'other']).optional(),
            description: z.string().optional(),
            displayOrder: z.number().optional(),
        }).parse(ctx.input);
        // Verify the image belongs to the driver
        const existingImage = await db.query.vehicleImage.findFirst({
            where: and(eq(vehicleImage.id, input.imageId), eq(vehicleImage.driverId, input.driverId), eq(vehicleImage.isActive, 'true')),
        });
        if (!existingImage) {
            throw new Error('Vehicle image not found');
        }
        const updateData = {
            updatedAt: new Date(),
        };
        if (input.imageType !== undefined) {
            updateData.imageType = input.imageType;
        }
        if (input.description !== undefined) {
            updateData.description = input.description;
        }
        if (input.displayOrder !== undefined) {
            updateData.displayOrder = input.displayOrder;
        }
        await db.update(vehicleImage)
            .set(updateData)
            .where(eq(vehicleImage.id, input.imageId));
        return {
            success: true,
            message: 'Vehicle image updated successfully',
        };
    }),
    // Delete vehicle image
    deleteVehicleImage: os.handler(async (ctx) => {
        const input = z.object({
            imageId: z.string(),
            driverId: z.string(),
        }).parse(ctx.input);
        // Verify the image belongs to the driver
        const existingImage = await db.query.vehicleImage.findFirst({
            where: and(eq(vehicleImage.id, input.imageId), eq(vehicleImage.driverId, input.driverId), eq(vehicleImage.isActive, 'true')),
        });
        if (!existingImage) {
            throw new Error('Vehicle image not found');
        }
        // Check if this is the last image - don't allow deletion if only one remains
        const activeImages = await db.query.vehicleImage.findMany({
            where: and(eq(vehicleImage.driverId, input.driverId), eq(vehicleImage.isActive, 'true')),
        });
        if (activeImages.length <= 1) {
            throw new Error('Cannot delete the last vehicle image. At least one image is required.');
        }
        // Mark as inactive instead of deleting (soft delete)
        await db.update(vehicleImage)
            .set({
            isActive: 'false',
            updatedAt: new Date(),
        })
            .where(eq(vehicleImage.id, input.imageId));
        // Delete the actual file
        try {
            await deleteFileById({ fileId: existingImage.fileId });
            console.log(`✅ Deleted vehicle image file: ${existingImage.fileId}`);
        }
        catch (error) {
            console.error('⚠️ Error deleting vehicle image file:', error);
            // Don't throw - the database record is already marked as inactive
        }
        return {
            success: true,
            message: 'Vehicle image deleted successfully',
        };
    }),
    // Reorder vehicle images
    reorderVehicleImages: os.handler(async (ctx) => {
        const input = z.object({
            driverId: z.string(),
            imageOrders: z.array(z.object({
                imageId: z.string(),
                displayOrder: z.number(),
            })),
        }).parse(ctx.input);
        // Verify all images belong to the driver
        const existingImages = await db.query.vehicleImage.findMany({
            where: and(eq(vehicleImage.driverId, input.driverId), eq(vehicleImage.isActive, 'true')),
        });
        const existingImageIds = existingImages.map(img => img.id);
        const inputImageIds = input.imageOrders.map(order => order.imageId);
        // Check if all provided image IDs are valid
        const invalidIds = inputImageIds.filter(id => !existingImageIds.includes(id));
        if (invalidIds.length > 0) {
            throw new Error(`Invalid image IDs: ${invalidIds.join(', ')}`);
        }
        // Update display orders
        await Promise.all(input.imageOrders.map(async (order) => {
            await db.update(vehicleImage)
                .set({
                displayOrder: order.displayOrder,
                updatedAt: new Date(),
            })
                .where(eq(vehicleImage.id, order.imageId));
        }));
        return {
            success: true,
            message: 'Vehicle images reordered successfully',
        };
    }),
    // Migrate legacy vehicle photo to new system
    migrateLegacyVehiclePhoto: os.handler(async (ctx) => {
        const input = z.object({
            driverId: z.string(),
        }).parse(ctx.input);
        // Check if driver has legacy vehicle photo
        const driverDoc = await db.query.driverDocument.findFirst({
            where: eq(driverDocument.driverId, input.driverId),
        });
        if (!driverDoc?.vehiclePhotoId) {
            return {
                success: true,
                message: 'No legacy vehicle photo to migrate',
            };
        }
        // Check if already migrated (has new vehicle images)
        const existingImages = await db.query.vehicleImage.findMany({
            where: and(eq(vehicleImage.driverId, input.driverId), eq(vehicleImage.isActive, 'true')),
        });
        if (existingImages.length > 0) {
            return {
                success: true,
                message: 'Driver already has new vehicle images',
            };
        }
        // Migrate legacy photo to new system
        const imageId = crypto.randomUUID();
        await db.insert(vehicleImage).values({
            id: imageId,
            driverId: input.driverId,
            fileId: driverDoc.vehiclePhotoId,
            imageType: 'other',
            description: 'Migrated from legacy vehicle photo',
            displayOrder: 0,
            isActive: 'true',
        });
        return {
            success: true,
            imageId,
            message: 'Legacy vehicle photo migrated successfully',
        };
    }),
};
//# sourceMappingURL=driver-documents.js.map