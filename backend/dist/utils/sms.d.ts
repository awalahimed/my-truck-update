interface EthioSMSResponse {
    success: boolean;
    message: string;
    data?: any;
    messageId?: string;
    segments?: number;
    status?: string;
}
export declare function sendSMS(phoneNumber: string, message: string): Promise<EthioSMSResponse>;
export declare function sendOTPSMS(phoneNumber: string, otp: string): Promise<EthioSMSResponse>;
export declare function sendWelcomeSMS(phoneNumber: string, name: string): Promise<EthioSMSResponse>;
export declare function sendPasswordResetOTPSMS(phoneNumber: string, otp: string): Promise<EthioSMSResponse>;
export {};
//# sourceMappingURL=sms.d.ts.map