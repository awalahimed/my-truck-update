import { seedTestAccounts } from './src/database/seeds/test-accounts-seed.js';
seedTestAccounts().then(() => process.exit(0));
