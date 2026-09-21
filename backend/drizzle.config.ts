import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

declare const process: {
  env: {
    MYSQL_HOST?: string;
    MYSQL_PORT?: string;
    MYSQL_USER?: string;
    MYSQL_PASSWORD?: string;
    MYSQL_DATABASE?: string;
    MYSQL_CONNECTION_LIMIT?: string;
  };
};

export default defineConfig({
  schema: './src/database/schema/',
  out: './src/database/migrations',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.MYSQL_HOST ?? 'localhost',
    port: parseInt(process.env.MYSQL_PORT ?? '3306'),
    user: process.env.MYSQL_USER ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE ?? 'app',
  },
  verbose: true,
  strict: true,
});
