feat_yubran
import { Router } from 'express';
import * as c from '../controllers/index.js';
const router=Router();
// Express 4 necesita reenviar las promesas rechazadas al middleware de errores.
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
router.get('/salud',asyncRoute(c.salud));
router.get('/materiales',asyncRoute(c.getMateriales));
router.get('/materiales/:id/existencias',asyncRoute(c.getExistencias));
router.get('/materiales/:id/trazabilidad',asyncRoute(c.getTrazabilidad));
router.get('/materiales/:id',asyncRoute(c.getMaterial));
router.post('/materiales',asyncRoute(c.postMaterial));
router.put('/materiales/:id',asyncRoute(c.putMaterial));
router.get('/lotes',asyncRoute(c.getLotes));
router.get('/movimientos',asyncRoute(c.getMovimientos));
router.post('/movimientos',asyncRoute(c.postMovimiento));
router.get('/ordenes/posibles-duplicados',asyncRoute(c.getDuplicados));
router.get('/ordenes',asyncRoute(c.getOrdenes));
router.post('/ordenes',asyncRoute(c.postOrden));
router.post('/ordenes/:id/recibir',asyncRoute(c.postRecibirOrden));
router.get('/alertas/reorden',asyncRoute(c.getReorden));
router.get('/alertas/vencimientos',asyncRoute(c.getVencimientos));
router.get('/bodegas',asyncRoute(c.getBodegas));
router.get('/proveedores',asyncRoute(c.getProveedores));
router.get('/configuracion',asyncRoute(c.getConfiguracion));
router.put('/configuracion',asyncRoute(c.putConfiguracion));

// Rutas que espera el frontend (ver API_CONTRACT.md).
// Cada una responde 501 "Pendiente" hasta que se implemente en controllers/ y services/.
import { Router } from 'express';

const router = Router();
const pendiente = (ruta) => (req, res) =>
  res.status(501).json({ error: `Pendiente de implementar: ${req.method} ${ruta}` });

const rutas = [
  ['get', '/materiales'],
  ['get', '/materiales/:id'],
  ['post', '/materiales'],
  ['put', '/materiales/:id'],
  ['get', '/materiales/:id/existencias'],
  ['get', '/materiales/:id/trazabilidad'],
  ['get', '/lotes'],
  ['get', '/movimientos'],
  ['post', '/movimientos'],
  ['get', '/ordenes/posibles-duplicados'], // va antes de /ordenes/:id
  ['get', '/ordenes'],
  ['post', '/ordenes'],
  ['post', '/ordenes/:id/recibir'],
  ['get', '/alertas/reorden'],
  ['get', '/alertas/vencimientos'],
  ['get', '/bodegas'],
  ['get', '/proveedores'],
  ['get', '/configuracion'],
  ['put', '/configuracion'],
];

for (const [metodo, ruta] of rutas) router[metodo](ruta, pendiente(ruta));

 main
export default router;
