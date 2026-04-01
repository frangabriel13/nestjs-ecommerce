# Reporte de Problemas - Prueba Técnica

## Problema 1: Versión de imagen Docker sin fijar

**Archivo:** `docker-compose.yml`

**Descripción:**
La imagen de PostgreSQL estaba definida como `image: postgres` sin especificar versión. Esto hace que Docker descargue siempre la última versión disponible, lo cual rompe el contenedor (en este caso, postgres 18 cambió la estructura del directorio de datos). El contenedor no levanta y la aplicación no puede conectarse a la base de datos. El error es difícil de diagnosticar para alguien que no conoce el historial del issue.

**Corrección aplicada:**
```yaml
# Antes
image: postgres

# Después
image: postgres:16
```

**Justificación:**
Siempre se debe fijar la versión de las imágenes en entornos de desarrollo y producción.

---

## Problema 2: Credenciales reales commiteadas al repositorio

**Archivo:** `.gitignore`, `src/common/envs/development.env`

**Descripción:**
Los archivos `.env` contienen credenciales reales (contraseña de base de datos, JWT secret, email y contraseña del administrador) y no estaban excluidos del repositorio. El `.gitignore` no incluía la carpeta `src/common/envs/`. Cualquier persona con acceso al repositorio tiene acceso a las credenciales.

**Corrección aplicada:**
```gitignore
# Antes: src/common/envs/ no estaba listada

# Después
src/common/envs/*.env
```

**Justificación:**
Los archivos de entorno con credenciales nunca deben commitearse.

---

## Problema 3: La base de datos de test no se puede preparar con `NODE_ENV=test`

**Archivos:** `src/common/envs/test.env`, `package.json`

**Descripción:**
`test.env` define `DATABASE_ENTITIES=src/**/*.entity.{ts,js}`, apuntando a los archivos TypeScript fuente. Esto funciona en los e2e tests porque Jest usa ts-jest, que compila TypeScript on the fly. Sin embargo, los comandos `migration:run` y `seed:run` corren sobre Node.js puro, que no compila TypeScript, solo ignora las anotaciones de tipo. Cuando encuentra un enum, que requiere ser transformado a JavaScript real, falla con un error de sintaxis.

No hay ningún workaround documentado ni un script que prepare el entorno de test de punta a punta. La preparación del entorno de test está rota para cualquier desarrollador que clone el repo.

**Corrección aplicada:**
Se agregó el script `test:setup` en `package.json` que compila, corre migraciones y seeds contra la base de test en un solo comando:

```bash
npm run test:setup
```

Esto debe ejecutarse una vez antes de correr `npm run test:e2e` en una máquina nueva.

---

## Problema 4: `UserService` re-declarado como provider en módulos que ya lo importan

**Archivos:** `src/api/auth/auth.module.ts`, `src/api/role/role.module.ts`

**Descripción:**
`UserService` aparecía listado en el array `providers` de `AuthModule` y `RoleModule`, a pesar de que ambos módulos ya importan `UserModule`, el cual exporta `UserService`. Esto hace que NestJS instancie una segunda copia local del servicio en cada módulo, ignorando la instancia provista por `UserModule`. Si `UserService` llegara a mantener algún estado interno o caché, las dos instancias tendrían estados independientes. Además, es un diseño incorrecto que puede generar comportamientos inesperados al escalar el proyecto.

**Corrección aplicada:**

```typescript
// auth.module.ts — Antes
providers: [AuthService, UserService],

// auth.module.ts — Después
providers: [AuthService],
```

```typescript
// role.module.ts — Antes
providers: [RoleService, UserService],

// role.module.ts — Después
providers: [RoleService],
```



---

## Problema 5: Glob de entidades no funciona con TypeORM 0.3.x

**Archivo:** `src/database/typeorm/typeOrm.config.ts`

**Descripción:**
La configuración original usaba `entities: [process.env.DATABASE_ENTITIES]` donde `DATABASE_ENTITIES=dist/**/*.entity.{ts,js}`. Esto funcionaba en desarrollo local porque el glob se resolvía correctamente en ese entorno. Sin embargo, al deployar en producción y correr migraciones y seeds, el glob no resolvía las entidades y TypeORM inicializaba la conexión sin metadata de entidades registrada.

**Corrección aplicada:**
Se reemplazó el glob por importaciones explícitas de las clases de entidad:

```typescript
// Antes
entities: [process.env.DATABASE_ENTITIES],

// Después
entities: [Category, Color, Country, Currency, Inventory, Product, ProductVariation, ProductVariationPrice, Role, Size, User],
```

**Justificación:**
Las importaciones explícitas son más robustas que los globs: no dependen del entorno de ejecución, el compilador TypeScript valida que las clases existan, y el comportamiento es predecible en desarrollo, test y producción.

---

## Diagnóstico inicial: Estado de la aplicación

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

---

## Identificación de eventos de dominio

Se identificaron 7 puntos naturales en el dominio actual:

---

### `UserRegistered`
**Dónde:** `AuthService.register()`, una vez que el usuario fue persistido exitosamente.

Cuando alguien se registra, hay acciones que deberían ocurrir después pero que no son responsabilidad del servicio de autenticación como, por ejemplo, enviar un email de bienvenida.

---

### `UserLoggedIn`
**Dónde:** `AuthService.login()`, una vez que las credenciales fueron validadas y el token generado.

Un consumidor podría registrar la IP y la hora para mantener un historial de actividad del usuario.

---

