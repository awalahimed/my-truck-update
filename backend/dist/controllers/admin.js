import { os } from '@orpc/server';
import { adminReferralController } from './admin/referral.js';
import { adminDashboardController } from './admin/dashboard.js';
import { adminWalletController } from './admin/wallet.js';
import { adminAgentController } from './admin/agent.js';
import { adminDriverController } from './admin/driver.js';
import { adminUserController } from './admin/user.js';
import { adminOrderController } from './admin/order.js';
import { adminGiveawayController } from './admin/giveaway.js';
import { adminTownManagerController } from './admin/town-manager.js';
console.log('[Admin Controller] Loading admin controller...');
export const adminController = os.router({
    // Dashboard statistics
    dashboard: adminDashboardController,
    // Platform wallet management
    wallet: adminWalletController,
    // Referral management
    referral: adminReferralController,
    // Agent management
    agents: adminAgentController,
    // Driver management
    driver: adminDriverController,
    // User management
    user: adminUserController,
    // Shipment/Order management
    order: adminOrderController,
    // Giveaway / Bonus management
    giveaway: adminGiveawayController,
    // Town Manager report
    townManager: adminTownManagerController,
});
console.log('[Admin Controller] Admin controller created successfully');
//# sourceMappingURL=admin.js.map