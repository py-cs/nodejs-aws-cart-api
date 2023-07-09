import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as postgres from 'postgres';
import { env } from './src/env';
import * as schema from './src/drizzle/schema';

const sql = postgres({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  max: 1,
});
export const db = drizzle(sql, { schema });

migrate(db, { migrationsFolder: './drizzle' });
