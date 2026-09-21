/**
 * Web-compatible file upload utility using ORPC chunked uploads.
 * Mirrors the mobile app's upload.ts but uses browser FileReader APIs.
 */

import { orpc } from './oprc';

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

interface UploadOptions {
  onProgress?: (progress: number) => void;
  userId?: string;
  documentType?: string;
}

/**
 * Read a File as base64 string (without the data URL prefix)
 */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:...;base64, prefix
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Get MIME type from filename
 */
function getMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
  };
  return mimeTypes[extension || ''] || 'application/octet-stream';
}

/**
 * Upload a file using chunked upload via ORPC.
 * @param file - Browser File object
 * @param options - Upload options including progress callback
 * @returns File ID that can be stored in database
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<string> {
  try {
    const filename = file.name;
    const mimeType = getMimeType(filename);

    // Read file as base64
    const base64Content = await readFileAsBase64(file);
    const chunkCount = Math.ceil(base64Content.length / CHUNK_SIZE);

    // Step 1: Initiate upload
    const initiateResult = await orpc.upload.initiate({
      filename,
      mimeType,
      size: base64Content.length,
      userId: options.userId,
      documentType: options.documentType,
    });

    const uploadId = initiateResult.uploadId;

    // Step 2: Upload chunks
    for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, base64Content.length);
      const chunkBase64 = base64Content.substring(start, end);

      await orpc.upload.chunk({
        uploadId,
        chunk: chunkBase64,
        index: chunkIndex,
      });

      if (options.onProgress) {
        const progress = ((chunkIndex + 1) / chunkCount) * 100;
        options.onProgress(Math.round(progress));
      }
    }

    // Step 3: Complete upload
    const completeResult = await orpc.upload.complete({ uploadId });

    if (!completeResult.success) {
      throw new Error('Upload failed');
    }

    return completeResult.fileId;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}
