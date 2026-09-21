import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config/env_config.js';
const LOG_LEVELS = {
    silent: 0,
    error: 10,
    warn: 20,
    info: 30,
    debug: 40,
    trace: 50,
};
const currentLevel = config.logLevel;
const currentLevelValue = LOG_LEVELS[currentLevel] ?? LOG_LEVELS.info;
const LOGS_DIR = path.resolve(process.cwd(), 'logs');
function ensureLogsDirExists() {
    try {
        fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
    catch { }
}
function getDateStamp(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}
let currentDateStamp = getDateStamp(new Date());
let currentStream = null;
function getLogFilePath(dateStamp) {
    return path.join(LOGS_DIR, `app-${dateStamp}.log`);
}
function openStream(dateStamp) {
    ensureLogsDirExists();
    const filePath = getLogFilePath(dateStamp);
    return fs.createWriteStream(filePath, { flags: 'a' });
}
function writeJsonLine(payload) {
    const now = new Date();
    const dateStamp = getDateStamp(now);
    if (!currentStream || dateStamp !== currentDateStamp) {
        currentStream?.end();
        currentDateStamp = dateStamp;
        currentStream = openStream(dateStamp);
    }
    try {
        currentStream.write(JSON.stringify(payload) + '\n');
    }
    catch {
        // ignore write errors to avoid crashing app. This should not happen.
    }
}
function formatNow() {
    return new Date().toISOString();
}
function shouldLog(level) {
    return LOG_LEVELS[level] <= currentLevelValue && currentLevelValue > 0;
}
function baseLog(level, message, meta) {
    const payload = {
        time: formatNow(),
        level,
        version: config.version,
        env: config.nodeEnv,
        message,
        ...(meta ? { meta } : {}),
    };
    if (config.nodeEnv === 'development') {
        console.log(`[${payload.time}] ${level.toUpperCase()}:`, message, meta ?? '');
    }
    else {
        console.log(JSON.stringify(payload));
    }
    writeJsonLine(payload);
}
export const logger = {
    error(message, meta) {
        if (shouldLog('error'))
            baseLog('error', message, meta);
    },
    warn(message, meta) {
        if (shouldLog('warn'))
            baseLog('warn', message, meta);
    },
    info(message, meta) {
        if (shouldLog('info'))
            baseLog('info', message, meta);
    },
    debug(message, meta) {
        if (shouldLog('debug'))
            baseLog('debug', message, meta);
    },
    trace(message, meta) {
        if (shouldLog('trace'))
            baseLog('trace', message, meta);
    },
};
//# sourceMappingURL=logger.js.map