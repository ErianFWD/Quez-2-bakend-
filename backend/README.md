# Backend EcoObra

API Express 4, Sequelize 6 y MySQL. Consultar `../README.md` para importar la base, configurar `.env` e iniciar el proyecto.

Desde esta carpeta:

```text
npm ci
npm run dev
```

API: `http://localhost:3000/api`; salud: `/api/salud`.

- `npm run check`: revisión de sintaxis.
- `npm test`: reglas de inventario.
- `npm run test:integration`: prueba contra la API encendida; crea registros y requiere una base de pruebas con los catálogos de demostración.

El stock se calcula por movimientos, lotes y bodegas. Los lotes son únicos por producto y código; los traslados conservan el mismo lote y cambian su ubicación mediante movimientos. Los errores asíncronos se envían al middleware de errores.

La instalación documentada usa SQL. Las migraciones existentes son una ruta alternativa para desarrolladores; no ejecutarlas después de importar el esquema SQL.
