# Ecommerce App — NestJS + React

## Deploy

| Servicio | URL |
|---|---|
| Backend | https://nestjs-ecommerce-kdkr.onrender.com |
| Frontend | https://nestjs-ecommerce-two.vercel.app |

## Stack

- **Backend:** NestJS 9, TypeORM, PostgreSQL, JWT
- **Frontend:** React 19, Vite, Axios
- **Eventos:** `@nestjs/event-emitter` + SSE (Server-Sent Events)

## Requisitos previos

- Node.js 18+
- Docker y Docker Compose

## Cómo levantar el proyecto

### 1. Clonar e instalar dependencias

```bash
git clone <repo>
cd nestjs-ecommerce
npm install
cd client && npm install && cd ..
```

### 2. Configurar variables de entorno

Crear el archivo `src/common/envs/development.env` (no está en el repositorio por seguridad). Usar como referencia:

```env
PORT=3000
BASE_URL=http://localhost:3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=ecommercedb
DATABASE_USER=hassan
DATABASE_PASSWORD=password
DATABASE_ENTITIES=dist/**/*.entity.{ts,js}

JWT_SECRET=keep-this-secret-private

ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=12345678
```

### 3. Levantar la base de datos

```bash
docker-compose up -d
```

Esto crea dos bases de datos: `ecommercedb` (desarrollo) y `ecommercetestdb` (tests).

### 4. Correr migraciones y seeds

```bash
npm run migration:run
npm run seed:run
```

El seed crea los roles, categorías y un usuario administrador con las credenciales definidas en `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

### 5. Levantar el backend

```bash
npm run start:dev
```

El backend queda disponible en `http://localhost:3000`.

### 6. Levantar el frontend

```bash
cd client
npm run dev
```

El frontend queda disponible en `http://localhost:5173`.

## Tests

```bash
# Unit tests
npm test

# E2E tests (requiere base de datos de test activa)
npm run test:e2e
```

## Generar migraciones

```bash
npm run migration:generate --name=<MigrationName>
```
