# NortDeploy — AGENTS.md

## Stack
- **Frontend**: React 18 + Vite (JSX, no TS, no Tailwind/shadcn). Plain CSS only → `frontend/styles.css`
- **Backend**: Node.js + Express (CommonJS, not ESM). Orchestrates Docker via `dockerode`
- **Auth/DB**: Roble API (external REST). Not a direct database — Roble DB is JSON-over-HTTP
- **Proxy**: Caddy for dynamic subdomains (`proyecto.usuario.localhost`)
- **No testing framework** installed

## Commands
| Dir | Command | What |
|-----|---------|------|
| `frontend/` | `npm run dev` | Start Vite dev server |
| `frontend/` | `npm run build` | Production build |
| `frontend/` | `npm run preview` | Preview production build |
| `backend/` | `npm run dev` | Start with nodemon (hot reload) |
| `backend/` | `npm start` | Production start with node |
| root | `docker-compose up` | Full stack (frontend+backend+caddy) |

## Frontend architecture
- **Entry**: `src/main.jsx` → `App.jsx` (`BrowserRouter`, `AuthProvider`)
- **Pages**: `Login`, `Register`, `VerifyEmail`, `Dashboard`
- **Components**: `Header`, `ProjectCard`, `StatusBadge`, `NewProjectModal`
- **API layer**: `src/api/projects.js` (backend REST) + `src/api/roble.js` (Roble auth)
- **Auth context**: `src/context/AuthContext.jsx` — stores user object, exposes `login`/`logout`
- **Token storage**: `localStorage` keys `nd_access` / `nd_refresh` via `src/utils/token.js`
- **Styling**: No inline CSS or `<style>` blocks — ALL styles go in `frontend/styles.css`
- **Assets**: Logo PNGs in `src/assets/`

## Backend architecture
- **Entry**: `src/index.js` (Express app, async bootstrap)
- **Routes**: `src/routes/projects.js` — 7 endpoints (list, create, start, stop, delete, logs, stats)
- **Middleware**: `auth.js` (verifies Bearer token vs Roble API), `rateLimit.js`
- **Services**: `docker.js` (clone, build, run, stop, remove), `robleDB.js` (CRUD via Roble REST), `inactivity.js` (cron, sleeps after 30min no traffic)
- **Config**: `src/config/env.js` — env vars with hardcoded fallbacks
- **Auto-sleep**: Projects sleep after 30 min inactivity (configurable via `INACTIVITY_MINUTES`)

## Env vars required
| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | frontend | Backend URL (default `http://localhost:4000`) |
| `VITE_ROBLE_TOKEN` | frontend | Roble auth token (fallback `nortdeploy_3e0806f857`) |
| `ROBLE_TOKEN` | backend | Roble auth token (fallback same) |
| `ADMIN_TOKEN` | backend | Roble admin token for DB table setup (optional, bootstrap skips if missing) |
| `DOCKER_HOST` | backend | Custom Docker host (optional, defaults to `/var/run/docker.sock`) |
| `BASE_PORT` | backend | Starting port for projects (default 9000) |

## Key gotchas
- **Dashboard won't load** if `Header.jsx` is missing `import nortLogo from '../assets/nort-logo.png'` (ReferenceError at runtime). Check all asset imports.
- **Deleting projects from Dashboard.jsx `MOCK` array?** MOCK has been removed — projects now come from API `useState([])`. If it's still there, remove it.
- **Roble token is hardcoded** in both frontend (`roble.js:3`) and backend (`env.js:3`) as `nortdeploy_3e0806f857`. This is the dev fallback; override via env vars in production.
- **No error boundaries** — a runtime error in any component crashes the page.
- **Backend is CommonJS** (`require`/`module.exports`). Don't use `import`/`export` there.
- **`ADMIN_TOKEN` not set in docker-compose**. On first boot with docker-compose, DB table setup is skipped. Create the `proyectos` table manually in Roble or set `ADMIN_TOKEN`.
- **`npm run build` in frontend** will succeed even if a component imports an undefined asset (Vite treats it as global). Only fails at runtime.

## Routes (frontend)
`/login` → Login page, `/register` → Register page, `/dashboard` → ProtectedRoute (requires auth), `/*` → redirect to `/login`

## Ports
- Frontend dev: `5173`, Frontend prod: `3000`
- Backend: `4000`
- Projects: start from `9000` (configurable via `BASE_PORT`)
- Caddy: `80`
