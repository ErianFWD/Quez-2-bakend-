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

export default router;
