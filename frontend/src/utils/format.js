import { parseFecha } from './inventario.js';

const crc = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('es-CR');

export const fmtColones = (n) => crc.format(Number(n) || 0);
export const fmtNum = (n) => num.format(Number(n) || 0);

export function fmtFecha(iso) {
  if (!iso) return '—';
  const f = parseFecha(iso);
  return f.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtFechaHora(iso) {
  if (!iso) return '—';
  const f = new Date(iso);
  return f.toLocaleString('es-CR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function textoDias(dias) {
  if (dias < 0) return `Venció hace ${Math.abs(dias)} d`;
  if (dias === 0) return 'Vence hoy';
  return `${dias} d`;
}

export const ETIQUETAS = {
  stock: {
    ok: { texto: 'Stock sano', tono: 'ok' },
    reordenar: { texto: 'Reordenar', tono: 'warn' },
    agotado: { texto: 'Agotado', tono: 'danger' },
    sobrestock: { texto: 'Sobrestock', tono: 'info' },
  },
  vencimiento: {
    vencido: { texto: 'Vencido', tono: 'danger' },
    critico: { texto: 'Vence pronto', tono: 'warn' },
    proximo: { texto: 'Próximo', tono: 'info' },
    vigente: { texto: 'Vigente', tono: 'ok' },
  },
  movimiento: {
    entrada: { texto: 'Entrada', tono: 'ok' },
    salida: { texto: 'Salida', tono: 'danger' },
    traslado: { texto: 'Traslado', tono: 'info' },
    ajuste: { texto: 'Ajuste', tono: 'neutral' },
  },
  orden: {
    pendiente: { texto: 'Pendiente', tono: 'warn' },
    recibida: { texto: 'Recibida', tono: 'ok' },
  },
};
