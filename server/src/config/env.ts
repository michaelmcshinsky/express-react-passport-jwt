import { z } from 'zod';

const DEV_ACCESS_SECRET = 'dev-access-secret-change-me-in-production-32';
const DEV_REFRESH_SECRET = 'dev-refresh-secret-change-me-in-production-32';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(3001),
    MONGODB_URI: z.string().min(1).default('mongodb://localhost:27017/auth-demo'),
    JWT_ACCESS_SECRET: z.string().min(32).default(DEV_ACCESS_SECRET),
    JWT_REFRESH_SECRET: z.string().min(32).default(DEV_REFRESH_SECRET),
    ACCESS_TOKEN_TTL: z.string().default('15m'),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7),
    CORS_ORIGINS: z.string().default('http://localhost:5173'),
  })
  .refine(
    (data) =>
      data.NODE_ENV !== 'production' ||
      (data.JWT_ACCESS_SECRET !== DEV_ACCESS_SECRET &&
        data.JWT_REFRESH_SECRET !== DEV_REFRESH_SECRET),
    {
      message:
        'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set to unique values in production (dev defaults are rejected)',
      path: ['JWT_ACCESS_SECRET'],
    }
  );

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
export const corsOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
