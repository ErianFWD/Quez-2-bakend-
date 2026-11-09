 feat_yubran
# Frontend EcoObra

React 18 y Vite 5. Conecta por defecto a `http://localhost:3000/api`, con datos persistidos por el backend en MySQL. Consultar `../README.md` para la instalación completa.

Desde esta carpeta: copiar `.env.example` a `.env`, ejecutar `npm ci` y `npm start`. Abrir `http://localhost:5173`.

- `npm test`: reglas de inventario.
- `npm run build`: compilación para producción.
- `npm run preview`: previsualización de la compilación.
- `npm run demo`: inicia Vite y json-server; requiere `VITE_FUENTE_DATOS=dbjson` en `.env`. Es un modo independiente y no guarda en MySQL.
- `npm run db:reset`: regenera únicamente los datos de demostración de `db.json`.

Reiniciar Vite después de cambiar `.env`. Páginas: inicio, materiales, trazabilidad, vencimientos, movimientos, órdenes, alertas y configuración.

# Frontend · Químicos EcoObra S.A.

React + Vite. Mientras el back end no está listo, los datos salen de **`db.json`**, servido por
**json-server** (un servidor Node) en el puerto 3001.

## Cómo correrlo

```bash
npm install
copy .env.example .env     # en Mac/Linux: cp .env.example .env
npm start                  # levanta json-server (3001) y la página (5173) al mismo tiempo
```

Abrir http://localhost:5173

| Comando | Qué hace |
|---|---|
| `npm start` | json-server + Vite juntos |
| `npm run server` | Solo json-server con `db.json` |
| `npm run dev` | Solo la página |
| `npm run db:reset` | Vuelve a crear `db.json` con los datos de prueba (fechas calculadas desde hoy) |
| `npm test` | Pruebas de las reglas de negocio |

## De dónde salen los datos (`.env`)

| `VITE_FUENTE_DATOS` | Fuente |
|---|---|
| `dbjson` | `db.json` vía json-server (por defecto) |
| `api` | Back end real en `VITE_API_URL` (Node + Express + MySQL + Sequelize) |

`src/services/api.js` funciona como un enchufe: las páginas siempre llaman `api.getMateriales()` y
el `.env` decide si eso va a `db.json` o al back end. Cuando el back end esté listo, solo se cambia
el `.env`; no hay que tocar ninguna página.

## Estructura (components → pages → routes → App → main → index.html)

```
frontend/
├── db.json                  datos de prueba (json-server)
├── index.html               ← carga main.jsx
├── scripts/generar-db.js    crea db.json
├── public/                  favicon e ilustración de estantes (SVG)
└── src/
    ├── components/          piezas reutilizables (Navbar, Footer, PageHeader, MaterialCard, Modal…)
    ├── pages/               una página por pantalla
    ├── routes/AppRoutes.jsx define qué página va en cada ruta
    ├── App.jsx              usa las rutas
    ├── main.jsx             monta App en index.html
    ├── services/            api.js (enchufe) · dbJsonApi.js (db.json) · mockData.js (datos semilla)
    ├── hooks/useApi.js      carga, error y recarga de datos
    ├── utils/               inventario.js (reglas de negocio) · format.js · categorias.js
    └── styles.css
```

## Pantallas

| Ruta | Qué muestra | Requisito del enunciado |
|---|---|---|
| `/` Inicio | Portada, números del inventario, categorías, materiales por reponer, vencimientos y duplicados | Dashboard (puntos extra) |
| `/materiales` | Tarjetas o tabla con stock disponible, SS y PR calculados | Registro de materiales |
| `/materiales/:id` | Lotes del material e historial con la OC de cada entrada | Trazabilidad |
| `/lotes` | Lotes en orden FEFO con semáforo de vencimiento | Control de vencimientos |
| `/movimientos` | Entradas, salidas, traslados y ajustes | Registro de movimientos |
| `/ordenes` | OC, recepción (crea la entrada y el lote) y posibles duplicados | Detección de duplicados |
| `/alertas` | Alertas de reorden y de vencimiento | Alerta de reorden |
| `/configuracion` | Días de alerta y regla de duplicados | Reglas configurables |

## Reglas de negocio (`src/utils/inventario.js`)

- `SS = (demanda máxima − demanda promedio) × tiempo de entrega`
- `PR = demanda promedio × tiempo de entrega + SS`
- El stock sale de los movimientos; los lotes vencidos no cuentan como disponibles.
- FEFO: al despachar se sugiere el lote que vence primero. Los lotes vencidos no se despachan; se dan de baja con un ajuste.
- Posible compra duplicada: mismo proveedor y material, cantidad ±10 % y fechas a ≤ 3 días (configurable).
 main
