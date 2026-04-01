# Reporte de Problemas - Prueba Técnica

## Problema 1: Versión de imagen Docker sin fijar

**Archivo:** `docker-compose.yml`

**Descripción:**
La imagen de PostgreSQL estaba definida como `image: postgres` sin especificar versión. Esto hace que Docker descargue siempre la última versión disponible (`latest`), lo cual rompe el contenedor cuando hay un major upgrade (en este caso, postgres 18 cambió la estructura del directorio de datos).

**Impacto:**
El contenedor no levanta y la aplicación no puede conectarse a la base de datos. El error es difícil de diagnosticar para alguien que no conoce el historial del issue.

**Corrección aplicada:**
```yaml
# Antes
image: postgres

# Después
image: postgres:16
```

**Justificación:**
Siempre se debe fijar la versión de las imágenes en entornos de desarrollo y producción para garantizar reproducibilidad y evitar roturas por upgrades automáticos.

---

## Problema 2: Credenciales reales commiteadas al repositorio

**Archivo:** `.gitignore`, `src/common/envs/development.env`

**Descripción:**
Los archivos `.env` contienen credenciales reales (contraseña de base de datos, JWT secret, email y contraseña del administrador) y no estaban excluidos del repositorio. El `.gitignore` no incluía la carpeta `src/common/envs/`.

**Impacto:**
Cualquier persona con acceso al repositorio tiene acceso a las credenciales. El JWT secret expuesto permite forjar tokens válidos sin conocer la contraseña de ningún usuario.

**Corrección aplicada:**
```gitignore
# Antes: src/common/envs/ no estaba listada

# Después
src/common/envs/*.env
```

**Justificación:**
Los archivos de entorno con credenciales nunca deben commitearse. La práctica estándar es proveer un archivo `*.env.example` con valores de ejemplo y que cada desarrollador genere su propio `.env` local.

---

## Problema 3: La base de datos de test no se puede preparar con `NODE_ENV=test`

**Archivos:** `src/common/envs/test.env`, `package.json`

**Descripción:**
`test.env` define `DATABASE_ENTITIES=src/**/*.entity.{ts,js}`, apuntando a los archivos TypeScript fuente. Esto funciona en los e2e tests porque Jest usa ts-jest, que compila TypeScript on the fly. Sin embargo, los comandos `migration:run` y `seed:run` corren sobre Node.js puro, que en versiones modernas solo puede "strip" tipos de TypeScript pero no puede transformar `enum`, que es una construcción que requiere compilación real.

El resultado es que cualquier desarrollador que intente preparar la base de datos de test con los comandos documentados recibe:

```
SyntaxError: TypeScript enum is not supported in strip-only mode
```

No hay ningún workaround documentado ni un script que prepare el entorno de test de punta a punta. El repo no puede usarse desde cero sin conocer este problema internamente.

**Impacto:**
Los e2e tests no pueden correrse en una máquina nueva sin pasos no documentados. La preparación del entorno de test está rota para cualquier desarrollador que clone el repo.

**Workaround aplicado:**
Correr migrations y seeds sin `NODE_ENV=test`, sobreescribiendo solo `DATABASE_NAME`:

```bash
# Migrations
npm run build
DATABASE_NAME=ecommercetestdb npx typeorm -d dist/database/migration/datasource.js migration:run

# Seeds
DATABASE_NAME=ecommercetestdb npm run seed:run
```

**Corrección definitiva sugerida:**
Agregar un script `test:setup` en `package.json` que ejecute build, migrations y seeds contra la base de test, y documentarlo como paso previo a `npm run test:e2e`.

---

## Diagnóstico final: Estado de la aplicación

Luego de identificar y documentar los problemas del repositorio, se verificó el funcionamiento de la aplicación ejecutando todos los endpoints disponibles y corriendo la suite de tests completa.

**Tests:**
- Unit tests: 35/35 ✓
- E2e tests: 7/7 ✓

**Endpoints verificados:**
- `POST /auth/register` ✓
- `POST /auth/login` ✓
- `GET /user/profile` ✓
- `POST /role/assign` ✓
- `POST /product/create` ✓
- `POST /product/details` ✓
- `POST /product/activate` ✓
- `GET /product/:id` ✓
- `DELETE /product/:id` ✓

**Conclusión:**
La aplicación ejecuta correctamente y tiene una base razonable para evolucionar. Los problemas identificados en este reporte son en su mayoría de seguridad y calidad de código, pero ninguno bloquea la ejecución actual de la app.

Los más relevantes para atender en una siguiente iteración son:

| Problema | Archivo | Tipo |
|---------|---------|------|
| JWT secret inconsistente entre `auth.service.ts` y `auth.guard.ts` | `auth.module.ts`, `auth.guard.ts`, `auth.service.ts` | Seguridad |
| Password expuesto en respuesta de `assign role` | `role.controller.ts` | Seguridad |
| Credenciales hardcodeadas como fallback en config | `config/index.ts` | Seguridad |
| Tipos incorrectos en relaciones OneToMany | `user.entity.ts`, `category.entity.ts` | Bug tipado |
| `ValidationPipe` sin `whitelist: true` | `main.ts` | Seguridad |