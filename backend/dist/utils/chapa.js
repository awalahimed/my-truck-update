import { config } from '../config/env_config.js';
import { logger } from './logger.js';
export class Chapa {
    secretKey;
    baseUrl;
    constructor() {
        this.secretKey = config.chapa.secretKey;
        this.baseUrl = config.chapa.baseUrl;
        console.log('[Chapa] Initializing with:', {
            hasSecretKey: !!this.secretKey,
            secretKeyLength: this.secretKey?.length || 0,
            baseUrl: this.baseUrl,
        });
        if (!this.secretKey) {
            const errorMsg = 'Chapa secret key is not configured. Please set CHAPA_SECRET_KEY in your .env file';
            logger.error(errorMsg);
            if (config.nodeEnv === 'production') {
                throw new Error(errorMsg);
            }
        }
    }
    async initialize(options) {
        if (!this.secretKey) {
            throw new Error('Chapa secret key is not configured');
        }
        try {
            const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(options),
            });
            const data = await response.json();
            if (!response.ok) {
                logger.error('Chapa initialization failed', { data, options, status: response.status });
                throw new Error(data.message || `Payment initialization failed: ${response.status}`);
            }
            return data;
        }
        catch (error) {
            logger.error('Chapa initialize error', { error });
            throw error;
        }
    }
    async verify(txRef) {
        try {
            const response = await fetch(`${this.baseUrl}/transaction/verify/${txRef}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                },
            });
            const data = await response.json();
            if (!response.ok) {
                logger.error('Chapa verification failed', { data, txRef });
                throw new Error(data.message || 'Payment verification failed');
            }
            return data;
        }
        catch (error) {
            logger.error('Chapa verify error', { error });
            throw error;
        }
    }
}
export const chapa = new Chapa();
//# sourceMappingURL=chapa.js.map