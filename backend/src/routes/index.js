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

export default router;
