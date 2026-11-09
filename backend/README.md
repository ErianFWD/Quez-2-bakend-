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
