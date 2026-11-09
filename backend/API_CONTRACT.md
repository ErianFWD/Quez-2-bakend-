# Contrato de la API · Químicos EcoObra

Este documento dice **qué endpoints espera el frontend** y qué forma tiene el JSON.
Quien haga el back end (Express + PostgreSQL/MySQL) solo tiene que respetar estas rutas y campos.

- URL base: `VITE_API_URL` (por defecto `http://localhost:3000/api`)
- Formato: JSON. Fechas de día como `"YYYY-MM-DD"` y fecha-hora como `"YYYY-MM-DDTHH:mm:ss"`.
- Errores: código HTTP 4xx/5xx con `{ "error": "mensaje legible" }`. El frontend muestra ese mensaje.
- Habilitar CORS para `http://localhost:5173`.

## Reglas de negocio (el back end las calcula, no se digitan)

| Dato | Regla |
|---|---|
| `stock_seguridad` | `(demanda_maxima − demanda_promedio) × tiempo_entrega` (mínimo 0) |
| `punto_reorden` | `demanda_promedio × tiempo_entrega + stock_seguridad` |
| Existencias | Suma de movimientos por **lote y bodega**: entrada `+` destino, salida `−` origen, traslado `−` origen `+` destino, ajuste `±` en `bodega_destino_id` |
| `stock_total` | Suma de existencias del material |
| `stock_vencido` | Existencias de lotes con `fecha_vencimiento < hoy` |
| `stock_disponible` | `stock_total − stock_vencido` |
| `estado` | `agotado` si disponible ≤ 0 · `reordenar` si disponible ≤ PR · `sobrestock` si disponible > máx · si no `ok` |
| `estado_vencimiento` | `vencido` (< 0 días) · `critico` (≤ `dias_alerta_critica`) · `proximo` (≤ `dias_alerta_proxima`) · `vigente` |
| Posible duplicado | Mismo proveedor y material, cantidad con diferencia ≤ `duplicado_tolerancia_pct` % y fechas a ≤ `duplicado_dias` días |
| FEFO | Las listas de lotes van ordenadas por `fecha_vencimiento` ascendente |

Validaciones mínimas: no despachar ni trasladar lotes vencidos, no sacar más de lo que hay en el lote/bodega, no recibir un lote ya vencido, el ajuste exige `observacion` (motivo).

## Tablas sugeridas

`bodegas`, `proveedores`, `materiales`, `ordenes_compra`, `lotes` (con `fecha_vencimiento` y `oc_id`), `movimientos`, `configuracion`.
El stock **no** se guarda en una columna: se calcula de `movimientos` (o con una vista SQL).

## Endpoints

### Materiales
| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/materiales` | `Material[]` |
| GET | `/materiales/:id` | `Material` |
| POST | `/materiales` | `Material` (body sin SS ni PR) |
| PUT | `/materiales/:id` | `Material` |
| GET | `/materiales/:id/existencias` | `Existencia[]` (orden FEFO) |
| GET | `/materiales/:id/trazabilidad` | `{ material: Material, existencias: Existencia[], movimientos: Movimiento[] }` (movimientos en orden cronológico) |

```json
// Material
{
  "id": 1, "codigo": "SEL-ACR-001", "nombre": "Sellador acrílico para concreto 1 gal",
  "categoria": "Selladores", "unidad": "galón",
  "stock_minimo": 40, "stock_maximo": 200,
  "demanda_promedio": 12, "demanda_maxima": 18, "tiempo_entrega": 4, "vida_util_dias": 365,
  "stock_total": 60, "stock_vencido": 0, "stock_disponible": 60,
  "stock_seguridad": 24, "punto_reorden": 72, "estado": "reordenar",
  "proximo_vencimiento": "2026-12-04", "lotes_activos": 2
}
```

### Lotes / existencias
| GET | `/lotes` | `Existencia[]` de todos los materiales con cantidad > 0, orden FEFO |
|---|---|---|

```json
// Existencia (un lote dentro de una bodega)
{
  "lote_id": 2, "codigo_lote": "SA-B-0612",
  "material_id": 1, "material_codigo": "SEL-ACR-001", "material_nombre": "Sellador acrílico…", "unidad": "galón",
  "bodega_id": 1, "bodega_nombre": "Bodega Central Puntarenas",
  "cantidad": 25, "fecha_vencimiento": "2026-12-04",
  "dias_para_vencer": 25, "estado_vencimiento": "critico",
  "oc_id": 8, "oc_codigo": "OC-2038", "proveedor_nombre": "SellaTec Distribuciones"
}
```

### Movimientos
| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/movimientos` | `Movimiento[]` (más recientes primero) |
| POST | `/movimientos` | `{ movimiento: Movimiento, material: Material }` |

