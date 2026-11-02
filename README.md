# express-react-passport-jwt

[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Zod](https://img.shields.io/badge/Zod-3-3E67B1?style=flat-square)](https://zod.dev)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**The secure JWT auth baseline you should fork.** Full-stack reference: Express 4 + TypeScript + MongoDB API with React 19 + Vite + TypeScript client. Every security decision is deliberate, documented, and tested.

> **v2 rewrite** — v1 (Express JS, Mongoose 5, CRA, React 17, localStorage JWT) is preserved in git history before this commit.

---

## 🛡 What Security Pitfalls Does This Avoid?

Most JWT tutorials get at least three of these wrong. This project gets all of them right:

| Pitfall | Common Mistake | **This Project** |
|---------|----------------|------------------|
| **Token in localStorage** | Vulnerable to XSS — any script can read `localStorage.getItem('token')` | ✅ httpOnly refresh cookie (JS cannot read it) |
| **No refresh rotation** | Refresh token replayed forever if stolen | ✅ Rotation: each refresh issues new token, invalidates old |
| **Long-lived access tokens** | 24h+ access tokens widen the theft window | ✅ Short-lived access token in memory only |
| **No input validation** | Manual `if (!email)` checks, inconsistent errors | ✅ Zod schemas on every auth route |
| **Trusting client-supplied headers** | `x-user-id` style headers from the client | ✅ JWT verified server-side, user from token payload |
| **Missing security headers** | No helmet, no CORS allowlist | ✅ helmet + explicit CORS with credentials |
| **No rate limiting on auth** | Unlimited password guesses | ✅ express-rate-limit (20 req / 15 min on `/api/auth`) |
| **Unstructured error responses** | Stack traces or vague "Error" messages | ✅ Centralized error handler: Zod / Auth / Http / unknown |
| **No graceful shutdown** | Process killed mid-request, Mongo connection dropped | ✅ SIGTERM/SIGINT → close server → disconnect Mongo |

---

## 🚀 5-Minute Quick Start

### Prerequisites
- Node.js 22+
- MongoDB running locally (or use Docker)

### Two Terminal Method

```bash
# Terminal 1 — API server (port 3000)
cd server
cp .env.example .env
npm install
npm run dev

# Terminal 2 — Client (port 5173)
cd client
npm install
npm run dev
```

Open http://localhost:5173 — register, log in, view your profile.

### One-Command Docker Method

```bash
cp server/.env.example server/.env   # set real secrets
docker compose up --build
```

API on :3000, client on :5173, MongoDB on :27017.

---

## 🔐 Auth Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client   │         │  Server  │         │  MongoDB │
│ (memory)  │         │          │         │          │
└─────┬─────┘         └────┬─────┘         └────┬─────┘
      │  POST /login       │                    │
      │───────────────────>│  find user,        │
      │                    │  bcrypt.compare    │
      │                    │───────────────────>│
      │  { accessToken }   │                    │
      │  Set-Cookie:       │                    │
      │   refreshToken     │                    │
      │  (httpOnly)        │                    │
      │<───────────────────│                    │
      │                    │                    │
      │  GET /me           │                    │
      │  Authorization:    │                    │
      │   Bearer <token>   │                    │
      │───────────────────>│  verify JWT        │
      │  { user }          │                    │
      │<───────────────────│                    │
      │                    │                    │
      │  POST /refresh     │                    │
      │  Cookie:           │  verify + rotate   │
      │   refreshToken     │  invalidate old    │
      │───────────────────>│───────────────────>│
      │  { accessToken }   │                    │
      │  Set-Cookie:       │                    │
      │   newRefreshToken  │                    │
      │<───────────────────│                    │
```

1. **Register/Login** → server returns short-lived access token (response body) + httpOnly refresh cookie
2. **Client** keeps access token in memory (React context); sends `Authorization: Bearer` on protected routes
3. **Refresh** → cookie is verified, rotated; new access token returned. Old refresh token is invalidated.
4. **Logout** → refresh token revoked server-side; cookie cleared

---

## 🏗 Architecture

### Server (Express + TypeScript)

```
server/src/
  config/
    env.ts          # Zod-validated environment variables (fail-fast at boot)
    database.ts     # Mongoose connection with graceful disconnect
    logger.ts       # pino with request IDs
  middleware/
    auth.ts         # JWT verification, attaches req.user
    error.ts        # Centralized error handler (Zod / Auth / Http / unknown)
    validate.ts     # Reusable Zod validation middleware
  models/
    User.ts         # Mongoose 8 schema with password hash
  routes/
    auth.ts         # /api/auth: register, login, refresh, logout, me
  services/
    auth.service.ts # Business logic: register, login, password hashing
    token.service.ts# JWT sign/verify, refresh token creation/rotation
  app.ts            # Express app: helmet, CORS, rate-limit, routes
  server.ts         # Entry: connect DB, listen, graceful shutdown
```

**Layered design:** `routes → middleware → services → models`. Routes handle HTTP concerns only. Services hold business logic. Models own data access. This makes testing, refactoring, and adding features predictable.

### Client (React + Vite + TypeScript)

```
client/src/
  features/
    auth/           # Login, Register forms + useAuth hook
    profile/        # Protected profile page
  shared/
    api/            # Typed fetch client with auth interceptors
    context/
      AuthContext.tsx # Access token in memory, refresh logic
  test/             # Vitest setup + custom render with providers
```

---

## 🧩 What You Get

### Server Features
| Feature | Implementation |
|---------|----------------|
| Password hashing | bcryptjs, cost factor 12 |
| Access tokens | Short-lived JWT (configurable, default 15m) in response body |
| Refresh tokens | httpOnly cookie, rotation on every use, server-side revocation list |
| Input validation | Zod schemas on every route, typed error responses |
| Security headers | helmet |
| Rate limiting | express-rate-limit on `/api/auth` (20 req / 15 min) |
| CORS | Explicit allowlist with credentials |
| Logging | pino structured logs with request IDs |
| Error handling | Centralized: Zod → Auth → Http → unknown |
| Graceful shutdown | SIGTERM/SIGINT → close server → disconnect Mongo |
| Tests | Supertest integration suite against real Mongo |

### Client Features
| Feature | Implementation |
|---------|----------------|
| Token storage | Access token in memory (React context); refresh token in httpOnly cookie |
| Auto-refresh | AuthContext transparently refreshes on 401, retries original request |
| Protected routes | RequireAuth wrapper component |
| Form validation | Zod schemas shared with API types |
| API client | Typed fetch wrapper with auth header injection |

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account (email, password, name) |
| POST | `/api/auth/login` | — | Authenticate; returns access token + sets refresh cookie |
| POST | `/api/auth/refresh` | Cookie | Rotate refresh token; returns new access token |
| POST | `/api/auth/logout` | Bearer | Revoke refresh token; clear cookie |
| GET | `/api/auth/me` | Bearer | Current user profile |

### Example Requests

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"securepassword123","name":"You"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"securepassword123"}'
# → { "accessToken": "eyJ..." }
# → Set-Cookie: refreshToken=...; HttpOnly; Path=/api/auth/refresh

# Protected route
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJ..."
```

---

## 🧪 Testing

```bash
# Server integration tests (requires MongoDB)
cd server
npm test

# Client unit tests
cd client
npm test
```

The server suite covers the full auth lifecycle: register → login → access protected → refresh → logout → refresh fails.

---

## 🔀 Extending: Common Next Steps

### Add Role-Based Access Control (RBAC)

1. Add `role` field to `User` model (`enum: ['user', 'admin']`, default `'user'`)
2. Create `requireRole(...roles)` middleware:
```ts
import { Request, Response, NextFunction } from 'express'

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}
```
3. Apply on routes: `router.get('/admin', auth, requireRole('admin'), handler)`

### Add Password Reset Flow

1. Add `PasswordResetToken` model: `{ userId, token, expiresAt }`
2. POST `/api/auth/forgot-password` — generate token, send email via Resend/SMTP
3. POST `/api/auth/reset-password` — verify token, update password, invalidate all refresh tokens
4. Client: add `ForgotPassword` and `ResetPassword` forms

### Add Email Verification

1. Add `isVerified: boolean` to User
2. On register, send verification link with signed token
3. Add `auth` middleware option: `requireVerified` flag
4. Protect sensitive routes behind verified-only

---

## 🐳 Docker Compose Services

| Service | Port | Purpose |
|---------|------|---------|
| `server` | 3000 | Express API |
| `client` | 5173 | React dev server (Vite) |
| `mongo` | 27017 | MongoDB |

Production note: the client `Dockerfile` uses nginx to serve the built bundle; swap `docker-compose.yml` to use build contexts for production deploys.

---

## 📄 License

MIT © Michael McShinsky