import { os } from '@orpc/server'
import { config } from '../config/env_config.js'

export const handshake = os.handler(async () => {
    return {
      service: 'backend',
      version: config.version,
      env: config.nodeEnv,
      auth: {
        login : config.loginEnabled,
        register: config.registerEnabled,
        forgotPassword: config.forgotPasswordEnabled,
        otp: config.otpEnabled,
      },
    }
  })