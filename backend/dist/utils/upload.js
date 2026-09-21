import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { config } from '../config/env_config.js';
import { uploadedFile, uploadStatus } from '../database/schema/file-schema.js';
import { db } from '../database/db.js';
import { eq, and } from 'drizzle-orm';
// Ensure upload directory exists
export function ensureUploadDir() {
    const dir = path.resolve(config.upload.dir);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
// Ensure document type folder exists
export function ensureTypeDir(documentType) {
    const baseDir = path.resolve(config.upload.dir);
    const typeDir = path.join(baseDir, documentType);
    if (!fs.existsSync(typeDir)) {
        fs.mkdirSync(typeDir, { recursive: true });
    }
    return typeDir;
}
// Generate unique filename
export function generateFileName(originalName) {
    const ext = path.extname(originalName);
    const uuid = crypto.randomUUID();
    return `${uuid}${ext}`;
}
// Validate MIME type
export function validateMimeType(mimeType) {
    const allowed = config.upload.allowedMimeTypes;
    for (const pattern of allowed) {
        if (pattern === mimeType)
            return true;
        if (pattern.endsWith('/*')) {
            const category = pattern.slice(0, -1);
            if (mimeType.startsWith(category))
                return true;
        }
    }
    return false;
}
// Initiate upload - create file record
export async function initiateUpload(params) {
    const { filename, mimeType, size, userId, documentType } = params;
    // Validate file size
    if (size > config.upload.maxFileSize) {
        throw new Error(`File size exceeds maximum allowed size of ${config.upload.maxFileSize} bytes`);
    }
    // Validate MIME type
    if (!validateMimeType(mimeType)) {
        throw new Error(`MIME type ${mimeType} is not allowed`);
    }
    const uploadId = crypto.randomUUID();
    const fileId = crypto.randomUUID();
    const fileName = generateFileName(filename);
    const chunkCount = Math.ceil(size / config.upload.chunkSize);
    const docType = documentType || 'other';
    // Ensure type folder exists
    const typeDir = ensureTypeDir(docType);
    ensureUploadDir();
    await db.insert(uploadedFile).values({
        id: fileId,
        filename,
        fileName,
        mimeType,
        documentType: docType,
        size,
        path: path.join(docType, fileName),
        uploadId,
        uploadStatus: uploadStatus.PENDING,
        chunkCount,
        chunksReceived: 0,
        userId: userId ?? null,
    });
    // Create temp file for chunks in base directory
    const tempPath = path.join(config.upload.dir, `${uploadId}.tmp`);
    const writeStream = fs.createWriteStream(tempPath);
    writeStream.close(); // Create empty file
    return {
        uploadId,
        fileId: fileId,
        chunkCount,
    };
}
// Upload a chunk
export async function uploadChunk(params) {
    const { uploadId, chunk, index } = params;
    // Get file record
    const [fileRecord] = await db
        .select()
        .from(uploadedFile)
        .where(eq(uploadedFile.uploadId, uploadId))
        .limit(1);
    if (!fileRecord) {
        throw new Error('Upload not found');
    }
    if (fileRecord.uploadStatus !== uploadStatus.PENDING && fileRecord.uploadStatus !== uploadStatus.IN_PROGRESS) {
        throw new Error('Upload is not in progress');
    }
    // Update status to in_progress if first chunk
    if (fileRecord.uploadStatus === uploadStatus.PENDING) {
        await db
            .update(uploadedFile)
            .set({ uploadStatus: uploadStatus.IN_PROGRESS })
            .where(eq(uploadedFile.id, fileRecord.id));
    }
    // Append chunk to temp file
    const tempPath = path.join(config.upload.dir, `${uploadId}.tmp`);
    await appendChunk(tempPath, chunk, index * config.upload.chunkSize);
    // Update chunks received
    const newChunksReceived = Math.max(fileRecord.chunksReceived, index + 1);
    await db
        .update(uploadedFile)
        .set({ chunksReceived: newChunksReceived })
        .where(eq(uploadedFile.id, fileRecord.id));
    return {
        success: true,
        chunksReceived: newChunksReceived,
    };
}
// Append chunk to file
async function appendChunk(filePath, chunk, offset) {
    try {
        const chunkBuffer = Buffer.from(chunk);
        console.log('[appendChunk]', { filePath, chunkLength: chunkBuffer.length, offset });
        // For chunked uploads, we should write chunks sequentially
        // Open file in append mode or create if doesn't exist
        const fileHandle = await fs.promises.open(filePath, 'a+');
        try {
            // Write chunk at the end of file (sequential writing)
            await fileHandle.write(chunkBuffer);
            console.log('[appendChunk] Wrote chunk, size:', chunkBuffer.length);
        }
        finally {
            await fileHandle.close();
        }
    }
    catch (error) {
        console.error('appendChunk error:', error);
        throw error;
    }
}
// Complete upload - move temp file to final location
export async function completeUpload(params) {
    const { uploadId } = params;
    // Get file record
    const [fileRecord] = await db
        .select()
        .from(uploadedFile)
        .where(eq(uploadedFile.uploadId, uploadId))
        .limit(1);
    if (!fileRecord) {
        throw new Error('Upload not found');
    }
    if (fileRecord.chunksReceived < fileRecord.chunkCount) {
        throw new Error(`Incomplete upload: ${fileRecord.chunksReceived}/${fileRecord.chunkCount} chunks received`);
    }
    const tempPath = path.join(config.upload.dir, `${uploadId}.tmp`);
    const finalPath = path.resolve(config.upload.dir, fileRecord.path);
    // Ensure directory exists
    await fs.promises.mkdir(path.dirname(finalPath), { recursive: true });
    // Rename temp file to final location
    await fs.promises.rename(tempPath, finalPath);
    // Update status to completed
    await db
        .update(uploadedFile)
        .set({ uploadStatus: uploadStatus.COMPLETED })
        .where(eq(uploadedFile.id, fileRecord.id));
    return {
        success: true,
        fileId: fileRecord.id,
        path: finalPath,
    };
}
// Get upload status
export async function getUploadStatus(params) {
    const { uploadId } = params;
    const [fileRecord] = await db
        .select()
        .from(uploadedFile)
        .where(eq(uploadedFile.uploadId, uploadId))
        .limit(1);
    if (!fileRecord) {
        throw new Error('Upload not found');
    }
    const progress = fileRecord.chunkCount > 0
        ? Math.round((fileRecord.chunksReceived / fileRecord.chunkCount) * 100)
        : 0;
    return {
        uploadId: fileRecord.uploadId,
        fileId: fileRecord.id,
        status: fileRecord.uploadStatus,
        chunksReceived: fileRecord.chunksReceived,
        chunkCount: fileRecord.chunkCount,
        progress,
    };
}
// Cancel upload
export async function cancelUpload(params) {
    const { uploadId } = params;
    const [fileRecord] = await db
        .select()
        .from(uploadedFile)
        .where(eq(uploadedFile.uploadId, uploadId))
        .limit(1);
    if (!fileRecord) {
        throw new Error('Upload not found');
    }
    // Delete temp file if exists
    const tempPath = path.join(config.upload.dir, `${uploadId}.tmp`);
    if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
    }
    // Delete file record
    await db
        .delete(uploadedFile)
        .where(eq(uploadedFile.id, fileRecord.id));
    return { success: true };
}
// Get file by user ID and document type
export async function getFileByUserAndType(params) {
    const { userId, documentType } = params;
    const [fileRecord] = await db
        .select()
        .from(uploadedFile)
        .where(and(eq(uploadedFile.userId, userId), eq(uploadedFile.documentType, documentType), eq(uploadedFile.uploadStatus, uploadStatus.COMPLETED)))
        .orderBy(uploadedFile.createdAt)
        .limit(1);
    return fileRecord || null;
}
// Delete file by path (filesystem only, no database operation)
export async function deleteFileByPath(filePath) {
    try {
        const resolvedPath = path.resolve(config.upload.dir, filePath);
        console.log('[deleteFileByPath] Deleting:', resolvedPath);
        if (fs.existsSync(resolvedPath)) {
            fs.unlinkSync(resolvedPath);
            console.log('[deleteFileByPath] File deleted successfully');
        }
        else {
            console.log('[deleteFileByPath] File not found, skipping');
        }
        return { success: true };
    }
    catch (error) {
        console.error('[deleteFileByPath] Error:', error);
        throw error;
    }
}
// Delete file by ID and unlink from filesystem
export async function deleteFileById(params) {
    const { fileId } = params;
    const [fileRecord] = await db
        .select()
        .from(uploadedFile)
        .where(eq(uploadedFile.id, fileId))
        .limit(1);
    if (!fileRecord) {
        throw new Error('File not found');
    }
    // Delete file from filesystem
    const filePath = path.resolve(fileRecord.path);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    // Delete file record
    await db
        .delete(uploadedFile)
        .where(eq(uploadedFile.id, fileId));
    return { success: true };
}
//# sourceMappingURL=upload.js.map