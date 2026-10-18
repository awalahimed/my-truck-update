import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { config } from '../config/env_config.js'
import * as authSchema from '../database/schema/auth-schema.js'
import * as agentSchema from '../database/schema/agent-schema.js'
import * as announcementSchema from '../database/schema/announcement-schema.js'
import * as fileSchema from '../database/schema/file-schema.js'
import * as paymentSchema from '../database/schema/payment-schema.js'
import * as walletSchema from '../database/schema/wallet-schema.js'
import * as paymentMethodSchema from '../database/schema/payment-method-schema.js'
import * as notificationSchema from '../database/schema/notification-schema.js'
import * as vehicleSchema from '../database/schema/vehicle-schema.js'
import * as orderSchema from '../database/schema/order-schema.js'
import * as driverDocumentSchema from '../database/schema/driver-document-schema.js'
import * as driverOfferSchema from '../database/schema/driver-offer-schema.js'
import * as commissionSchema from '../database/schema/commission-schema.js'
import * as referralSchema from '../database/schema/referral-schema.js'
import * as masterDataSchema from '../database/schema/master-data-schema.js'

export const schema = {
  ...authSchema,
  ...agentSchema,
  ...announcementSchema,
  ...fileSchema,
  ...paymentSchema,
  ...walletSchema,
  ...paymentMethodSchema,
  ...notificationSchema,
  ...vehicleSchema,
  ...orderSchema,
  ...driverDocumentSchema,
  ...driverOfferSchema,
  ...commissionSchema,
  ...referralSchema,
  ...masterDataSchema,
}

export const pool = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  connectionLimit: config.mysql.connectionLimit,
  waitForConnections: true,
})

export const db = drizzle(pool, { schema, mode: 'default' })


