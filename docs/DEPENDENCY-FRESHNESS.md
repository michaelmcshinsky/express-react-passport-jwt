# Dependency freshness & upgrade path

Last reviewed: against the versions pinned in `server/package.json` and
`client/package.json`. This file exists so buyers know which dependencies are
current, which are in maintenance mode, and what the upgrade path looks like
**before** they fork.

## Server (`server/package.json`)

| Package            | Pinned  | Status                                                                 |
| ------------------ | ------- | ---------------------------------------------------------------------- |
| `express`          | `^4.21.2` | **Maintenance mode.** Express 4.x receives security fixes only; the Express team moved feature work to 5.x. Express 5.1 is the current stable line. |
| `mongoose`         | `^8.9.0`  | Current major (8.x). See MongoDB driver note below.                    |
| `jsonwebtoken`     | `^9.0.3`  | Current.                                                               |
| `bcryptjs`         | `^2.4.3`  | v2 is stable and fine (pure JS, no native build). v3 exists upstream; adopt deliberately — it changes the API surface slightly. |
| `helmet`           | `^8.0.0`  | Current.                                                               |
| `express-rate-limit` | `^7.5.0` | Current.                                                             |
| `cookie-parser`    | `^1.4.7`  | Maintenance-ish but stable; low risk.                                  |
| `cors`             | `^2.8.6`  | Stable; maintenance mode upstream but widely used.                     |
| `pino` / `pino-http` | `^9` / `^10` | Current logging stack.                                             |
| `zod`              | `^3.24.1` | v3 is stable; **Zod 4 is the current major** and is largely API-compatible for schema definition — worth upgrading when convenient. |

### Passport note

Despite the repo name, **Passport.js is not used** — auth is implemented
directly with `jsonwebtoken` (access token in memory, refresh token in an
httpOnly cookie) plus `bcryptjs`. If you want session/OAuth strategies,
`passport` + `passport-jwt` would be additive, not a replacement; the
refresh-rotation design here is intentionally custom.

### MongoDB driver currency

Mongoose 8.x bundles the **MongoDB Node.js driver v6.x** (currently
`mongodb@6.20.x` in `server/pnpm-lock.yaml`) — the supported driver line for
Mongoose 8. `docker-compose.yml` pins `mongo:8` images. If you move off
Mongoose later, check which driver major the target Mongoose version supports
before assuming a straight swap — there are no legacy `mongodb@3/4` concerns
here.

## Upgrade path: Express 4 → 5

Express 5 is stable and the recommended target for new work. The breaking
changes that matter for this codebase:

- `app.del()` → `app.delete()`; `req.param()` removed (we don't use it).
- Path-to-regexp v8: wildcard syntax changed (`*` → `/*splat`); this app
  uses plain routes, so impact is likely nil — verify with the route tests.
- `res.status()`/`res.json()` unchanged; error-handling middleware signature
  is the same.
- `@types/express` should move to `^5` alongside the runtime bump (they are
  version-locked — keep them aligned).

Suggested sequence:

1. Bump `express` + `@types/express` together to `^5`.
2. Run `npm run typecheck && npm test` — the suite covers auth routes and
   the error handler, which are the usual breakage points.
3. Update `HOSTING.md`/README stack badges if the major version is
   advertised.
4. Alternatives if you'd rather leave Express: **Fastify** (faster, schema
   validation built-in, but a rewrite of the route layer) or **Hono**
   (lightweight, edge-friendly). For an auth baseline, staying on Express 5
   is the lowest-risk path.

## Client (`client/package.json`)

| Package            | Pinned       | Status                                          |
| ------------------ | ------------ | ----------------------------------------------- |
| `react` / `react-dom` | `^19.0.0` | Current major.                                  |
| `react-router-dom` | `^7.18.5`    | Current (v7 is the maintained line).            |
| `vite`             | `^8.3.8`     | Current.                                        |
| `tailwindcss`      | `^4.0.0`     | Current (v4 engine via `@tailwindcss/vite`).    |
| `vitest`           | `^5.1.0`     | Current.                                        |
| `typescript`       | `^5.9.3`     | Current.                                        |

The client stack is fully current; no action needed.

## Policy going forward

- Dependabot/Renovate alerts on the default branch should be triaged
  promptly — Express 4 will accumulate advisories that are only fixed on
  the 5.x line, so an eventual major bump is the durable fix.
- Pin majors deliberately; this repo intentionally stays on released,
  non-beta versions (`bcryptjs@2`, Zod 3) rather than chasing betas.
