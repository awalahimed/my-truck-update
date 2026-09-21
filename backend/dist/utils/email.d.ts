interface EmailResult {
    success: boolean;
    message: string;
    info?: any;
}
export declare function sendEmail(to: string, subject: string, text: string, html?: string): Promise<EmailResult>;
declare const _default: {
    sendEmail: typeof sendEmail;
};
export default _default;
//# sourceMappingURL=email.d.ts.map