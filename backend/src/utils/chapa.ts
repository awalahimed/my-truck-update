import { config } from '../config/env_config.js';
import { logger } from './logger.js';

export interface ChapaInitializeOptions {
  amount: string;
  currency: string;
  email?: string;
  first_name: string;
  last_name: string;
  tx_ref: string;
  callback_url?: string;
  return_url?: string;
  customization?: {
    title?: string;
    description?: string;
    logo?: string;
  };
}

export interface ChapaInitializeResponse {
  message: string;
  status: string;
  data: {
    checkout_url: string;
  };
}

export interface ChapaVerifyResponse {
  message: string;
  status: string;
  data: {
    first_name: string;
    last_name: string;
    email: string;
    currency: string;
    amount: string;
    charge: string;
    mode: string;
    method: string;
    type: string;
    status: string;
    reference: string;
    tx_ref: string;
    customization: Record<string, unknown>;
    meta: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
  };
}

export class Chapa {
  private secretKey: string;
  private baseUrl: string;

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

  async initialize(options: ChapaInitializeOptions): Promise<ChapaInitializeResponse> {
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

      const data = await response.json() as any;

      if (!response.ok) {
        logger.error('Chapa initialization failed', { data, options, status: response.status });
        throw new Error(data.message || `Payment initialization failed: ${response.status}`);
      }

      return data;
    } catch (error) {
      logger.error('Chapa initialize error', { error });
      throw error;
    }
  }

  async verify(txRef: string): Promise<ChapaVerifyResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${txRef}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      const data = await response.json() as any;

      if (!response.ok) {
        logger.error('Chapa verification failed', { data, txRef });
        throw new Error(data.message || 'Payment verification failed');
      }

      return data;
    } catch (error) {
      logger.error('Chapa verify error', { error });
      throw error;
    }
  }
}

export const chapa = new Chapa();
