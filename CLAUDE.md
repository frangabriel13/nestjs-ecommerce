# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev       # Start with watch mode
npm run start:debug     # Start with debugging

# Build
npm run build           # Compile TypeScript
npm run clean           # Remove dist/

# Testing
npm test                # Run unit tests
npm run test:watch      # Watch mode
npm run test:cov        # With coverage
npm run test:e2e        # End-to-end tests

# Database
npm run migration:generate -- --name=<MigrationName>  # Generate migration
npm run migration:run   # Run pending migrations
npm run migration:revert
npm run seed:run        # Seed reference data

# Code quality
npm run lint            # ESLint with auto-fix
npm run format          # Prettier
```

## Infrastructure Setup

Uses Docker for PostgreSQL. Start before running the app:

```bash
docker-compose up -d
```

This creates two databases: `ecommercedb` (development) and `ecommerceTestdb` (testing). Migrations must be run manually after first start — `synchronize` is disabled.

Environment files live in `src/common/envs/` and are selected by `NODE_ENV` (`development.env` by default, `test.env` for e2e tests). These files are copied into `dist/` by the NestJS build via `nest-cli.json` assets config.

## Architecture

### Module structure

All feature modules live under `src/api/`:
- **AuthModule** — JWT-based login/register. Depends on UserModule and RoleModule.
- **UserModule** — User CRUD; exports `UserService` for AuthModule.
- **RoleModule** — Role definitions (many-to-many with User); exports `RoleService`.
- **ProductModule** — Product catalog with categories, variations (color/size), pricing, and inventory.

`ApiModule` (in `src/api/api.module.ts`) aggregates all four and registers the global success-response interceptor and error filter.

### Request/response flow

1. `ValidationPipe` (global, set in `main.ts`) transforms and validates all incoming DTOs.
2. JWT `AuthGuard` + `RolesGuard` protect routes; role metadata is set via a `@Roles()` decorator.
3. `SuccessResponseInterceptor` wraps all successful responses in a consistent envelope.
4. `ErrorsFilter` (global exception filter) handles all thrown exceptions.

### Database

TypeORM with PostgreSQL. Entity files follow the pattern `*.entity.ts`. Migration history is in `src/database/migration/history/`. The TypeORM datasource config used by the CLI is `src/database/typeorm/typeOrm.config.ts`.

Seeders in `src/database/seed/seeders/` populate reference tables (roles, categories, colors, sizes, currencies, countries) and an admin user.

### Testing conventions

Unit test files (`*.spec.ts`) live next to the source files they test. The `test/` directory contains e2e tests and shared mock helpers. Unit tests mock the TypeORM repositories; e2e tests run against the real `ecommerceTestdb`.
