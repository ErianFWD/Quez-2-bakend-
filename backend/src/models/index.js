// TODO (back end): definir aquí los modelos de Sequelize y sus relaciones.
// Tablas sugeridas (ver API_CONTRACT.md y los campos de frontend/db.json):
//   bodegas, proveedores, materiales, ordenes_compra, lotes, movimientos, configuracion
// Relaciones:
//   material 1─N lotes · material 1─N ordenes_compra · proveedor 1─N ordenes_compra
//   orden_compra 1─N lotes (de qué OC viene cada lote) · lote 1─N movimientos
//   bodega 1─N movimientos (como origen y como destino)
// El stock NO se guarda en una columna: se calcula sumando movimientos.
import { sequelize } from '../config/database.js';

export { sequelize };
