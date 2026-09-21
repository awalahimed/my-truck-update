import 'dotenv/config';
export type OtpConfig = {
    enabled: boolean;
};
export declare const otpConfig: OtpConfig;
export declare const betterauthConfig: {
    otp: OtpConfig;
    baseURL: string;
    rateLimit: {
        window: number;
        max: number;
    };
    google: {
        clientId: string;
        clientSecret: string;
    };
};
export type BetterAuthConfig = typeof betterauthConfig;
//# sourceMappingURL=betterauth_config.d.ts.map