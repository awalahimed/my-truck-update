export interface TemplateVars {
    managerName?: string;
    townName?: string;
    cityName?: string;
    issuesCount?: number;
    issues?: any[];
    amount?: string | number;
    orderId?: string;
}
export declare function renderTemplate(name: string, vars: TemplateVars): {
    subject: string;
    html: string;
    text: string;
};
export default renderTemplate;
//# sourceMappingURL=email-templates.d.ts.map