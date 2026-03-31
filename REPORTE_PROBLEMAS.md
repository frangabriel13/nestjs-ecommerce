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
