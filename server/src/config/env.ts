import { randomBytes } from 'node:crypto';
import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(3001),
    MONGODB_URI: z.string().min(1).default('mongodb://localhost:27017/auth-demo'),
    JWT_ACCESS_SECRET: z.string().min(32).optional(),
    JWT_REFRESH_SECRET: z.string().min(32).optional(),
    ACCESS_TOKEN_TTL: z.string().default('15m'),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7),
    CORS_ORIGINS: z.string().default('http://localhost:5173'),
  })
  .superRefine((data, ctx) => {
    if (
      data.NODE_ENV === 'production' &&
      (!data.JWT_ACCESS_SECRET || !data.JWT_REFRESH_SECRET)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set to unique values in production',
        path: ['JWT_ACCESS_SECRET'],
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

// No signing secret is committed to source. Outside production, missing
// secrets fall back to ephemeral per-process keys, so zero-config dev still
// works but issued tokens do not survive a server restart.
export const env = {
  ...parsed.data,
  JWT_ACCESS_SECRET:
    parsed.data.JWT_ACCESS_SECRET ?? randomBytes(32).toString('hex'),
  JWT_REFRESH_SECRET:
    parsed.data.JWT_REFRESH_SECRET ?? randomBytes(32).toString('hex'),
};
export const corsOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
