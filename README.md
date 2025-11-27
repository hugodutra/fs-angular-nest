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
```

## Setup
```
npm install
```

## Database
```
npm run migration:run   # runs TypeORM migrations (includes seed data)
```

## Run
```
npx nx serve api        # backend on http://localhost:3000
npx nx serve frontend   # frontend on http://localhost:4200
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
docker compose exec api npm run migration:run

# Stop containers
docker compose down
```

## Credentials (seed)
- Admin: admin@email.com / Admin123!

## Notes
- Frontend consumes backend at port 3000 by default.
- If ports differ, update `.env` and Angular environment config accordingly.
