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
npm test                                              # Run all unit tests
npm run test:watch                                    # Watch mode
npm run test:cov                                      # With coverage
npm run test:e2e                                      # End-to-end tests
npx jest --testPathPattern=auth.service --forceExit   # Run a single test file

# Database
npm run migration:generate -- --name=<MigrationName>  # Generate migration (builds first)
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

Every response (success or error) follows this envelope:

```json
// Success
{ "isSuccess": true, "message": "success", "data": {}, "errorCode": null, "errors": [] }

// Error
{ "isSuccess": false, "message": "wrong data provided", "errorCode": "60001", "data": null, "errors": [] }
```

### Auth decorators

The `@Auth()` composite decorator (in `src/api/auth/guards/auth.decorator.ts`) combines `AuthGuard` + `RolesGuard` and is used on all protected routes:

```typescript
@Auth()                              // Any authenticated user
@Auth(RoleIds.Admin)                 // Admin only
@Auth(RoleIds.Admin, RoleIds.Merchant) // Admin or Merchant

// RoleIds enum: Customer = 1, Admin = 2, Merchant = 3

@CurrentUser()  // Parameter decorator — injects the full User from request
```

`AuthGuard` loads the full `User` entity with roles from the DB on every request and attaches it to `request.user`.

### Database

TypeORM with PostgreSQL. Entity files follow the pattern `*.entity.ts`. Migration history is in `src/database/migration/history/`. The TypeORM datasource config used by the CLI is `src/database/typeorm/typeOrm.config.ts`.

The `migration:generate` and `migration:run` commands internally run `clean` + `build` first, so the CLI always operates against compiled JS in `dist/`.

Seeders in `src/database/seed/seeders/` populate reference tables (roles, categories, colors, sizes, currencies, countries) and an admin user. Seeding is sequential and idempotent (uses `upsert`). Order matters: Roles → AdminUser → Categories → Sizes → Colors → Countries → Currencies.

### Polymorphic product details

`Product.details` is a JSONB column whose shape varies by category. The DTO uses a type discriminator function (`ProductDetailsTypeFn` in `src/api/product/dto/productDetails/`) that inspects `details.category` to select the correct class for `class-transformer` to instantiate (e.g., `ComputerDetails`). Adding a new category requires adding a new class and a case in that switch.

### Error codes

All error messages and codes are centralized in `src/errors/custom/index.ts`. Codes are grouped by domain (auth: 600xx, user: 601xx, role: 602xx, category: 603xx, product: 604xx, global: 700xx). Always use these constants — never inline error strings.

### Serialization

Use the `@Serialize(DtoClass)` decorator (from `src/common/helper/serialize.interceptor.ts`) on controller methods that should strip properties not decorated with `@Expose()` in the DTO. This is separate from the global response interceptor.

### Testing conventions

Unit test files (`*.spec.ts`) live next to the source files they test. The `test/` directory contains e2e tests and shared mock helpers. Unit tests mock the TypeORM repositories; e2e tests run against the real `ecommerceTestdb`.

The `test/mocks/jwt.ts` helper generates a real JWT token via `JwtService` for use in e2e tests that hit protected routes.
