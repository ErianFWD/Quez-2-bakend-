// API de desarrollo con db.json.
// Los datos viven en el archivo db.json y los sirve json-server (un servidor Node).
// json-server solo guarda y devuelve "tablas"; los cálculos (stock, punto de reorden,
// vencimientos, duplicados) se hacen aquí, igual que los hará el back end real.
// Las respuestas tienen la MISMA forma que la API real (ver backend/API_CONTRACT.md),
// así que al cambiar al back end no hay que tocar ninguna página.
import {
  calcStockSeguridad,
  calcPuntoReorden,
  estadoStock,
  cantidadSugerida,
  diasParaVencer,
  estadoVencimiento,
  ordenarFEFO,
  buscarDuplicados,
} from '../utils/inventario.js';

const DB_URL = (import.meta.env.VITE_DBJSON_URL || 'http://localhost:3001').replace(/\/$/, '');
const copia = (x) => JSON.parse(JSON.stringify(x));

class ApiError extends Error {
  constructor(mensaje, status = 400) { super(mensaje); this.status = status; }
}

// Fecha y hora local en formato 'YYYY-MM-DDTHH:mm:ss' (sin pasar a UTC)
const fechaHoraLocal = () => {
  const f = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${f.getFullYear()}-${p(f.getMonth() + 1)}-${p(f.getDate())}T${p(f.getHours())}:${p(f.getMinutes())}:${p(f.getSeconds())}`;
};

// ---------- Comunicación con json-server ----------

async function pedir(ruta, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${DB_URL}${ruta}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(`No se pudo conectar con db.json en ${DB_URL}. Ejecute "npm run server" (o "npm start") en la carpeta frontend.`, 503);
  }
  if (!res.ok) throw new ApiError(`db.json respondió ${res.status} en ${method} ${ruta}`, res.status);
  return res.json();
}

// Copia en memoria de db.json; se vuelve a leer en cada operación
let db = null;
async function leer() {
  db = await pedir('/db');
  return db;
}

const siguienteId = (lista) => lista.reduce((max, x) => Math.max(max, Number(x.id)), 0) + 1;
const nombreBodega = (id) => db.bodegas.find((b) => b.id === id)?.nombre ?? null;
const nombreProveedor = (id) => db.proveedores.find((p) => p.id === id)?.nombre ?? null;
const buscarMaterial = (id) => {
  const m = db.materiales.find((x) => x.id === Number(id));
  if (!m) throw new ApiError('Material no encontrado', 404);
  return m;
};

// ---------- Cálculos derivados (el stock se obtiene de los movimientos) ----------

function calcularExistencias() {
  const mapa = new Map(); // clave "lote-bodega" → cantidad
  const sumar = (lote, bodega, cant) => {
    const k = `${lote}-${bodega}`;
    mapa.set(k, (mapa.get(k) ?? 0) + cant);
  };
  for (const m of db.movimientos) {
    if (m.tipo === 'entrada') sumar(m.lote_id, m.bodega_destino_id, m.cantidad);
    if (m.tipo === 'salida') sumar(m.lote_id, m.bodega_origen_id, -m.cantidad);
    if (m.tipo === 'traslado') {
      sumar(m.lote_id, m.bodega_origen_id, -m.cantidad);
      sumar(m.lote_id, m.bodega_destino_id, m.cantidad);
    }
    if (m.tipo === 'ajuste') sumar(m.lote_id, m.bodega_destino_id, m.cantidad); // cantidad con signo
  }
  const lista = [];
  for (const [k, cantidad] of mapa) {
    if (cantidad <= 0) continue;
    const [loteId, bodegaId] = k.split('-').map(Number);
    const lote = db.lotes.find((l) => l.id === loteId);
    if (lote) lista.push(enriquecerLote(lote, bodegaId, cantidad));
  }
  return ordenarFEFO(lista);
}

function enriquecerLote(lote, bodegaId, cantidad) {
  const material = db.materiales.find((m) => m.id === lote.material_id);
  const oc = db.ordenes.find((o) => o.id === lote.oc_id);
  const dias = diasParaVencer(lote.fecha_vencimiento);
  return {
    lote_id: lote.id,
    codigo_lote: lote.codigo_lote,
    material_id: material.id,
    material_codigo: material.codigo,
    material_nombre: material.nombre,
    unidad: material.unidad,
    bodega_id: bodegaId,
    bodega_nombre: nombreBodega(bodegaId),
    cantidad,
    fecha_vencimiento: lote.fecha_vencimiento,
    dias_para_vencer: dias,
    estado_vencimiento: estadoVencimiento(dias, db.configuracion),
    oc_id: oc?.id ?? null,
    oc_codigo: oc?.codigo ?? null,
    proveedor_nombre: oc ? nombreProveedor(oc.proveedor_id) : null,
  };
}

function materialConStock(m, existencias = calcularExistencias()) {
  const propias = existencias.filter((e) => e.material_id === m.id);
  const stock_total = propias.reduce((s, e) => s + e.cantidad, 0);
  const stock_vencido = propias.filter((e) => e.dias_para_vencer < 0).reduce((s, e) => s + e.cantidad, 0);
  const stock_disponible = stock_total - stock_vencido;
  const stock_seguridad = calcStockSeguridad(m.demanda_maxima, m.demanda_promedio, m.tiempo_entrega);
  const punto_reorden = calcPuntoReorden(m.demanda_promedio, m.tiempo_entrega, stock_seguridad);
  const proximo = propias.find((e) => e.dias_para_vencer >= 0);
  return {
    ...m,
    stock_total,
    stock_vencido,
    stock_disponible,
    stock_seguridad,
    punto_reorden,
    estado: estadoStock(stock_disponible, punto_reorden, m.stock_maximo),
    proximo_vencimiento: proximo?.fecha_vencimiento ?? null,
    lotes_activos: propias.length,
  };
}

function enriquecerMovimiento(m) {
  const lote = db.lotes.find((l) => l.id === m.lote_id);
  const material = db.materiales.find((x) => x.id === m.material_id);
  const oc = lote ? db.ordenes.find((o) => o.id === lote.oc_id) : null;
  return {
    ...m,
    material_codigo: material?.codigo,
    material_nombre: material?.nombre,
    unidad: material?.unidad,
    codigo_lote: lote?.codigo_lote,
    fecha_vencimiento: lote?.fecha_vencimiento,
    bodega_origen: nombreBodega(m.bodega_origen_id),
    bodega_destino: nombreBodega(m.bodega_destino_id),
    oc_origen: oc?.codigo ?? null,
    proveedor_nombre: oc ? nombreProveedor(oc.proveedor_id) : null,
  };
}

function enriquecerOrden(o) {
  const material = db.materiales.find((m) => m.id === o.material_id);
  return {
    ...o,
    proveedor_nombre: nombreProveedor(o.proveedor_id),
    material_codigo: material?.codigo,
    material_nombre: material?.nombre,
    unidad: material?.unidad,
    total: o.cantidad * o.precio_unitario,
  };
}

// ---------- Validaciones ----------

function validarMaterial(data) {
  const req = ['codigo', 'nombre', 'categoria', 'unidad'];
  for (const c of req) if (!String(data[c] ?? '').trim()) throw new ApiError(`El campo "${c}" es obligatorio`);
  const nums = ['stock_minimo', 'stock_maximo', 'demanda_promedio', 'demanda_maxima', 'tiempo_entrega', 'vida_util_dias'];
  for (const c of nums) {
    if (data[c] === '' || data[c] === undefined || Number.isNaN(Number(data[c])) || Number(data[c]) < 0) {
      throw new ApiError(`El campo "${c}" debe ser un número mayor o igual a 0`);
    }
  }
  if (Number(data.stock_maximo) <= Number(data.stock_minimo)) throw new ApiError('El stock máximo debe ser mayor que el mínimo');
  if (Number(data.demanda_maxima) < Number(data.demanda_promedio)) throw new ApiError('La demanda máxima no puede ser menor que la promedio');
  if (Number(data.tiempo_entrega) < 1) throw new ApiError('El tiempo de entrega debe ser de al menos 1 día');
}

function normalizarMaterial(data) {
  return {
    codigo: String(data.codigo).trim().toUpperCase(),
    nombre: String(data.nombre).trim(),
    categoria: String(data.categoria).trim(),
    unidad: String(data.unidad).trim(),
    stock_minimo: Number(data.stock_minimo),
    stock_maximo: Number(data.stock_maximo),
    demanda_promedio: Number(data.demanda_promedio),
    demanda_maxima: Number(data.demanda_maxima),
    tiempo_entrega: Number(data.tiempo_entrega),
    vida_util_dias: Number(data.vida_util_dias),
  };
}

// ---------- "Endpoints" ----------

export const dbJsonApi = {
  modo: 'dbjson',

  async getMateriales() {
    await leer();
    const ex = calcularExistencias();
    return copia(db.materiales.map((m) => materialConStock(m, ex)));
  },

  async getMaterial(id) {
    await leer();
    return copia(materialConStock(buscarMaterial(id)));
  },

  async createMaterial(data) {
    await leer();
    validarMaterial(data);
    const nuevo = { id: siguienteId(db.materiales), ...normalizarMaterial(data) };
    if (db.materiales.some((m) => m.codigo === nuevo.codigo)) throw new ApiError('Ya existe un material con ese código', 409);
    await pedir('/materiales', { method: 'POST', body: nuevo });
    db.materiales.push(nuevo);
    return copia(materialConStock(nuevo));
  },

  async updateMaterial(id, data) {
    await leer();
    const m = buscarMaterial(id);
    validarMaterial(data);
    const cambios = normalizarMaterial(data);
    if (db.materiales.some((x) => x.codigo === cambios.codigo && x.id !== m.id)) throw new ApiError('Ya existe un material con ese código', 409);
    Object.assign(m, cambios);
    await pedir(`/materiales/${m.id}`, { method: 'PUT', body: m });
    return copia(materialConStock(m));
  },

  async getTrazabilidad(id) {
    await leer();
    const m = buscarMaterial(id);
    const ex = calcularExistencias();
    const movimientos = db.movimientos
      .filter((x) => x.material_id === m.id)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .map(enriquecerMovimiento);
    return copia({
      material: materialConStock(m, ex),
      existencias: ex.filter((e) => e.material_id === m.id),
      movimientos,
    });
  },

  async getExistencias(materialId) {
    await leer();
    return copia(calcularExistencias().filter((e) => e.material_id === Number(materialId)));
  },

  async getBodegas() { return pedir('/bodegas'); },
  async getProveedores() { return pedir('/proveedores'); },

  async getLotes() {
    await leer();
    return copia(calcularExistencias());
  },

  async getMovimientos() {
    await leer();
    return copia([...db.movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha)).map(enriquecerMovimiento));
  },

  async createMovimiento(data) {
    await leer();
    const tipo = data.tipo;
    if (!['entrada', 'salida', 'traslado', 'ajuste'].includes(tipo)) throw new ApiError('Tipo de movimiento inválido');
    const material = buscarMaterial(data.material_id);
    const cantidad = Number(data.cantidad);
    if (!cantidad || cantidad <= 0 || !Number.isFinite(cantidad)) throw new ApiError('La cantidad debe ser mayor que 0');
    if (!String(data.usuario ?? '').trim()) throw new ApiError('El usuario es obligatorio');
    if (!String(data.documento_ref ?? '').trim()) throw new ApiError('El documento de origen es obligatorio');

    const nuevo = {
      id: siguienteId(db.movimientos),
      fecha: fechaHoraLocal(),
      tipo,
      material_id: material.id,
      lote_id: null,
      bodega_origen_id: null,
      bodega_destino_id: null,
      cantidad,
      usuario: data.usuario.trim(),
      documento_tipo: data.documento_tipo,
      documento_ref: data.documento_ref.trim(),
      observacion: data.observacion?.trim() ?? '',
    };

    if (tipo === 'entrada') {
      if (!data.bodega_destino_id) throw new ApiError('Seleccione la bodega de destino');
      if (!data.codigo_lote?.trim()) throw new ApiError('El código de lote es obligatorio en una entrada');
      if (!data.fecha_vencimiento) throw new ApiError('La fecha de vencimiento es obligatoria en una entrada');
      if (diasParaVencer(data.fecha_vencimiento) < 0) throw new ApiError('No se puede recibir un lote que ya está vencido');
      const codigo = data.codigo_lote.trim().toUpperCase();
      let lote = db.lotes.find((l) => l.material_id === material.id && l.codigo_lote === codigo);
      if (lote && lote.fecha_vencimiento !== data.fecha_vencimiento) {
        throw new ApiError('Ese lote ya existe con otra fecha de vencimiento');
      }
      if (!lote) {
        const oc = db.ordenes.find((o) => o.codigo === nuevo.documento_ref.toUpperCase());
        lote = { id: siguienteId(db.lotes), codigo_lote: codigo, material_id: material.id, fecha_vencimiento: data.fecha_vencimiento, oc_id: oc?.id ?? null };
        await pedir('/lotes', { method: 'POST', body: lote });
        db.lotes.push(lote);
      }
      nuevo.lote_id = lote.id;
      nuevo.bodega_destino_id = Number(data.bodega_destino_id);
    } else {
      // salida, traslado y ajuste parten de una existencia (lote en una bodega)
      const loteId = Number(data.lote_id);
      const bodegaId = Number(data.bodega_origen_id);
      const existencia = calcularExistencias().find((e) => e.lote_id === loteId && e.bodega_id === bodegaId);
      if (!existencia || existencia.material_id !== material.id) throw new ApiError('Seleccione un lote con existencias');
      nuevo.lote_id = loteId;

      if (tipo === 'salida') {
        if (existencia.dias_para_vencer < 0) throw new ApiError('No se puede despachar un lote vencido. Use un ajuste para darlo de baja.');
        if (cantidad > existencia.cantidad) throw new ApiError(`Solo hay ${existencia.cantidad} ${material.unidad} en ese lote y bodega`);
        nuevo.bodega_origen_id = bodegaId;
      }
      if (tipo === 'traslado') {
        if (!data.bodega_destino_id) throw new ApiError('Seleccione la bodega de destino');
        if (Number(data.bodega_destino_id) === bodegaId) throw new ApiError('El destino debe ser distinto del origen');
        if (existencia.dias_para_vencer < 0) throw new ApiError('No se puede trasladar un lote vencido');
        if (cantidad > existencia.cantidad) throw new ApiError(`Solo hay ${existencia.cantidad} ${material.unidad} en ese lote y bodega`);
        nuevo.bodega_origen_id = bodegaId;
        nuevo.bodega_destino_id = Number(data.bodega_destino_id);
      }
      if (tipo === 'ajuste') {
        const signo = data.sentido === 'positivo' ? 1 : -1;
        if (signo < 0 && cantidad > existencia.cantidad) throw new ApiError(`El ajuste no puede dejar el lote en negativo (hay ${existencia.cantidad})`);
        if (!nuevo.observacion) throw new ApiError('Indique el motivo del ajuste');
        nuevo.cantidad = signo * cantidad;
        nuevo.bodega_destino_id = bodegaId;
      }
    }

    await pedir('/movimientos', { method: 'POST', body: nuevo });
    db.movimientos.push(nuevo);
    return copia({ movimiento: enriquecerMovimiento(nuevo), material: materialConStock(material) });
  },

  async getOrdenes() {
    await leer();
    return copia([...db.ordenes].sort((a, b) => b.fecha.localeCompare(a.fecha)).map(enriquecerOrden));
  },

  async createOrden(data) {
    await leer();
    const material = buscarMaterial(data.material_id);
    if (!db.proveedores.some((p) => p.id === Number(data.proveedor_id))) throw new ApiError('Seleccione un proveedor');
    if (!(Number(data.cantidad) > 0)) throw new ApiError('La cantidad debe ser mayor que 0');
    if (!(Number(data.precio_unitario) > 0)) throw new ApiError('El precio unitario debe ser mayor que 0');
    if (!data.fecha) throw new ApiError('La fecha es obligatoria');
    const numero = db.ordenes.reduce((max, o) => Math.max(max, Number(o.codigo.split('-')[1])), 2000) + 1;
    const nueva = {
      id: siguienteId(db.ordenes),
      codigo: `OC-${numero}`,
      fecha: data.fecha,
      proveedor_id: Number(data.proveedor_id),
      material_id: material.id,
      cantidad: Number(data.cantidad),
      precio_unitario: Number(data.precio_unitario),
      estado: 'pendiente',
      solicitante: data.solicitante?.trim() || 'Bodega Central',
    };
    const duplicados = buscarDuplicados([nueva, ...db.ordenes], db.configuracion)
      .filter((p) => p.oc_a.id === nueva.id || p.oc_b.id === nueva.id)
      .map((p) => (p.oc_a.id === nueva.id ? p.oc_b.codigo : p.oc_a.codigo));
    await pedir('/ordenes', { method: 'POST', body: nueva });
    db.ordenes.push(nueva);
    return copia({ orden: enriquecerOrden(nueva), posibles_duplicados: duplicados });
  },

  async recibirOrden(id, data) {
    await leer();
    const oc = db.ordenes.find((o) => o.id === Number(id));
    if (!oc) throw new ApiError('Orden no encontrada', 404);
    if (oc.estado === 'recibida') throw new ApiError('Esta orden ya fue recibida');
    const r = await this.createMovimiento({
      tipo: 'entrada',
      material_id: oc.material_id,
      cantidad: oc.cantidad,
      bodega_destino_id: data.bodega_destino_id,
      codigo_lote: data.codigo_lote,
      fecha_vencimiento: data.fecha_vencimiento,
      usuario: data.usuario,
      documento_tipo: 'OC',
      documento_ref: oc.codigo,
      observacion: `Recepción de ${oc.codigo}`,
    });
    const actualizada = await pedir(`/ordenes/${oc.id}`, { method: 'PATCH', body: { estado: 'recibida' } });
    return copia({ orden: enriquecerOrden(actualizada), movimiento: r.movimiento });
  },

  async getPosiblesDuplicados() {
    await leer();
    return copia(
      buscarDuplicados(db.ordenes, db.configuracion).map((p) => ({
        ...p,
        oc_a: enriquecerOrden(p.oc_a),
        oc_b: enriquecerOrden(p.oc_b),
        regla: `Mismo proveedor y material, cantidad ±${db.configuracion.duplicado_tolerancia_pct}% y fechas a ≤ ${db.configuracion.duplicado_dias} días`,
      }))
    );
  },

  async getAlertasReorden() {
    await leer();
    const ex = calcularExistencias();
    return copia(
      db.materiales
        .map((m) => materialConStock(m, ex))
        .filter((m) => m.stock_disponible <= m.punto_reorden)
        .map((m) => ({ ...m, cantidad_sugerida: cantidadSugerida(m.stock_disponible, m.stock_maximo) }))
        .sort((a, b) => a.stock_disponible / (a.punto_reorden || 1) - b.stock_disponible / (b.punto_reorden || 1))
    );
  },

  async getAlertasVencimiento() {
    await leer();
    return copia(calcularExistencias().filter((e) => e.estado_vencimiento === 'vencido' || e.estado_vencimiento === 'critico'));
  },

  async getConfiguracion() { return pedir('/configuracion'); },

  async updateConfiguracion(data) {
    const c = {
      dias_alerta_critica: Number(data.dias_alerta_critica),
      dias_alerta_proxima: Number(data.dias_alerta_proxima),
      duplicado_dias: Number(data.duplicado_dias),
      duplicado_tolerancia_pct: Number(data.duplicado_tolerancia_pct),
      usuario_actual: String(data.usuario_actual ?? '').trim() || 'usuario',
    };
    if (Object.entries(c).some(([k, v]) => k !== 'usuario_actual' && (!Number.isFinite(v) || v < 0))) {
      throw new ApiError('Todos los valores deben ser números mayores o iguales a 0');
    }
    if (c.dias_alerta_proxima <= c.dias_alerta_critica) throw new ApiError('Los días de "próximo" deben ser mayores que los de "crítico"');
    return pedir('/configuracion', { method: 'PUT', body: c });
  },
};
