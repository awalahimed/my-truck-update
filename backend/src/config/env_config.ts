import 'dotenv/config'

const nodeEnv = process.env.NODE_ENV ?? 'development'
const version = process.env.VERSION ?? process.env.npm_package_version ?? '1.0.0'
const logLevel = (process.env.LOG_LEVEL ?? 'info') as 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace'

const defaultDevOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

const corsAllowedOriginsEnv = process.env.CORS_ALLOWED_ORIGINS ?? ''
export const allowedOrigins = (corsAllowedOriginsEnv
  ? corsAllowedOriginsEnv.split(',')
  : nodeEnv === 'development'
    ? defaultDevOrigins
    : []
)
  .map((o: string) => o.trim())
  .filter(Boolean)

export const corsOptions = {
  origin: (origin: string | undefined) => {
    if (!origin) {
      // Allow non-browser requests (e.g., health checks, curl) by default
      return '*'
    }
    if (nodeEnv === 'development') {
      return origin
    }
    return allowedOrigins.includes(origin) ? origin : null
  },
  allowMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'Content-Type'],
  credentials: true,
  maxAge: 600,
}

export const port = Number(process.env.PORT ?? 3000)

export const config = {
  nodeEnv,
  allowedOrigins,
  port,
  version,
  logLevel,
  mysql: {
    host: process.env.MYSQL_HOST ?? '127.0.0.1',
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE ?? 'app',
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10),
  },
  loginEnabled: (process.env.LOGIN_ENABLED),
  registerEnabled: (process.env.REGISTER_ENABLED),
  forgotPasswordEnabled: (process.env.FORGOT_PASSWORD_ENABLED),
  resetPasswordEnabled: (process.env.RESET_PASSWORD_ENABLED),
  otpEnabled: (process.env.OTP_ENABLED),
  upload: {
    dir: process.env.UPLOAD_DIR ?? './uploads',
    maxFileSize: Number(process.env.MAX_FILE_SIZE ?? 50) * 1024 * 1024, // Default 50MB
    chunkSize: Number(process.env.CHUNK_SIZE ?? 1024 * 1024), // Default 1MB chunks
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES ?? 'image/*,application/pdf,video/*,audio/*').split(','),
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'your-secret-key-change-this-in-production',
    expiry: process.env.JWT_EXPIRY ?? '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY ?? '7d',
    issuer: process.env.JWT_ISSUER ?? 'http://localhost:3000',
    audience: process.env.JWT_AUDIENCE ?? 'my-track-mobile',
  },
  chapa: {
    secretKey: process.env.CHAPA_SECRET_KEY ?? '',
    baseUrl: process.env.CHAPA_BASE_URL ?? 'https://api.chapa.co/v1',
  },
  ethiosms: {
    apiKey: process.env.ETHIOSMS_API_KEY ?? '',
    baseUrl: process.env.ETHIOSMS_BASE_URL ?? 'https://smsethiopia.com/api/sms/send',
  },
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: (process.env.SMTP_SECURE ?? 'false') === 'true',
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.SMTP_FROM ?? 'MyTruck <no-reply@mytruck.example.com>',
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000), // 1 minute
    max: Number(process.env.RATE_LIMIT_MAX ?? 100),
  },
  authRateLimit: {
    windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? 900000), // 15 minutes
    max: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 5),
  },
  env: nodeEnv,
}


