import { db } from '../database/db.js'
import { townManager, managerFraudAlert } from '../database/schema/manager-schema.js'
import { eq, and } from 'drizzle-orm'
import { runFraudDetection } from '../services/manager.js'
import { createNotification, sendCriticalAlertToUser } from '../services/notification.js'
import { logger } from '../utils/logger.js'

export async function runDailyFraudScan() {
  try {
    logger.info('[Jobs] Starting daily fraud scan for all managers')

    // Find approved/active managers
    const managers = await db.select({ id: townManager.id, userId: townManager.userId, townName: townManager.townName, cityName: townManager.cityName }).from(townManager).where(
      and(eq(townManager.status, 'active'), eq(townManager.approvalStatus, 'approved'))
    )

    for (const m of managers) {
      try {
        logger.info('[Jobs] Running fraud detection for manager', { managerId: m.id })
        const results = await runFraudDetection(m.id)
        if (results && results.length > 0) {
          const title = '⚠️ Fraud Scan Results'
          const body = `Automated fraud scan found ${results.length} potential issues in ${m.townName} / ${m.cityName}`

          // Create in-app notification for manager user
          await createNotification(m.userId, {
            title,
            body,
            type: 'fraud_scan_results',
            data: { managerId: m.id, issues: results },
          })

          // Query for recent high-severity alerts for this manager (last 10 minutes)
          const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
          const recentHigh = await db.select().from(managerFraudAlert).where(
            and(eq(managerFraudAlert.managerId, m.id), eq(managerFraudAlert.status, 'open'), eq(managerFraudAlert.severity, 'high'))
          )

          if (recentHigh && recentHigh.length > 0) {
            // Send critical channel alerts (email/SMS)
            const criticalBody = `${body}. ${recentHigh.length} high-severity issues detected. Please review the Manager Dashboard.`
            await sendCriticalAlertToUser(m.userId, { title: 'CRITICAL: Fraud scan detected issues', body: criticalBody, type: 'fraud_critical' })
            logger.info('[Jobs] Sent critical alerts via email/SMS to manager', { managerId: m.id, userId: m.userId, count: recentHigh.length })
          }

          logger.info('[Jobs] Notified manager about fraud scan results', { managerId: m.id, issues: results.length })
        } else {
          logger.info('[Jobs] No issues found for manager', { managerId: m.id })
        }
      } catch (err) {
        logger.error('[Jobs] Error running fraud detection for manager', { managerId: m.id, error: err })
      }
    }

    logger.info('[Jobs] Daily fraud scan completed')
  } catch (error) {
    logger.error('[Jobs] Failed to run daily fraud scan:', { error })
    throw error
  }
}
