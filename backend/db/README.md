 feat_yubran
# Base de datos MySQL

- `ecoobra_mysql.sql`: archivo único para instalar en una base nueva, con esquema y datos de demostración.
- `schema.sql`: crea la base `ecoobra_inventario` y sus 14 tablas sin eliminar tablas existentes.
- `seed.sql`: datos de demostración; ejecutar una sola vez después del esquema, si no se usó el archivo combinado.

Los archivos declaran UTF-8 explícitamente para conservar tildes. La estructura usa InnoDB, claves foráneas y restricciones de unicidad. Los movimientos determinan el stock por lote y bodega; `inventario.stock` es una caché.

Importar con Workbench o `SOURCE` desde el cliente MySQL. Instrucciones completas en `../../README.md`. No usar simultáneamente esta ruta de instalación y las migraciones sobre la misma base. Los SQL no son migraciones para bases antiguas.

# Base de datos (MySQL)

Aquí van los scripts de la base de datos (pendiente del equipo de back end):

- `schema.sql`: creación de la base `ecoobra_inventario` y sus tablas.
- `seed.sql`: datos semilla. Se pueden tomar de `frontend/db.json`, que ya tiene materiales, lotes, OC y movimientos de prueba (incluye casos de alerta y de duplicados).

Alternativa: usar migraciones y seeders de Sequelize (`sequelize-cli`).
 main
