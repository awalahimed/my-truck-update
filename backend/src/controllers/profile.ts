import { os } from '@orpc/server'
import { z } from 'zod'
import { db } from '../database/db.js'
import { user, account, verification } from '../database/schema/auth-schema.js'
import { order, orderStatus } from '../database/schema/order-schema.js'
import { eq, and, gt, or } from 'drizzle-orm'
import { createOTP, verifyOTP, deleteOTP, phoneNumberExists } from '../utils/otp.js'
import { verifyPassword, hashPassword } from '../utils/password.js'
import { getFileByUserAndType, deleteFileById } from '../utils/upload.js'
import { uploadedFile } from '../database/schema/file-schema.js'

/**
 * Profile Routes
 * These routes handle updating user profile information after onboarding
 */

/**
 * Generate OTP for phone update
 */
const sendPhoneUpdateOTP = os.handler(async (ctx) => {
  const input = z.object({
    userId: z.string(),
    newPhoneNumber: z.string().min(9).max(15),
  }).parse(ctx.input)

  // Check if phone number is already registered (excluding current user)
  const exists = await phoneNumberExists(input.newPhoneNumber, input.userId)
  if (exists) {
    throw new Error('Phone number already registered')
  }

  // Generate and send OTP
  const otpResult = await createOTP({
    phoneNumber: input.newPhoneNumber,
    type: 'phone_update',
  })

  return {
    success: true,
    message: 'OTP sent to new phone number',
    // Only return in development
    ...(process.env.NODE_ENV === 'development' && { otp: otpResult.otp }),
  }
})

/**
 * Verify OTP and update phone number
 */
const verifyAndUpdatePhone = os.handler(async (ctx) => {
  const input = z.object({
    userId: z.string(),
    newPhoneNumber: z.string().min(9).max(15),
    otp: z.string().length(6),
  }).parse(ctx.input)

  // Verify OTP
  const isValid = await verifyOTP({
    phoneNumber: input.newPhoneNumber,
    otp: input.otp,
    type: 'phone_update',
  })

  if (!isValid) {
    return {
      success: false,
      message: 'Invalid or expired OTP',
    }
  }

  // Get existing user
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, input.userId))
    .limit(1)

  if (!existingUser) {
    return {
      success: false,
      message: 'User not found',
    }
  }

  // Update phone number in user table
  await db
    .update(user)
    .set({
      phoneNumber: input.newPhoneNumber,
      phoneNumberVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(user.id, input.userId))

  // Delete the OTP after successful verification
  await deleteOTP({
    phoneNumber: input.newPhoneNumber,
    type: 'phone_update',
  })

  return {
    success: true,
    message: 'Phone number updated successfully',
  }
})

/**
 * Update user profile (name, image)
 */
const updateProfile = os.handler(async (ctx) => {
  const input = z.object({
    userId: z.string(),
    name: z.string().min(2).max(100).optional(),
    profilePhotoId: z.string().optional(),
  }).parse(ctx.input)

  // Get existing user
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, input.userId))
    .limit(1)

  if (!existingUser) {
    throw new Error('User not found')
  }

  // Build update object
  const updateData: Partial<typeof user.$inferInsert> = {
    updatedAt: new Date(),
  }

  if (input.name) {
    updateData.name = input.name
  }

  if (input.profilePhotoId) {
    // Check if user already has a profile photo (excluding the new one)
    const existingFile = await getFileByUserAndType({
      userId: input.userId,
      documentType: 'profile_photo',
    })

    // If old photo exists AND it's different from the new one, delete it
    if (existingFile && existingFile.id !== input.profilePhotoId) {
      try {
        await deleteFileById({ fileId: existingFile.id })
      } catch (error) {
        console.error('[updateProfile] Failed to delete old photo:', error)
      }
    }

    // Get the updated file info if profile photo was uploaded
    const [fileRecord] = await db
      .select()
      .from(uploadedFile)
      .where(eq(uploadedFile.id, input.profilePhotoId))
      .limit(1)

    if (fileRecord) {
      // Store path that includes the document type folder
      updateData.image = `/uploads/${fileRecord.path}`
    }
  }

  // Update user
  await db
    .update(user)
    .set(updateData)
    .where(eq(user.id, input.userId))

  // Get updated user
  const [updatedUser] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      image: user.image,
    })
    .from(user)
    .where(eq(user.id, input.userId))
    .limit(1)

  // Get profile photo info to return
  let profilePhoto = null
  if (input.profilePhotoId) {
    const [fileRecord] = await db
      .select({
        id: uploadedFile.id,
        filename: uploadedFile.fileName,
        originalFilename: uploadedFile.filename,
        mimeType: uploadedFile.mimeType,
        size: uploadedFile.size,
      })
      .from(uploadedFile)
      .where(eq(uploadedFile.id, input.profilePhotoId))
      .limit(1)
    if (fileRecord) {
      profilePhoto = fileRecord
    }
  }

  return {
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser,
    profilePhoto,
  }
})

/**
 * Change password
 */
