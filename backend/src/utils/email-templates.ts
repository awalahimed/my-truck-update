export interface TemplateVars {
  managerName?: string
  townName?: string
  cityName?: string
  issuesCount?: number
  issues?: any[]
  amount?: string | number
  orderId?: string
}

export function renderTemplate(name: string, vars: TemplateVars) {
  switch (name) {
    case 'fraud_critical': {
      const subject = `CRITICAL: Fraud issues detected in ${vars.townName || 'your area'}`
      const html = `
        <html>
        <body>
          <h2 style="color:#b91c1c">CRITICAL Fraud Alert</h2>
          <p>Dear ${vars.managerName || 'Manager'},</p>
          <p>An automated fraud scan detected <strong>${vars.issuesCount || 0}</strong> high-severity issue(s) in <strong>${vars.townName || ''} / ${vars.cityName || ''}</strong>.</p>
          <p>Please <a href="https://app.mytrack.example.com/manager">review the Manager Dashboard</a> immediately to investigate the issues.</p>
          <hr/>
          <p style="font-size:12px;color:#666">This is an automated alert from MyTruck.</p>
        </body>
        </html>
      `
      const text = `CRITICAL Fraud Alert\n\nAn automated fraud scan detected ${vars.issuesCount || 0} high-severity issue(s) in ${vars.townName || ''} / ${vars.cityName || ''}.\n\nPlease review the Manager Dashboard: https://app.mytruck.example.com/manager\n\nThis is an automated alert from MyTruck.`
      return { subject, html, text }
    }

    case 'commission_earned': {
      const subject = `You earned a new commission: ${vars.amount}`
      const html = `<p>Hi ${vars.managerName || 'there'},</p><p>You have a new commission of <strong>${vars.amount}</strong>.</p>`
      const text = `You have a new commission of ${vars.amount}`
      return { subject, html, text }
    }

    default: {
      const subject = vars.orderId ? `Notification: ${vars.orderId}` : 'MyTruck Notification'
      const html = `<p>Hello,</p><p>${subject}</p>`
      const text = `${subject}`
      return { subject, html, text }
    }
  }
}

export default renderTemplate
