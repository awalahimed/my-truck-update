import { config } from '../config/env_config.js';
import { logger } from './logger.js';
export async function sendSMS(phoneNumber, message) {
    try {
        if (config.nodeEnv === 'development' && !config.ethiosms.apiKey) {
            logger.info(`[SMS] Development mode - SMS not sent to ${phoneNumber}: ${message}`);
            return { success: true, message: 'SMS skipped in development mode' };
        }
        if (!config.ethiosms.apiKey) {
            logger.error('[SMS] Ethio SMS not configured - missing API key');
            return { success: false, message: 'SMS service not configured' };
        }
        const formattedPhone = phoneNumber.replace(/[\s+]/g, '');
        const normalizedPhone = formattedPhone.startsWith('251')
            ? formattedPhone
            : `251${formattedPhone.replace(/^0+/, '')}`;
        logger.info(`[SMS] Sending SMS to ${normalizedPhone}`);
        const response = await fetch(config.ethiosms.baseUrl, {
            method: 'POST',
            headers: {
                'KEY': config.ethiosms.apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                msisdn: normalizedPhone,
                text: message,
            }),
        });
        const responseText = await response.text();
        logger.info(`[SMS] Response status: ${response.status}`);
        logger.info(`[SMS] Response body: ${responseText}`);
        let data;
        try {
            data = JSON.parse(responseText);
        }
        catch {
            data = { response: responseText };
        }
        if (!response.ok) {
            logger.error('[SMS] Ethio SMS API error:', { status: response.status, data });
            return {
                success: false,
                message: data.message || responseText || 'Failed to send SMS',
                data,
                messageId: data.id,
                status: data.status,
            };
        }
        logger.info('[SMS] SMS sent successfully:', { phone: formattedPhone, messageId: data.id, segments: data.segments, status: data.status, response: data });
        return {
            success: true,
            message: 'SMS sent successfully',
            data,
            messageId: data.id,
            segments: data.segments,
            status: data.status,
        };
    }
    catch (error) {
        logger.error('[SMS] Error sending SMS:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
export async function sendOTPSMS(phoneNumber, otp) {
    const message = `Your MyTruck verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
    return sendSMS(phoneNumber, message);
}
export async function sendWelcomeSMS(phoneNumber, name) {
    const message = `Welcome to MyTruck, ${name}! Your account has been created successfully. Start ordering deliveries now.`;
    return sendSMS(phoneNumber, message);
}
export async function sendPasswordResetOTPSMS(phoneNumber, otp) {
    const message = `Your MyTruck password reset code is: ${otp}. Valid for 10 minutes. If you didn't request this, please ignore.`;
    return sendSMS(phoneNumber, message);
}
//# sourceMappingURL=sms.js.map