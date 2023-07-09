import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';
import { config } from 'dotenv';

config();

export const env = createEnv({
  server: {
    CART_AWS_REGION: z.string().min(1),
    DB_USERNAME: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),
    DB_HOST: z.string().min(1),
    DB_PORT: z
      .string()
      .transform((s) => parseInt(s, 10))
      .pipe(z.number()),
  },
  runtimeEnv: process.env,
});
