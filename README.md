# FsAngularNest

Full-stack Angular + NestJS (Nx) with role-based access (admin/user). Admins can view and edit users via dialog; login flow uses JWT.

## Prerequisites
- Node 18+ and npm
- Postgres running locally (default: `localhost:5432`)
- Nx via `npx` (already in dev deps)

## Environment
Copy `.env` (already checked in) or set:
```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=postgres
JWT_SECRET=dev-secret
REFRESH_TOKEN_SECRET=dev-refresh-secret
```

## Setup
```
npm install
```

## Database
```
npm run migration:run   # runs TypeORM migrations (includes seed data)
```

## Docker (backend + Postgres)
```
# Build backend image
docker build -t fs-angular-nest-api -f Dockerfile .

# Start Postgres only
docker compose up -d postgres

# Start API (depends on Postgres); builds if needed
docker compose up --build api

# Run migrations/seed inside the API container
docker compose exec api npm run db:migration:run

# Stop containers
docker compose down
```

## Run
```
npx nx serve api        # backend on http://localhost:3000
npx nx serve frontend   # frontend on http://localhost:4200
```

## Credentials (seed)
- Admin: admin@email.com / Admin123!

## Notes
- Frontend consumes backend at port 3000 by default.
- If ports differ, update `.env` and Angular environment config accordingly.

# Next steps

- Testing foundation (backend & frontend): add `api/jest.config.ts`, NX `test` target for backend; unit tests for `UsersService` (create hashes password, duplicate email conflict, update not-found) and `AuthService` (invalid password returns null, invalid refresh returns 401); add Angular unit tests for auth reducer/effects and a key component (`LoginPage` or users list) to cover UI state/interaction basics.
- E2E coverage: add Playwright flows for login, unauthorized redirect to login, admin user list renders, admin edits a user successfully (seeded data), and basic error display on failed login; use `data-testid` selectors already in templates.
- Frontend error handling: add a global HTTP error interceptor that maps 400/401/403/404/409/5xx/network to user-friendly messages; provide `MessageService` and `ToastModule` app-wide with `<p-toast>` in root template; surface errors from users load/create/update selectors as toasts.
- Backend error codes: tighten global `ValidationPipe` (whitelist + transform + forbidNonWhitelisted) and add an HTTP exception filter to normalize `{ statusCode, message }` responses; keep existing 401/403/409 semantics.
- Table filtering/sorting: wire PrimeNG table filters/sort to API query params (email/name/role filtering, sort by createdAt/name/email if exposed) so UI leverages backend capabilities.
- Shared types library: create an Nx lib for shared DTOs/types/constants used by both frontend and backend (e.g., auth payloads, user roles), and consume it in API DTOs and Angular models to keep contracts in sync.
