import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, authApi, getAccessToken, setAccessToken } from './auth';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const user = { id: 'u1', email: 'a@b.c', name: 'A', role: 'user' };

afterEach(() => {
  setAccessToken(null);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('authApi 401 retry', () => {
  it('refreshes once and retries the original request on 401', async () => {
    setAccessToken('stale-token');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(200, { user, accessToken: 'fresh-token' }))
      .mockResolvedValueOnce(jsonResponse(200, user));
    vi.stubGlobal('fetch', fetchMock);

    const result = await authApi.me();

    expect(result).toEqual(user);
    expect(getAccessToken()).toBe('fresh-token');
    expect(fetchMock).toHaveBeenCalledTimes(3);
    // Third call is the retried /auth/me carrying the fresh bearer token.
    const retryCall = fetchMock.mock.calls[2];
    expect(retryCall?.[0]).toBe('/api/auth/me');
    expect((retryCall?.[1] as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer fresh-token',
    });
  });

  it('does not retry auth endpoints themselves', async () => {
    setAccessToken('stale-token');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(401, { message: 'bad' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(authApi.logout()).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('clears the token and throws when refresh fails', async () => {
    setAccessToken('stale-token');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(401, { message: 'refresh rejected' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(authApi.me()).rejects.toMatchObject({ status: 401 });
    expect(getAccessToken()).toBeNull();
  });
});
