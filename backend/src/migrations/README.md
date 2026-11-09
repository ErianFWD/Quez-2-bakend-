# Migrations

Las migraciones se ejecutan con Sequelize CLI:

- `npm run db:migrate`
- `npm run db:migrate:undo`
- `npm run db:migrate:undo:all`

La migración inicial utiliza `db/schema.sql` como esquema canónico para mantener una sola definición de las tablas.
