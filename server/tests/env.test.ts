import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadEnv() {
  vi.resetModules();
  return import('../src/config/env.js');
}

describe('env JWT secrets', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('rejects production startup without JWT secrets', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('JWT_ACCESS_SECRET', undefined);
    vi.stubEnv('JWT_REFRESH_SECRET', undefined);

    await expect(loadEnv()).rejects.toThrow('Invalid environment configuration');
  });

  it('issues ephemeral per-process secrets outside production', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('JWT_ACCESS_SECRET', undefined);
    vi.stubEnv('JWT_REFRESH_SECRET', undefined);

    const { env } = await loadEnv();

    expect(env.JWT_ACCESS_SECRET).toMatch(/^[0-9a-f]{64}$/);
    expect(env.JWT_REFRESH_SECRET).toMatch(/^[0-9a-f]{64}$/);
    expect(env.JWT_ACCESS_SECRET).not.toBe(env.JWT_REFRESH_SECRET);
  });

  it('uses configured secrets when provided', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('JWT_ACCESS_SECRET', 'a'.repeat(32));
    vi.stubEnv('JWT_REFRESH_SECRET', 'b'.repeat(32));

    const { env } = await loadEnv();

    expect(env.JWT_ACCESS_SECRET).toBe('a'.repeat(32));
    expect(env.JWT_REFRESH_SECRET).toBe('b'.repeat(32));
  });
});
