import fs from 'node:fs'
import path from 'node:path'
import { config } from '../config/env_config.js'

type LogLevelName = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace'

const LOG_LEVELS: Record<LogLevelName, number> = {
  silent: 0,
  error: 10,
  warn: 20,
  info: 30,
  debug: 40,
  trace: 50,
}

const currentLevel = config.logLevel as LogLevelName
const currentLevelValue = LOG_LEVELS[currentLevel] ?? LOG_LEVELS.info

const LOGS_DIR = path.resolve(process.cwd(), 'logs')

function ensureLogsDirExists(): void {
  try {
    fs.mkdirSync(LOGS_DIR, { recursive: true })
  } catch {}
}

function getDateStamp(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

let currentDateStamp = getDateStamp(new Date())
let currentStream: fs.WriteStream | null = null

function getLogFilePath(dateStamp: string): string {
  return path.join(LOGS_DIR, `app-${dateStamp}.log`)
}

function openStream(dateStamp: string): fs.WriteStream {
  ensureLogsDirExists()
  const filePath = getLogFilePath(dateStamp)
  return fs.createWriteStream(filePath, { flags: 'a' })
}

function writeJsonLine(payload: Record<string, unknown>): void {
  const now = new Date()
  const dateStamp = getDateStamp(now)
  if (!currentStream || dateStamp !== currentDateStamp) {
    currentStream?.end()
    currentDateStamp = dateStamp
    currentStream = openStream(dateStamp)
  }
  try {
    currentStream!.write(JSON.stringify(payload) + '\n')
  } catch {
    // ignore write errors to avoid crashing app. This should not happen.
  }
}

function formatNow(): string {
  return new Date().toISOString()
}

function shouldLog(level: LogLevelName): boolean {
  return LOG_LEVELS[level] <= currentLevelValue && currentLevelValue > 0
}

function baseLog(level: LogLevelName, message: unknown, meta?: Record<string, unknown>) {
  const payload = {
    time: formatNow(),
    level,
    version: config.version,
    env: config.nodeEnv,
    message,
    ...(meta ? { meta } : {}),
  }

  if (config.nodeEnv === 'development') {
    console.log(`[${payload.time}] ${level.toUpperCase()}:`, message, meta ?? '')
  } else {
    console.log(JSON.stringify(payload))
  }

  writeJsonLine(payload)
}

export const logger = {
  error(message: unknown, meta?: Record<string, unknown>) {
    if (shouldLog('error')) baseLog('error', message, meta)
  },
  warn(message: unknown, meta?: Record<string, unknown>) {
    if (shouldLog('warn')) baseLog('warn', message, meta)
  },
  info(message: unknown, meta?: Record<string, unknown>) {
    if (shouldLog('info')) baseLog('info', message, meta)
  },
  debug(message: unknown, meta?: Record<string, unknown>) {
    if (shouldLog('debug')) baseLog('debug', message, meta)
  },
  trace(message: unknown, meta?: Record<string, unknown>) {
    if (shouldLog('trace')) baseLog('trace', message, meta)
  },
} as const

export type Logger = typeof logger


