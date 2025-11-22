## ORM Choice (TypeORM vs Prisma)

- **Context**: Need an ORM for the NestJS + Postgres backend to support auth and user management.
- **Options considered**:
  - TypeORM (decorator-based entities, repositories, query builder)
  - Prisma (schema-first, generated client)
- **Final choice**: TypeORM.
- **Pros (TypeORM)**: Tight Nest integration via modules/providers; repository pattern fits DI; flexible query builder for dynamic filters; migrations built-in; no codegen step during dev.
- **Cons (TypeORM)**: Heavier decorator usage; types rely on runtime metadata; schema drift risk if migrations neglected.
- **Interview notes**: Chose TypeORM to stay aligned with Nest patterns (modules + repositories) and to keep dynamic querying simple. Prisma would have given a strongly typed generated client and schema-first ergonomics, but adds a generation step and less direct repository-style DI.***
