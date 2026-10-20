const API_BASE = '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      (body as { message?: string }).message ?? 'Request failed',
      res.status
    );
  }
  return body as T;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

function authHeaders(): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const authApi = {
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    setAccessToken(data.accessToken);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(data.accessToken);
    return data;
  },

  async refresh(): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/refresh', { method: 'POST' });
    setAccessToken(data.accessToken);
    return data;
  },

  async logout(): Promise<void> {
    await request<void>('/auth/logout', { method: 'POST' });
    setAccessToken(null);
  },

  async me(): Promise<AuthUser> {
    return request<AuthUser>('/auth/me', { headers: authHeaders() });
  },
};
