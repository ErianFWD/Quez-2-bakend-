// Reglas de negocio de inventario (las mismas que debe aplicar el back end).
// Fórmulas del enunciado:
//   SS = (demanda diaria máxima − demanda diaria promedio) × tiempo de entrega
//   PR = demanda diaria promedio × tiempo de entrega + SS

export function calcStockSeguridad(demandaMaxima, demandaPromedio, tiempoEntrega) {
  const ss = (Number(demandaMaxima) - Number(demandaPromedio)) * Number(tiempoEntrega);
  return Math.max(0, Math.round(ss));
}

export function calcPuntoReorden(demandaPromedio, tiempoEntrega, stockSeguridad) {
  return Math.round(Number(demandaPromedio) * Number(tiempoEntrega) + Number(stockSeguridad));
}

// Estado del stock según el punto de reorden.
// Se evalúa con el stock DISPONIBLE (sin contar lotes vencidos).
export function estadoStock(disponible, puntoReorden, stockMaximo) {
  if (disponible <= 0) return 'agotado';
  if (disponible <= puntoReorden) return 'reordenar';
  if (stockMaximo && disponible > stockMaximo) return 'sobrestock';
  return 'ok';
}

// Cantidad sugerida para reponer: llevar el stock hasta el máximo.
export function cantidadSugerida(disponible, stockMaximo) {
  return Math.max(0, Number(stockMaximo) - Number(disponible));
}

// Convierte 'YYYY-MM-DD' a fecha local (sin problemas de zona horaria).
export function parseFecha(iso) {
  if (!iso) return null;
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function hoyISO(base = new Date()) {
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, '0');
  const d = String(base.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function sumarDias(iso, dias) {
  const f = parseFecha(iso);
  f.setDate(f.getDate() + dias);
  return hoyISO(f);
}

export function diasParaVencer(fechaVencimiento, hoy = new Date()) {
  const venc = parseFecha(fechaVencimiento);
  const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((venc - base) / 86400000);
}

// Semáforo de vencimiento. Los umbrales vienen de la configuración.
export function estadoVencimiento(dias, cfg = { dias_alerta_critica: 30, dias_alerta_proxima: 90 }) {
  if (dias < 0) return 'vencido';
  if (dias <= cfg.dias_alerta_critica) return 'critico';
  if (dias <= cfg.dias_alerta_proxima) return 'proximo';
  return 'vigente';
}

// FEFO (First Expired, First Out): sale primero lo que vence primero.
export function ordenarFEFO(lotes) {
  return [...lotes].sort((a, b) => parseFecha(a.fecha_vencimiento) - parseFecha(b.fecha_vencimiento));
}

// Lote sugerido para una salida: el que vence primero y que todavía no está vencido.
export function loteSugeridoFEFO(existencias, hoy = new Date()) {
  return ordenarFEFO(existencias).find(
    (e) => e.cantidad > 0 && diasParaVencer(e.fecha_vencimiento, hoy) >= 0
  ) || null;
}

// Regla de posibles compras duplicadas:
// mismo proveedor + mismo material + cantidad parecida (± tolerancia %) + fechas cercanas (≤ N días).
export function esPosibleDuplicado(a, b, regla = { duplicado_dias: 3, duplicado_tolerancia_pct: 10 }) {
  if (a.id === b.id) return null;
  if (a.proveedor_id !== b.proveedor_id || a.material_id !== b.material_id) return null;
  const dias = Math.abs(Math.round((parseFecha(a.fecha) - parseFecha(b.fecha)) / 86400000));
  if (dias > regla.duplicado_dias) return null;
  const mayor = Math.max(a.cantidad, b.cantidad);
  const difPct = mayor === 0 ? 0 : (Math.abs(a.cantidad - b.cantidad) / mayor) * 100;
  if (difPct > regla.duplicado_tolerancia_pct) return null;
  return { diferencia_dias: dias, diferencia_cantidad_pct: Math.round(difPct * 10) / 10 };
}

export function buscarDuplicados(ordenes, regla) {
  const pares = [];
  for (let i = 0; i < ordenes.length; i++) {
    for (let j = i + 1; j < ordenes.length; j++) {
      const r = esPosibleDuplicado(ordenes[i], ordenes[j], regla);
      if (r) pares.push({ oc_a: ordenes[i], oc_b: ordenes[j], ...r });
    }
  }
  return pares;
}
