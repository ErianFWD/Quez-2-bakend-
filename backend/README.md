# Backend — Químicos EcoObra

Backend de Gestión de Inventarios para el caso #062 de Químicos EcoObra.

## Stack

- Node.js + Express
- MySQL 8.4
- Sequelize 6
- mysql2
- Vitest para pruebas

## Estructura

`src/models` representa el DER de EcoObra. Las entidades de inventario se basan en `producto`, `inventario`, `lote_mercancia` y `movimiento_inventario`. La API mantiene los nombres `materiales` del contrato del frontend mediante una capa de adaptación.

## Nota sobre el DER

El DER recibido muestra `fecha_maximo DATE` en `inventario`, mientras que el contrato y las reglas del Quiz requieren `stock_maximo` para calcular sobrestock y cantidad sugerida. Se conserva `fecha_maximo` y se agrega `stock_maximo DECIMAL(10,2)` como extensión necesaria para cumplir el contrato existente.

El DER también usa un solo `id_bodega` en `movimiento_inventario`; para conservar trazabilidad de traslados y compatibilidad con el contrato se agregan `bodega_origen_id` y `bodega_destino_id`. `id_bodega` representa la bodega base del movimiento.

El stock operativo se calcula desde `movimiento_inventario`. La columna `inventario.stock` es un valor cacheado de apoyo y se sincroniza después de crear movimientos.

## Instalación en Windows

1. Instalar Node.js y MySQL 8.4.
2. Crear la BD ejecutando `db/schema.sql` en MySQL Workbench.
3. Ejecutar `db/seed.sql`.
4. Copiar `.env.example` a `.env` y configurar la contraseña.
5. Ejecutar:

```powershell
npm install
npm run dev
```

API: `http://localhost:3000/api`

## Frontend

En `frontend/.env`:

```env
VITE_FUENTE_DATOS=api
VITE_API_URL=http://localhost:3000/api
```

## Pruebas

```powershell
npm test
```

## Validación rápida

```text
GET /api/salud
GET /api/materiales
GET /api/lotes
GET /api/movimientos
GET /api/ordenes
GET /api/alertas/reorden
GET /api/alertas/vencimientos
```

## Reglas principales

- Stock por movimientos y por lote/bodega.
- FEFO.
- No salida/traslado de lotes vencidos.
- No salida mayor al stock disponible.
- No recepción de lotes vencidos.
- Ajustes positivos/negativos con motivo.
- Punto de reorden calculado.
- Alertas de reorden y vencimiento.
- Detección de posibles OC duplicadas.
- Trazabilidad por producto.

Las credenciales se mantienen fuera del repositorio mediante `.env`.

## Estructura del backend

```text
backend/
├── src/
│   ├── models/       # modelos Sequelize y relaciones
│   ├── controllers/  # recepción de solicitudes y respuestas
│   ├── routes/       # endpoints de la API
│   ├── services/     # lógica de negocio
│   ├── migrations/   # migraciones Sequelize CLI
│   ├── middleware/   # errores, validaciones y procesos intermedios
│   ├── config/       # configuración de BD y Sequelize CLI
│   ├── utils/        # funciones y utilidades internas
│   ├── tests/        # pruebas del backend
│   └── index.js
├── db/               # SQL de referencia y datos semilla
├── API_CONTRACT.md
├── package.json
├── .env.example
└── .sequelizerc
```

La carpeta `src/migrations` es la vía recomendada para crear la estructura de la base de datos mediante Sequelize CLI. `db/schema.sql` se conserva como referencia SQL reproducible.
