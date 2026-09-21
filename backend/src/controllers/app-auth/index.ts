import { sendLoginOTP } from './sendLoginOTP.js'
import { sendRegisterOTP } from './sendRegisterOTP.js'
import { verifyOTP } from './verifyOTP.js'
import { setPassword } from './setPassword.js'
import { verifyRegistrationOTP } from './verifyRegistrationOTP.js'
import { sendResetOTP } from './sendResetOTP.js'
import { resetPassword } from './resetPassword.js'
import { refreshTokens } from './refreshTokens.js'
import { getSession } from './getSession.js'
import { logout } from './logout.js'
import { softDeleteAccount } from './softdelete.js'

// Re-export all functions
export {
  sendLoginOTP,
  sendRegisterOTP,
  verifyOTP,
  setPassword,
  verifyRegistrationOTP,
  sendResetOTP,
  resetPassword,
  refreshTokens,
  getSession,
  logout,
  softDeleteAccount
}

// Re-export as authRouter for router configuration
export const authRouter = {
  sendLoginOTP,
  sendRegisterOTP,
  verifyOTP,
  setPassword,
  verifyRegistrationOTP,
  sendResetOTP,
  resetPassword,
  refreshTokens,
  getSession,
  logout,
  softDeleteAccount,
}
