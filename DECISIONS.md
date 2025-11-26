## ORM Choice (TypeORM vs Prisma)

- **Context**: Need an ORM for the NestJS + Postgres backend to support auth and user management.
- **Options considered**:
  - TypeORM (decorator-based entities, repositories, query builder)
  - Prisma (schema-first, generated client)
- **Final choice**: TypeORM.
- **Pros (TypeORM)**: Tight Nest integration via modules/providers; repository pattern fits DI; flexible query builder for dynamic filters; migrations built-in; no codegen step during dev.
- **Cons (TypeORM)**: Heavier decorator usage; types rely on runtime metadata; schema drift risk if migrations neglected.
- **Interview notes**: Chose TypeORM to stay aligned with Nest patterns (modules + repositories) and to keep dynamic querying simple. Prisma would have given a strongly typed generated client and schema-first ergonomics, but adds a generation step and less direct repository-style DI.***

## Auth Routing Strategy (Global Guard + Public Decorator)

- **Context**: Need JWT protection for all API routes, while leaving login (and any future health) open.
- **Options considered**:
  - Per-controller `@UseGuards(JwtAuthGuard)` on protected controllers.
  - Global `APP_GUARD` with a custom `@Public()` decorator to opt out.
- **Final choice**: Global guard via `APP_GUARD`, with `@Public()` on login (and any intentionally open endpoints).
- **Pros**: Default-secure posture; hard to forget guarding new routes; intent is explicit for public endpoints.
- **Cons**: Slight boilerplate—must remember `@Public()` for health/login; guard runs on every request.
- **Token config**: `JwtModule` uses `JWT_SECRET` and `JWT_EXPIRES_IN` (default 15m). JWT payload includes `sub`, `email`, `role`, and `name` for downstream authZ/UI.
- **Login response**: Controller returns `{ accessToken, user }`, where `user` is the safe shape (no password hash) to simplify frontend role/name usage without an extra call.

## Dev API Access: Angular Proxy vs Direct URL/CORS

- **Context**: Frontend runs on port 4200 while the Nest API runs on 3000. Needed to avoid CORS while keeping service calls as `/api/...`.
- **Options considered**:
  - Angular dev proxy (`proxy.conf.json`) routing `/api` to `http://localhost:3000`.
  - Hardcoding full API base URLs in the frontend and enabling CORS in Nest.
- **Final choice**: Angular dev proxy for local development; keep service calls relative (`/api/...`).
- **Pros**: No CORS setup needed in dev; no code changes to services; standard Angular workflow.
- **Cons**: Proxy is dev-only; production still needs same-origin hosting or explicit base URL + CORS.
- **Interview notes**: Chose proxy to keep DX smooth and avoid CORS noise during dev. For prod, plan to host frontend behind the same domain/path or configure base URLs with CORS as needed.

## Protected Landing Route: Guarded Dashboard

- **Context**: Needed a post-login landing page that blocks unauthenticated access.
- **Options considered**:
  - Guarded dashboard route (`/dashboard`) using NgRx token-based `CanActivate`.
  - Unguarded dashboard relying on API errors to bounce users.
- **Final choice**: Guarded `/dashboard` route with a functional guard that checks the token and redirects to `/login`; root path redirects to `/dashboard`.
- **Pros**: Immediate client-side redirect for unauthenticated hits; leverages existing auth state; explicit protected route.
- **Cons**: Until token persistence/refresh is added, a full page reload drops the token and triggers a redirect.
- **Interview notes**: Went with a guard for quick UX feedback and to avoid rendering protected UI without auth. Backend JWT guard remains the source of truth for actual enforcement.

## Auth Persistence + Refresh Flow

- **Context**: Avoid logouts on reload and handle expired access tokens. Needed a refresh token flow and client persistence.
- **Options considered**:
  - Keep access-token-only auth and force re-login on reload/expiry.
  - Add a refresh token in a cookie (short-lived) with automatic refresh on 401 and local storage persistence.
- **Final choice**: Issue a 15m access token plus a 60m refresh token stored in a cookie; login and refresh rotate both tokens. Frontend persists `{ token, user }` in `localStorage`, tries a refresh once on 401, and logs out on failure.
- **Pros**: Survives reloads; fewer login prompts; backend controls refresh lifetime; rotation reduces reuse risk.
- **Cons**: Added cookie dependency and more moving parts; without Secure/SameSite/HttpOnly flags yet, the cookie is less protected (intentionally deferred for now).
- **Interview notes**: Defaulted to 60m refresh for the exercise; cookie flags can be tightened (HttpOnly, Secure, SameSite=Lax) once deployment context is known. Rotation on refresh keeps the latest token active and lets us add invalidation hooks later (e.g., token version on the user).
