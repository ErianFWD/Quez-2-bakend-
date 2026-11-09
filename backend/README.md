 feat_yubran
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

# Back end · Químicos EcoObra (base para completar)

Node.js + Express + MySQL + Sequelize. **Esta carpeta es solo la base:** la estructura, la conexión
y las rutas que el frontend ya consume, todas respondiendo `501 Pendiente`.

## Arrancar

```bash
npm install
copy .env.example .env     # en Mac/Linux: cp .env.example .env
npm run dev                # http://localhost:3000/api/salud
```

## Estructura

```
backend/
├── db/                  schema.sql y seed.sql (pendiente)
├── src/
│   ├── config/database.js   conexión Sequelize ↔ MySQL (lee .env)
│   ├── models/              modelos y relaciones (pendiente)
│   ├── controllers/         lógica de cada ruta (pendiente)
│   ├── services/            reglas: reorden, vencimientos, duplicados (pendiente)
│   ├── routes/index.js      rutas que espera el frontend (hoy responden 501)
│   └── index.js             servidor Express + CORS + manejo de errores
├── .env.example
└── API_CONTRACT.md      rutas, formato JSON y reglas de negocio que espera el frontend
```

## Lo que falta (equipo de back end)

1. Crear la base y las tablas (`db/schema.sql` o migraciones de Sequelize).
2. Definir los modelos en `src/models/`.
3. Implementar cada ruta de `src/routes/index.js` según `API_CONTRACT.md`.
4. Poner las reglas en `src/services/`. Las fórmulas exactas ya están probadas en el
   frontend: `frontend/src/utils/inventario.js` (stock de seguridad, punto de reorden, FEFO,
   vencimientos y duplicados). Se pueden copiar tal cual.

Para conectar el frontend: en `frontend/.env` poner `VITE_FUENTE_DATOS=api`.
 main