const changePassword = os.handler(async (ctx) => {
  const input = z.object({
    userId: z.string(),
    currentPassword: z.string(),
    newPassword: z.string().min(6),
  }).parse(ctx.input)

  // Get user's account
  const [existingAccount] = await db
    .select()
    .from(account)
    .where(eq(account.userId, input.userId))
    .limit(1)

  if (!existingAccount) {
    throw new Error('Account not found')
  }

  if (!existingAccount.password) {
    throw new Error('No password set for this account')
  }

  // Verify current password
  const isValidPassword = await verifyPassword(input.currentPassword, existingAccount.password)

  if (!isValidPassword) {
    throw new Error('Current password is incorrect')
  }

  // Hash new password
  const newPasswordHash = await hashPassword(input.newPassword)

  // Update password
  await db
    .update(account)
    .set({
      password: newPasswordHash,
      updatedAt: new Date(),
    })
    .where(eq(account.id, existingAccount.id))

  return {
    success: true,
    message: 'Password changed successfully',
  }
})

/**
 * Get current user profile
 */
const getProfile = os.handler(async (ctx) => {
  const input = z.object({
    userId: z.string(),
  }).parse(ctx.input)

  const [existingUser] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      image: user.image,
      role: user.role,
      accountStatus: user.accountStatus,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, input.userId))
    .limit(1)

  if (!existingUser) {
    throw new Error('User not found')
  }

  // Get user's account for password check
  const [existingAccount] = await db
    .select({ password: account.password })
    .from(account)
    .where(eq(account.userId, input.userId))
    .limit(1)

  // Get profile photo file info
  const profilePhotoFile = await getFileByUserAndType({
    userId: input.userId,
    documentType: 'profile_photo',
  })

  // Check if driver has assigned orders (for drivers only)
  let hasAssignedOrder = false
  if (existingUser.role === 'driver') {
    const assignedOrders = await db
      .select({ id: order.id })
      .from(order)
      .where(
        and(
          eq(order.driverId, input.userId),
          or(
            eq(order.status, orderStatus.ASSIGNED),
            eq(order.status, orderStatus.ON_THE_WAY),
            eq(order.status, orderStatus.DELIVERED)
          )
        )
      )
      .limit(1)
    
    hasAssignedOrder = assignedOrders.length > 0
  }

  return {
    success: true,
    user: {
      ...existingUser,
      // Mask phone for display
      maskedPhoneNumber: existingUser.phoneNumber ?
        `***${existingUser.phoneNumber.slice(-3)}` : null,
      // Include file info if available (return filename for URL construction)
      profilePhoto: profilePhotoFile ? {
        id: profilePhotoFile.id,
        filename: profilePhotoFile.fileName,
        originalFilename: profilePhotoFile.filename,
        mimeType: profilePhotoFile.mimeType,
        size: profilePhotoFile.size,
      } : null,
      // Include hasAssignedOrder for drivers
      hasAssignedOrder,
    },
    hasPassword: !!existingAccount?.password,
  }
})

/**
 * Check if phone number exists for another user
 */
const checkPhoneExists = os.handler(async (ctx) => {
  const input = z.object({
    phoneNumber: z.string().min(9).max(15),
  }).parse(ctx.input)

  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.phoneNumber, input.phoneNumber))
    .limit(1)

  return {
    exists: !!existingUser,
  }
})

/**
 * Get rejection status for current user
 */
const getRejectionStatus = os.handler(async (ctx) => {
  const input = z.object({
    userId: z.string(),
  }).parse(ctx.input)

  const userData = await db.select({
    rejectionReason: user.rejectionReason,
    rejectedDocument: user.rejectedDocument,
    rejectedAt: user.rejectedAt,
    accountStatus: user.accountStatus,
  })
    .from(user)
    .where(eq(user.id, input.userId))
    .limit(1);

  if (!userData.length) {
    return { success: true, hasRejection: false };
  }

  const data = userData[0];
  
  if (!data) {
    return { success: true, hasRejection: false };
  }
  
  // Check if flagged and has rejection details
  if (data.accountStatus === 'flagged' && data.rejectionReason && data.rejectedDocument) {
    return {
      success: true,
      hasRejection: true,
      rejectionReason: data.rejectionReason,
      rejectedDocument: data.rejectedDocument,
      rejectedAt: data.rejectedAt,
    };
  }

  return { success: true, hasRejection: false };
})

/**
 * Clear rejection after re-upload
 */
const clearRejection = os.handler(async (ctx) => {
  const input = z.object({
    userId: z.string(),
  }).parse(ctx.input)

  await db.update(user)
    .set({
      accountStatus: 'pending',
      rejectionReason: null,
      rejectedDocument: null,
      rejectedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, input.userId));

  return { success: true, message: 'Rejection cleared, pending review' };
})

export const profile = {
  getProfile,
  updateProfile,
  sendPhoneUpdateOTP,
  verifyAndUpdatePhone,
  changePassword,
  checkPhoneExists,
  getRejectionStatus,
  clearRejection,
}
