import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../constants';
import * as schema from './schema';
import { env } from 'src/env';

@Module({
  providers: [
    {
      provide: PG_CONNECTION,
      useFactory: async () => {
        const pool = new Pool({
          host: env.DB_HOST,
          port: env.DB_PORT,
          user: env.DB_USERNAME,
          password: env.DB_PASSWORD,
          database: env.DB_NAME,
          ssl: {},
        });

        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [PG_CONNECTION],
})
export class DrizzleModule {}
