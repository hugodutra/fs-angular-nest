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
