import bcrypt from 'bcryptjs';
import type { Response } from 'express';
import { User, type UserDoc } from '../models/User.js';
import {
  REFRESH_COOKIE_NAME,
  generateRefreshToken,
  hashToken,
  refreshCookieOptions,
  signAccessToken,
  type AccessTokenPayload,
} from './token.service.js';

const SALT_ROUNDS = 12;

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<UserDoc> {
  const existing = await User.findOne({ email });
  if (existing) throw new AuthError('Email already registered', 409);

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return User.create({ email, passwordHash, name });
}

export async function authenticate(
  email: string,
  password: string
): Promise<UserDoc> {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw new AuthError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AuthError('Invalid credentials', 401);

  return user;
}

export async function issueTokens(
  user: UserDoc,
  res: Response
): Promise<{ accessToken: string }> {
  const payload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role ?? 'user',
  };
  const accessToken = signAccessToken(payload);

  const refreshToken = generateRefreshToken();
  await user.updateOne({ refreshTokenHash: hashToken(refreshToken) });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());

  return { accessToken };
}

export async function rotateRefreshToken(
  refreshToken: string | undefined,
  res: Response
): Promise<{ accessToken: string; user: UserDoc }> {
  if (!refreshToken) throw new AuthError('Missing refresh token', 401);

  const tokenHash = hashToken(refreshToken);
  const user = await User.findOne({ refreshTokenHash: tokenHash }).select(
    '+refreshTokenHash'
  );
  if (!user) throw new AuthError('Invalid refresh token', 401);

  const { accessToken } = await issueTokens(user, res);
  return { accessToken, user };
}

export async function revokeRefreshToken(
  refreshToken: string | undefined
): Promise<void> {
  if (!refreshToken) return;
  const tokenHash = hashToken(refreshToken);
  await User.updateOne({ refreshTokenHash: tokenHash }, { refreshTokenHash: null });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { ...refreshCookieOptions(), maxAge: 0 });
}
