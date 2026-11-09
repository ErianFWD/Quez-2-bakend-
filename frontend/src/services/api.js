// Punto único de acceso a datos del frontend.
// Las páginas SOLO llaman a "api.algo()" y no saben de dónde vienen los datos:
//   VITE_FUENTE_DATOS=dbjson → db.json servido por json-server (mientras se hace el back end)
//   VITE_FUENTE_DATOS=api    → back end real (Node + Express + MySQL + Sequelize)
import { dbJsonApi } from './dbJsonApi.js';

 feat_yubran
const FUENTE = import.meta.env.VITE_FUENTE_DATOS === 'dbjson' ? 'dbjson' : 'api';

const FUENTE = import.meta.env.VITE_FUENTE_DATOS === 'api' ? 'api' : 'dbjson';
 main
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');
const DBJSON_URL = (import.meta.env.VITE_DBJSON_URL || 'http://localhost:3001').replace(/\/$/, '');

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
};

export const api = FUENTE === 'api' ? realApi : dbJsonApi;
export const API_INFO = { modo: FUENTE, baseUrl: FUENTE === 'api' ? BASE_URL : DBJSON_URL };
