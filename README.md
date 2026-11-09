# Químicos EcoObra S.A. · Frontend de control de inventario

Caso **#062 · Gestión de Inventarios (Quiz #2)**: control de materiales con fecha de vencimiento
para una distribuidora de selladores, adhesivos y químicos de obra.
Corresponde a la **Opción 2 (Control de inventario)** del enunciado, adaptada a productos que vencen:
cada entrada crea un **lote** con su fecha de vencimiento y la **OC** de donde viene.

Este repositorio es **solo el frontend** (React + Vite). Consume la API de Node.js descrita en
[`API_CONTRACT.md`](./API_CONTRACT.md).

## Cómo correrlo

Requisitos: Node.js 18 o superior.

```bash
npm install
cp .env.example .env      # en Windows: copy .env.example .env
npm run dev               # abre http://localhost:5173
```

### Modo demostración vs. API real

| `.env` | Qué pasa |
|---|---|
| `VITE_USE_MOCK=true` | Usa datos de prueba guardados en el navegador. Sirve para probar y grabar la demo sin back end. |
| `VITE_USE_MOCK=false` + `VITE_API_URL=http://localhost:3000/api` | Usa la API real de Node.js. |

En modo demostración, **Configuración → Restaurar datos de demostración** vuelve a los datos iniciales.
Las fechas de los datos de prueba se calculan desde el día de hoy, así siempre hay lotes vencidos,
por vencer y vigentes para mostrar.

### Pruebas

```bash
npm test
```

Prueban las reglas de negocio de `src/utils/inventario.js`: stock de seguridad, punto de reorden,
semáforo de vencimiento, sugerencia FEFO y detección de compras duplicadas.

## Pantallas

| Ruta | Qué muestra | Requisito del enunciado |
|---|---|---|
| `/` Panel general | KPIs, materiales a reponer, próximos vencimientos, lotes vencidos, OC duplicadas | Dashboard (puntos extra) |
| `/materiales` | Materiales con stock disponible, SS y PR **calculados** | Registro de materiales |
| `/materiales/:id` | Lotes del material e historial con la OC de cada entrada | Consulta de trazabilidad |
| `/lotes` | Todos los lotes en orden FEFO con semáforo de vencimiento | Control de vencimientos |
| `/movimientos` | Entradas, salidas, traslados y ajustes con fecha, usuario, lote, ubicación y documento | Registro de movimientos |
| `/ordenes` | OC, recepción de OC (crea la entrada y el lote) y posibles duplicados | Detección de duplicados |
| `/alertas` | Tabla de alertas de reorden y de vencimiento | Alerta de reorden |
| `/configuracion` | Días de alerta y regla de duplicados (configurables) | Reglas configurables |

## Diseño

Estilo de sitio corporativo de distribuidora: barra superior verde, menú blanco con subrayado azul en la
página activa, banners oscuros con título grande, portada con corte en "V", hexágonos por categoría,
círculos con los números del inventario, tarjetas de materiales tipo "productos destacados" y pie de
página oscuro. Las ilustraciones (estantes, íconos y logo) son SVG propios en `public/` y
`src/components/Iconos.jsx`. El botón verde flotante abre el formulario de movimientos.

## Reglas de negocio

- `SS = (demanda máxima − demanda promedio) × tiempo de entrega`
- `PR = demanda promedio × tiempo de entrega + SS`
- El stock se obtiene sumando los movimientos; los lotes vencidos **no** cuentan como disponibles.
- **FEFO** (First Expired, First Out): al registrar una salida se sugiere el lote que vence primero.
- No se puede despachar ni trasladar un lote vencido; se da de baja con un **ajuste** con motivo.
- **Posible compra duplicada:** mismo proveedor y material, cantidad con diferencia de ±10 % como máximo
  y fechas a 3 días o menos (los valores se cambian en Configuración).

## Estructura

```
src/
├── components/   piezas reutilizables (Navbar, Footer, PageHeader, MaterialCard, Modal, Badge, StockBar…)
├── pages/        una página por ruta
├── routes/       AppRoutes.jsx (React Router)
├── services/     api.js (API real) · mockApi.js + mockData.js (modo demostración)
├── hooks/        useApi.js (carga, error, recarga)
├── utils/        inventario.js (reglas de negocio) · format.js (colones, fechas) · categorias.js (colores e íconos)
├── App.jsx → main.jsx → index.html
```

`services/api.js` funciona como un enchufe: las páginas siempre llaman `api.getMateriales()`, y
según el `.env` ese enchufe se conecta al back end real o a los datos de prueba. Por eso, cuando
la API esté lista, no hay que tocar ninguna página.
