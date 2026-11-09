# Base de datos MySQL

- `ecoobra_mysql.sql`: archivo único para instalar en una base nueva, con esquema y datos de demostración.
- `schema.sql`: crea la base `ecoobra_inventario` y sus 14 tablas sin eliminar tablas existentes.
- `seed.sql`: datos de demostración; ejecutar una sola vez después del esquema, si no se usó el archivo combinado.

Los archivos declaran UTF-8 explícitamente para conservar tildes. La estructura usa InnoDB, claves foráneas y restricciones de unicidad. Los movimientos determinan el stock por lote y bodega; `inventario.stock` es una caché.

Importar con Workbench o `SOURCE` desde el cliente MySQL. Instrucciones completas en `../../README.md`. No usar simultáneamente esta ruta de instalación y las migraciones sobre la misma base. Los SQL no son migraciones para bases antiguas.
