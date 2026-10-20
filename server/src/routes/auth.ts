import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import {
  AuthError,
  authenticate,
  clearRefreshCookie,
  issueTokens,
  registerUser,
  revokeRefreshToken,
  rotateRefreshToken,
} from '../services/auth.service.js';
import { REFRESH_COOKIE_NAME } from '../services/token.service.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[a-z]/, 'Must include a lowercase letter')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a digit'),
  name: z.string().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body as z.infer<typeof registerSchema>;
    const user = await registerUser(email, password, name);
    const tokens = issueTokens(user, res);
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const user = await authenticate(email, password);
    const tokens = issueTokens(user, res);
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/refresh', async (req: Request, res: Response, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    const { accessToken, user } = await rotateRefreshToken(refreshToken, res);
    res.json({
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    clearRefreshCookie(res);
    next(err);
  }
});

authRouter.post('/logout', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    await revokeRefreshToken(refreshToken);
    clearRefreshCookie(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { User } = await import('../models/User.js');
    const user = await User.findById(req.user?.sub);
    if (!user) throw new AuthError('User not found', 404);
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    next(err);
  }
});
