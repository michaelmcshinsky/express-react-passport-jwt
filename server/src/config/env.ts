import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  MONGODB_URI: z.string().min(1).default('mongodb://localhost:27017/auth-demo'),
  JWT_ACCESS_SECRET: z.string().min(32).default('dev-access-secret-change-me-in-production-32'),
  JWT_REFRESH_SECRET: z.string().min(32).default('dev-refresh-secret-change-me-in-production-32'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
export const corsOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
