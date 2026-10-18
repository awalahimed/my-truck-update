import { db } from '../db.js';
import { user } from '../schema/auth-schema.js';
import { agentProfile } from '../schema/agent-schema.js';
import { vehicle } from '../schema/vehicle-schema.js';
import { wallet } from '../schema/wallet-schema.js';
import { townManager, managerAssignedCities } from '../schema/manager-schema.js';
import { cities } from '../schema/master-data-schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '../../utils/logger.js';
import { auth } from '../../utils/auth.js';

export const testAccounts = [
  {
    email: 'admin@test.com',
    password: 'Password@123',
    name: 'Super Admin',
    role: 'admin',
    phoneNumber: '+251911111111',
  },
  {
    email: 'callcenter@test.com',
    password: 'Password@123',
    name: 'Call Center Agent',
    role: 'call_center',
    phoneNumber: '+251911223344',
  },
  {
    email: 'townmanager@test.com',
    password: 'Password@123',
    name: 'Addis Town Manager',
    role: 'town_manager',
    phoneNumber: '+251911556677',
  },
  {
    email: 'agent@test.com',
    password: 'Password@123',
    name: 'Field Verification Agent',
    role: 'agent',
    phoneNumber: '+251922222222',
  },
  {
    email: 'shipper@test.com',
    password: 'Password@123',
    name: 'Test Shipper',
    role: 'user',
    phoneNumber: '+251944444444',
  },
  {
    email: 'driver@test.com',
    password: 'Password@123',
    name: 'Test Driver',
    role: 'driver',
    phoneNumber: '+251933333333',
  }
];

export async function seedTestAccounts() {
  try {
    for (const userData of testAccounts) {
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, userData.email))
        .limit(1);

      let userId = existingUser[0]?.id;

      if (!userId) {
        // Create user through better-auth
        try {
          const result = await (auth.api as any).createUser({
            body: {
              email: userData.email,
              password: userData.password,
              name: userData.name,
              role: userData.role,
              emailVerified: true,
            }
          });
          userId = result?.user?.id;
        } catch (authErr) {
          logger.warn(`Auth createUser error for ${userData.email}:`, authErr);
        }
      }

      if (!userId) {
        // Fallback direct DB insert if auth API skipped
        userId = `usr_test_${userData.role}_${Date.now()}`;
        await db.insert(user).values({
          id: userId,
          email: userData.email,
          name: userData.name,
          role: userData.role as any,
          emailVerified: true,
          accountStatus: 'active',
          phoneNumber: userData.phoneNumber,
          phoneNumberVerified: true,
        });
      } else {
        // Update user with phone number and set active status
        await db.update(user)
          .set({
            role: userData.role as any,
            phoneNumber: userData.phoneNumber,
            phoneNumberVerified: true,
            accountStatus: 'active',
          })
          .where(eq(user.id, userId));
      }

      logger.info(`✅ ${userData.role} (${userData.email}) seeded/updated successfully`);

      // Initialize Wallet with working balance
      const existingWallet = await db.select().from(wallet).where(eq(wallet.userId, userId)).limit(1);
      if (existingWallet.length === 0) {
        await db.insert(wallet).values({
          id: `wal_${userId}`,
          userId: userId,
          balance: '50000.00', // 50,000 ETB for testing escrow & topups
          reservedBalance: '0.00',
          isActive: true,
        });
      }

      // Add role-specific relations
      if (userData.role === 'agent') {
        const existingAgent = await db.select().from(agentProfile).where(eq(agentProfile.userId, userId));
        if (existingAgent.length === 0) {
          await db.insert(agentProfile).values({
            id: `agent_${Date.now()}`,
            userId: userId,
            agentType: 'verification_agent',
          });
        }
      }

      if (userData.role === 'driver') {
        const existingVehicle = await db.select().from(vehicle).where(eq(vehicle.driverId, userId));
        if (existingVehicle.length === 0) {
          await db.insert(vehicle).values({
            id: `vehicle_${Date.now()}`,
            driverId: userId,
            type: 'truck',
            plateNumber: '3-ET-12345',
            capacity: '40 Tons',
            isActive: true,
          });
        }
      }

      if (userData.role === 'town_manager') {
        let managerRecord = await db.select().from(townManager).where(eq(townManager.userId, userId)).limit(1);
        let mgrId = managerRecord[0]?.id;
        if (!mgrId) {
          mgrId = `mgr_${Date.now()}`;
          await db.insert(townManager).values({
            id: mgrId,
            userId: userId,
            townName: 'Addis Ababa',
            cityName: 'Addis Ababa',
            region: 'Addis Ababa',
            status: 'active',
            approvalStatus: 'approved',
          });
        }

        // Assign default operational cities
        const defaultCities = await db.select().from(cities).limit(3);
        for (const city of defaultCities) {
          const assigned = await db
            .select()
            .from(managerAssignedCities)
            .where(eq(managerAssignedCities.cityId, city.id))
            .limit(1);
          if (assigned.length === 0) {
            const uuidShort = crypto.randomUUID();
            await db.insert(managerAssignedCities).values({
              id: uuidShort,
              managerId: mgrId,
              cityId: city.id,
            });
          }
        }
      }
    }
  } catch (error) {
    logger.error('Failed to seed test accounts:', error);
  }
}
