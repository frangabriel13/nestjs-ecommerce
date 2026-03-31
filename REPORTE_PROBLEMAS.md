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