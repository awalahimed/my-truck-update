import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../database/db.js";
import { haveIBeenPwned, phoneNumber } from "better-auth/plugins";
import { betterauthConfig } from "../config/betterauth_config.js";
import { admin } from "better-auth/plugins";
import * as schema from "../database/schema/auth-schema.js";
import { userRoles } from "../database/schema/auth-schema.js";
const plugins = [
    haveIBeenPwned(),
    admin(),
    phoneNumber({
        async sendOTP({ phoneNumber: toPhoneNumber, code }, request) {
            // this is not needed only for admin login if needed  we will ingrate the sms sending 
            console.log(`[OTP] to ${toPhoneNumber}: ${code}`);
        },
        signUpOnVerification: {
            getTempEmail: (phoneNumber) => `${phoneNumber}@my-site.com`,
            getTempName: (phoneNumber) => phoneNumber,
        },
    })
];
export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: 'mysql', schema }),
    baseURL: betterauthConfig.baseURL,
    trustedOrigins: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://enchanting-kelpie-143c03.netlify.app",
        "https://my-track-1.onrender.com",
        "https://my-track-1.onrender.com/" //rmov this on the production stage  and use the production stage domain 
    ],
    advanced: {
        crossSubDomainCookies: {
            enabled: false,
        },
        useSecureCookies: process.env.NODE_ENV === 'production',
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: userRoles.UNKNOWN,
                input: false,
            },
            phoneNumber: {
                type: "string",
                required: true,
                input: true,
            },
            phoneNumberVerified: {
                type: "boolean",
                required: false,
                defaultValue: false,
                input: false,
            },
            accountStatus: {
                type: "string",
                required: false,
                defaultValue: "pending",
                input: false,
            },
        },
    },
    plugins: [
        ...plugins,
    ],
    socialProviders: {
    // google: {
    //   clientId: betterauthConfig.google.clientId,
    //   clientSecret: betterauthConfig.google.clientSecret,
    // },
    },
});
//# sourceMappingURL=auth.js.map