// import nodemailer from 'nodemailer';
import { config } from '../config/env_config.js';
import { logger } from './logger.js';
let transporter = null;
function ensureTransporter() {
    if (transporter)
        return transporter;
    if (!config.smtp.host || !config.smtp.user) {
        return null;
    }
    // nodemailer.createTransport not available - stub implementation
    logger.warn('Email service not configured - nodemailer not installed');
    return null;
}
export async function sendEmail(to, subject, text, html) {
    try {
        // Skip if not configured in development
        if (config.nodeEnv === 'development' && !config.smtp.host) {
            logger.info(`[Email] Development mode - email not sent to ${to}: ${subject}`);
            return { success: true, message: 'Email skipped in development' };
        }
        const t = ensureTransporter();
        if (!t) {
            logger.error('[Email] SMTP not configured');
            return { success: false, message: 'SMTP not configured' };
        }
        const mailOptions = {
            from: config.smtp.from,
            to,
            subject,
            text,
            html,
        };
        const info = await t.sendMail(mailOptions);
        logger.info('[Email] Sent email', { to, subject, messageId: info?.messageId });
        return { success: true, message: 'Email sent', info };
    }
    catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
}
export default { sendEmail };
//# sourceMappingURL=email.js.map