Body de POST según el tipo:

```json
// entrada
{ "tipo": "entrada", "material_id": 1, "cantidad": 40, "bodega_destino_id": 1,
  "codigo_lote": "SA-C-0700", "fecha_vencimiento": "2027-10-01",
  "usuario": "dperez", "documento_tipo": "OC", "documento_ref": "OC-2054", "observacion": "" }

// salida
{ "tipo": "salida", "material_id": 1, "cantidad": 5, "lote_id": 2, "bodega_origen_id": 1,
  "usuario": "dperez", "documento_tipo": "Vale de salida", "documento_ref": "VS-1500", "observacion": "" }

// traslado
{ "tipo": "traslado", "material_id": 2, "cantidad": 10, "lote_id": 3, "bodega_origen_id": 1, "bodega_destino_id": 3,
  "usuario": "dperez", "documento_tipo": "Traslado", "documento_ref": "TR-0300", "observacion": "" }

// ajuste (sentido "negativo" o "positivo"; se guarda la cantidad con signo)
{ "tipo": "ajuste", "material_id": 5, "cantidad": 15, "lote_id": 8, "bodega_origen_id": 1, "sentido": "negativo",
  "usuario": "dperez", "documento_tipo": "Acta de ajuste", "documento_ref": "AJ-0010",
  "observacion": "Desecho por vencimiento" }
```

```json
// Movimiento (respuesta)
{
  "id": 25, "fecha": "2026-11-09T10:54:00", "tipo": "salida",
  "material_id": 1, "material_codigo": "SEL-ACR-001", "material_nombre": "…", "unidad": "galón",
  "lote_id": 2, "codigo_lote": "SA-B-0612", "fecha_vencimiento": "2026-12-04",
  "bodega_origen_id": 1, "bodega_origen": "Bodega Central Puntarenas",
  "bodega_destino_id": null, "bodega_destino": null,
  "cantidad": 5, "usuario": "dperez",
  "documento_tipo": "Vale de salida", "documento_ref": "VS-1500", "observacion": "",
  "oc_origen": "OC-2038", "proveedor_nombre": "SellaTec Distribuciones"
}
```

### Órdenes de compra
| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/ordenes` | `Orden[]` (más recientes primero) |
| POST | `/ordenes` | `{ orden: Orden, posibles_duplicados: ["OC-2041"] }` |
| POST | `/ordenes/:id/recibir` | `{ orden: Orden, movimiento: Movimiento }` — crea la entrada y marca la OC como `recibida` |
| GET | `/ordenes/posibles-duplicados` | `{ oc_a: Orden, oc_b: Orden, diferencia_dias, diferencia_cantidad_pct, regla }[]` |

```json
// POST /ordenes
{ "fecha": "2026-11-09", "proveedor_id": 2, "material_id": 6, "cantidad": 150, "precio_unitario": 4350, "solicitante": "Obras" }

// POST /ordenes/:id/recibir
{ "bodega_destino_id": 1, "codigo_lote": "PU-R-0800", "fecha_vencimiento": "2028-02-01", "usuario": "dperez" }

// Orden
{ "id": 11, "codigo": "OC-2042", "fecha": "2026-10-20", "proveedor_id": 2, "proveedor_nombre": "Adhesivos del Pacífico",
  "material_id": 6, "material_codigo": "SEL-PUR-006", "material_nombre": "…", "unidad": "lata",
  "cantidad": 150, "precio_unitario": 4350, "total": 652500, "estado": "pendiente", "solicitante": "Obras" }
```

### Alertas
| GET | `/alertas/reorden` | `Material[]` con `stock_disponible ≤ punto_reorden`, más `cantidad_sugerida` (= máx − disponible), ordenado por urgencia (disponible / PR) |
|---|---|---|
| GET | `/alertas/vencimientos` | `Existencia[]` con estado `vencido` o `critico` |

### Catálogos y configuración
| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/bodegas` | `[{ "id": 1, "nombre": "Bodega Central Puntarenas", "tipo": "bodega" }]` |
| GET | `/proveedores` | `[{ "id": 1, "nombre": "QuimiCR S.A." }]` |
| GET | `/configuracion` | `Configuracion` |
| PUT | `/configuracion` | `Configuracion` |

```json
// Configuracion
{ "dias_alerta_critica": 30, "dias_alerta_proxima": 90, "duplicado_dias": 3, "duplicado_tolerancia_pct": 10, "usuario_actual": "dperez" }
```