### `RoleAssigned`
**Dónde:** `RoleService.assignRoleToUser()`, una vez que el nuevo rol fue persistido.

Cambiar el rol de un usuario debería quedar registrado en un log de auditoría con quién lo hizo y cuándo.

---

### `ProductCreated`
**Dónde:** `ProductService.createProduct()`, una vez que el producto fue persistido.

Es el momento para notificar al merchant que su producto fue dado de alta en el sistema. Hoy el servicio guarda el registro y retorna, sin modelar nada de lo que debería pasar a continuación.

---

### `ProductDetailsAdded`
**Dónde:** `ProductService.addProductDetails()`, una vez que los datos fueron actualizados.

El producto pasa de ser un esqueleto vacío a tener contenido real. Podría disparar una validación automática o una indexación parcial en un motor de búsqueda.

---

### `ProductActivated`
**Dónde:** `ProductService.activateProduct()`, una vez que `isActive` fue seteado en `true`.

Es el momento natural para notificar al merchant que su producto está publicado o para indexarlo en un catálogo de búsqueda.

---

### `ProductDeleted`
**Dónde:** `ProductService.deleteProduct()`, una vez que el registro fue eliminado.

Puede haber referencias asociadas que deberían limpiarse: entradas en índices de búsqueda, registros de inventario, precios. Hoy el servicio ejecuta un `DELETE` directo sin ningún side-effect. Un consumidor del evento podría encargarse de esa limpieza de forma desacoplada.

---

## Implementación de eventos de dominio

Se implementaron 2 eventos de dominio usando `@nestjs/event-emitter@1.4.2` (versión compatible con NestJS 9).

El módulo se registró globalmente en `src/api/api.module.ts` con `EventEmitterModule.forRoot()`, lo que permite inyectar `EventEmitter2` en cualquier servicio sin configuración adicional por módulo.

---

### Evento 1: `UserRegistered`

**Archivos involucrados:**
- `src/events/user-registered.event.ts` — clase del evento con `userId` y `email`
- `src/api/auth/services/auth.service.ts` — emisor
- `src/api/auth/listeners/user-registered.listener.ts` — consumidor

**Flujo:**
`AuthService.register()` crea el usuario y emite `'user.registered'` con su `id` y `email`. El listener reacciona de forma completamente desacoplada — `AuthService` no sabe que existe.

**Por qué este evento:** si en el futuro se quisiera enviar un email de bienvenida o registrar el alta en un log de auditoría, solo se agrega un nuevo listener. `AuthService` no se toca.

---

### Evento 2: `ProductActivated`

**Archivos involucrados:**
- `src/events/product-activated.event.ts` — clase del evento con `productId` y `merchantId`
- `src/api/product/services/product.service.ts` — emisor
- `src/api/product/listeners/product-activated.listener.ts` — consumidor

**Flujo:**
`ProductService.activateProduct()` ejecuta el `UPDATE` y luego emite `'product.activated'` con el `productId` y `merchantId`. El listener reacciona de forma independiente.

**Por qué este evento:** notificar al merchant, indexar en un catálogo,etc; son responsabilidades que no le pertenecen a `ProductService`. Con el evento, cada una puede implementarse como un listener independiente.

**Verificación:**
```
[ProductActivatedListener] Product activated - productId: 3, merchantId: 2
```

---

## Decisiones técnicas relevantes

### Monolito event-driven en lugar de microservicios

El desafío propone evolucionar el sistema hacia un modelo event-driven. Se eligió mantener el monolito y aplicar ese modelo internamente, en lugar de extraer microservicios, porque el alcance del dominio y el volumen de datos no justifican la complejidad operativa que implicaría. La arquitectura event-driven con `EventEmitter2` logra el desacoplamiento entre módulos con una fracción de esa complejidad. Si el sistema creciera en volumen o equipos, el mismo contrato de eventos puede migrar a un bus externo (Kafka, RabbitMQ) sin cambiar la lógica de los emisores.

### `@nestjs/event-emitter@1.4.2` — versión fijada por compatibilidad

La versión más reciente de `@nestjs/event-emitter` requiere NestJS 10 o superior. Este proyecto usa NestJS 9, por lo que instalar la versión latest genera un conflicto de peer dependencies. Se fijó la versión `1.4.2`, que es la última compatible con NestJS 9.

### SSE en lugar de WebSockets para el canal de eventos al frontend

Para exponer los eventos de dominio al frontend se eligió **Server-Sent Events (SSE)** en lugar de WebSockets por las siguientes razones:

- El flujo de información es unidireccional: el servidor empuja eventos al cliente, no al revés. SSE es el protocolo diseñado exactamente para este caso.
- SSE funciona sobre HTTP estándar, no requiere upgrade de protocolo ni librerías adicionales en el cliente.
- WebSockets agregarían complejidad innecesaria (`@nestjs/websockets`, `socket.io`) para un canal que no requiere comunicación bidireccional.

### Separación entre clase de evento, emisor y listener

Cada evento sigue la misma estructura de tres archivos:
- **Clase del evento** (`src/events/`) — define el contrato de datos, sin lógica.
- **Emisor** — el servicio de dominio que emite el evento después de completar su operación principal.
- **Listener** — el consumidor desacoplado que reacciona al evento.

### Frontend desacoplado en `client/`

La app React vive en su propio directorio con su propio `package.json`, completamente separada del proyecto NestJS. Se excluyó del compilador de TypeScript del backend (`tsconfig.build.json`) para evitar conflictos de configuración entre los dos entornos de compilación.
