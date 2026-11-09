// Punto único de acceso a datos del frontend.
// Las páginas SOLO llaman a "api.algo()" y no saben si los datos vienen
// del back end real o del modo demostración.
import { mockApi } from './mockApi.js';

const USAR_DEMO = import.meta.env.VITE_USE_MOCK !== 'false';
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

async function http(ruta, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${ruta}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(`No se pudo conectar con la API (${BASE_URL}). ¿Está encendido el back end?`);
  }
  const datos = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(datos?.error || datos?.message || `Error ${res.status} en ${method} ${ruta}`);
  }
  return datos;
}

const realApi = {
  modo: 'api',
  getMateriales: () => http('/materiales'),
  getMaterial: (id) => http(`/materiales/${id}`),
  createMaterial: (data) => http('/materiales', { method: 'POST', body: data }),
  updateMaterial: (id, data) => http(`/materiales/${id}`, { method: 'PUT', body: data }),
  getTrazabilidad: (id) => http(`/materiales/${id}/trazabilidad`),
  getExistencias: (id) => http(`/materiales/${id}/existencias`),
  getBodegas: () => http('/bodegas'),
  getProveedores: () => http('/proveedores'),
  getLotes: () => http('/lotes'),
  getMovimientos: () => http('/movimientos'),
  createMovimiento: (data) => http('/movimientos', { method: 'POST', body: data }),
  getOrdenes: () => http('/ordenes'),
  createOrden: (data) => http('/ordenes', { method: 'POST', body: data }),
  recibirOrden: (id, data) => http(`/ordenes/${id}/recibir`, { method: 'POST', body: data }),
  getPosiblesDuplicados: () => http('/ordenes/posibles-duplicados'),
  getAlertasReorden: () => http('/alertas/reorden'),
  getAlertasVencimiento: () => http('/alertas/vencimientos'),
  getConfiguracion: () => http('/configuracion'),
  updateConfiguracion: (data) => http('/configuracion', { method: 'PUT', body: data }),
  resetDemo: async () => { throw new Error('Reiniciar datos solo está disponible en modo demostración'); },
};

export const api = USAR_DEMO ? mockApi : realApi;
export const API_INFO = { modo: USAR_DEMO ? 'demo' : 'api', baseUrl: BASE_URL };
