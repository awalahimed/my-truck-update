import { handshake } from '../utils/handshake.js';
import { upload } from '../controllers/upload.js';
import { onboarding } from '../controllers/onboarding.js';
import { profile } from '../controllers/profile.js';
import { authRouter } from '../controllers/app-auth/index.js';
import { payment } from '../controllers/payment/index.js';
import { walletController } from '../controllers/wallet/index.js';
import { paymentMethodController } from '../controllers/payment-method/index.js';
import { notifications } from '../controllers/notifications.js';
import { orderController } from '../controllers/order.js';
import { adminController } from '../controllers/admin.js';
import { agentController } from '../controllers/agent.js';
import { announcementController } from '../controllers/announcement.js';
import { referralController } from '../controllers/referral.js';
import { healthController } from '../controllers/health.js';
import { driverDocuments } from '../controllers/driver-documents.js';
import { managerRouter } from '../controllers/manager.js';
console.log('[Router] Admin controller loaded:', !!adminController);
console.log('[Router] Admin controller keys:', Object.keys(adminController || {}));
console.log('[Router] Agent controller loaded:', !!agentController);
// Main application router
export const router = {
    handshake,
    upload,
    onboarding,
    profile,
    authApp: authRouter,
    payment,
    wallet: walletController,
    paymentMethod: paymentMethodController,
    notifications,
    order: orderController,
    admin: adminController,
    agent: agentController,
    announcement: announcementController,
    referral: referralController,
    health: healthController,
    driverDocuments,
    manager: managerRouter,
};
console.log('[Router] Full router keys:', Object.keys(router));
//# sourceMappingURL=_app.js.map