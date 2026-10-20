# express-react-passport-jwt

Full-stack JWT authentication reference: **Express 4 + TypeScript + MongoDB** API with **React 19 + Vite + TypeScript** client.

> **v2 rewrite** — v1 (Express JS, Mongoose 5, CRA, React 17, localStorage JWT) is preserved in git history before this commit.

## What makes this "mature"

| Concern | Implementation |
| --- | --- |
| Token storage | **httpOnly cookies** for refresh tokens (not localStorage) |
| Refresh flow | **Rotation** — each refresh issues a new token and invalidates the old one |
| Password hashing | **bcryptjs**, cost factor 12 |
| Input validation | **Zod** schemas on every auth route |
| Security headers | **helmet** |
| Rate limiting | **express-rate-limit** on `/api/auth` (20 req / 15 min) |
| CORS | Explicit allowlist with credentials |
| Logging | **pino** structured logs with request IDs |
| Architecture | Layered: `routes → middleware → services → models` |
| Errors | Centralized handler (Zod / Auth / Http / unknown) |
| Graceful shutdown | SIGTERM/SIGINT → close server → disconnect Mongo |
| Tests | **Supertest** integration suite against real Mongo |

## Project layout

```
server/          Express API (TypeScript, ESM)
  src/
    config/      env (zod), database, logger
    middleware/  auth (JWT), error, validate
    models/      User (Mongoose 8)
    routes/      auth routes
    services/    auth + token logic
  tests/         Supertest integration tests
client/          React app (Vite, TypeScript)
  src/
    features/    auth (login/register), profile
    shared/      api client, AuthContext
docker-compose.yml
```

## Quick start (dev)

```bash
# Terminal 1 — API
cd server
cp .env.example .env
npm install
npm run dev

# Terminal 2 — client
cd client
npm install
npm run dev
```

Client runs at http://localhost:5173 and proxies `/api` to the server.

## Docker

```bash
cp server/.env.example server/.env   # set real secrets
docker compose up --build
```

## Auth flow

1. **Register/Login** → server returns short-lived access token (body) + httpOnly refresh cookie.
2. Client keeps access token in memory; sends `Authorization: Bearer` on protected routes.
3. **Refresh** → cookie is rotated; new access token returned. Old refresh token is invalidated.
4. **Logout** → refresh token revoked server-side; cookie cleared.

## Testing

```bash
cd server && npm test   # requires MongoDB running locally
cd client && npm test
```

## License

MIT
