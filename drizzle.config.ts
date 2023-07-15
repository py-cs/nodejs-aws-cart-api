import type { Config } from 'drizzle-kit';
import { env } from './src/env';

export default {
  schema: './src/drizzle/schema.ts',
  driver: 'pg',
  dbCredentials: {
    database: env.DB_NAME,
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
  },
  out: './drizzle',
} satisfies Config;
