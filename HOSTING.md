# Hosting & running — express-react-passport-jwt

Central plan: `D:\Projects\HOSTING.md`. Implementation status: `D:\Projects\HOSTING-STATUS.md`.

Full-stack auth starter: Express + MongoDB JWT API and a React/Vite client.

## Parts

| Part | Path / service | Role |
|---|---|---|
| Client | `client/` | React 19 + Vite |
| Server | `server/` | Express + MongoDB + JWT |
| MongoDB | `docker compose` | local database |

## Run locally

No package manager is used by this project.

```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
docker compose up -d
```


## Hosting

| Part | Host | How |
|---|---|---|
| Template | GitHub template | Not a live product |
| If run | Oracle VM + Docker | client + server + MongoDB |

### Deploy / provision

- Keep as a GitHub template; no hosting.

## Verify

```bash
cd server && npm test
cd client && npm test
```

---

See also: `D:\Projects\HOSTING.md` (portfolio plan), `D:\Projects\RUNBOOK.md` (operations), `D:\Projects\HOSTING-STATUS.md` (what is verified).
