 feat_yubran
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cliente = sequelize.define('cliente', {
  id_cliente: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  telefono: { type: DataTypes.STRING(30), allowNull: true },
  correo: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  direccion: { type: DataTypes.STRING(250), allowNull: true },
});

const Trabajador = sequelize.define('trabajador', {
  id_trabajador: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  cargo: { type: DataTypes.STRING(100), allowNull: false },
  salario: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  sucursal: { type: DataTypes.STRING(150), allowNull: true },
  horario: { type: DataTypes.STRING(100), allowNull: true },
});

const ClienteTrabajador = sequelize.define('cliente_x_trabajador', {
  id_cliente_trabajador: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  id_cliente: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  id_trabajador: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  fecha_relacion: { type: DataTypes.DATEONLY, allowNull: false },
});

const Producto = sequelize.define('producto', {
  id_producto: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  descripcion: { type: DataTypes.STRING(250), allowNull: true },
  precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  unidad: { type: DataTypes.STRING(50), allowNull: false },
  precio_base: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  demanda_promedio: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  demanda_maxima: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  // Extensiones requeridas por el contrato actual del frontend.
  codigo: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  categoria: { type: DataTypes.ENUM('Selladores', 'Adhesivos', 'Impermeabilizantes', 'Aditivos'), allowNull: false },
  tiempo_entrega: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
  vida_util_dias: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
});

const Proveedor = sequelize.define('proveedor', {
  id_proveedor: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  telefono: { type: DataTypes.STRING(30), allowNull: true },
  correo: { type: DataTypes.STRING(150), allowNull: true },
  ubicacion: { type: DataTypes.STRING(250), allowNull: true },
});

const Bodega = sequelize.define('bodega', {
  id_bodega: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  ubicacion: { type: DataTypes.STRING(250), allowNull: true },
  tipo: { type: DataTypes.ENUM('bodega', 'obra'), allowNull: false, defaultValue: 'bodega' },
});

const Inventario = sequelize.define('inventario', {
  id_inventario: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  id_producto: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  id_bodega: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  stock: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  stock_minimo: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  // El DER recibido muestra fecha_maximo DATE. Se conserva en BD y además
  // stock_maximo se agrega por compatibilidad con el contrato del frontend.
  fecha_maximo: { type: DataTypes.DATEONLY, allowNull: true },
  stock_maximo: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
}, { indexes: [{ unique: true, fields: ['id_producto', 'id_bodega'] }] });

const OrdenCompra = sequelize.define('orden_compra', {
  id_orden_compra: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  id_proveedor: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  id_bodega: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  estado: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'pendiente' },
  codigo: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  solicitante: { type: DataTypes.STRING(120), allowNull: false },
});

const DetalleOrdenCompra = sequelize.define('detalle_orden_compra', {
  id_detalle_orden: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  id_orden_compra: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  id_producto: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  cantidad: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  tiempo_entrega: { type: DataTypes.INTEGER, allowNull: true },
});

const LoteMercancia = sequelize.define('lote_mercancia', {
  id_lote: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  id_producto: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  id_bodega: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  codigo_lote: { type: DataTypes.STRING(100), allowNull: false },
  cantidad: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  fecha_ingreso: { type: DataTypes.DATEONLY, allowNull: false },
  fecha_vencimiento: { type: DataTypes.DATEONLY, allowNull: false },
  estado: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'vigente' },
  id_orden_compra: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
}, { indexes: [{ unique: true, fields: ['id_producto', 'codigo_lote'] }] });

const MovimientoInventario = sequelize.define('movimiento_inventario', {
  id_movimiento: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  id_lote: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  id_producto: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  id_bodega: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  tipo_movimiento: { type: DataTypes.STRING(50), allowNull: false },
  cantidad: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  fecha_movimiento: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  referencia: { type: DataTypes.STRING(100), allowNull: false },
  observacion: { type: DataTypes.STRING(250), allowNull: true },
  usuario: { type: DataTypes.STRING(80), allowNull: false },
  bodega_origen_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  bodega_destino_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  documento_tipo: { type: DataTypes.STRING(60), allowNull: false },
  documento_ref: { type: DataTypes.STRING(80), allowNull: false },
});


const Configuracion = sequelize.define('configuracion', {
  id: { type: DataTypes.TINYINT.UNSIGNED, primaryKey: true, defaultValue: 1 },
  dias_alerta_critica: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 30 },
  dias_alerta_proxima: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 90 },
  duplicado_dias: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 3 },
  duplicado_tolerancia_pct: { type: DataTypes.DECIMAL(6, 2), allowNull: false, defaultValue: 10 },
  usuario_actual: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'usuario' },
});

const Factura = sequelize.define('factura', {
  id_factura: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  id_cliente: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  id_trabajador: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  impuesto: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  estado: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'emitida' },
});

const DetalleFactura = sequelize.define('detalle_factura', {
  id_detalle_factura: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  id_factura: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  id_producto: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  cantidad: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  descuento: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
});

Cliente.hasMany(Factura, { foreignKey: 'id_cliente', as: 'facturas' });
Factura.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });
Trabajador.hasMany(Factura, { foreignKey: 'id_trabajador', as: 'facturas' });
Factura.belongsTo(Trabajador, { foreignKey: 'id_trabajador', as: 'trabajador' });
Cliente.hasMany(ClienteTrabajador, { foreignKey: 'id_cliente', as: 'relaciones' });
ClienteTrabajador.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });
Trabajador.hasMany(ClienteTrabajador, { foreignKey: 'id_trabajador', as: 'relaciones' });
ClienteTrabajador.belongsTo(Trabajador, { foreignKey: 'id_trabajador', as: 'trabajador' });

Producto.hasMany(DetalleFactura, { foreignKey: 'id_producto', as: 'detallesFactura' });
DetalleFactura.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });
Factura.hasMany(DetalleFactura, { foreignKey: 'id_factura', as: 'detalles' });
DetalleFactura.belongsTo(Factura, { foreignKey: 'id_factura', as: 'factura' });

Producto.hasMany(Inventario, { foreignKey: 'id_producto', as: 'inventarios' });
Inventario.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });
Bodega.hasMany(Inventario, { foreignKey: 'id_bodega', as: 'inventarios' });
Inventario.belongsTo(Bodega, { foreignKey: 'id_bodega', as: 'bodega' });

Proveedor.hasMany(OrdenCompra, { foreignKey: 'id_proveedor', as: 'ordenes' });
OrdenCompra.belongsTo(Proveedor, { foreignKey: 'id_proveedor', as: 'proveedor' });
Bodega.hasMany(OrdenCompra, { foreignKey: 'id_bodega', as: 'ordenes' });
OrdenCompra.belongsTo(Bodega, { foreignKey: 'id_bodega', as: 'bodega' });
OrdenCompra.hasMany(DetalleOrdenCompra, { foreignKey: 'id_orden_compra', as: 'detalles' });
DetalleOrdenCompra.belongsTo(OrdenCompra, { foreignKey: 'id_orden_compra', as: 'orden' });
Producto.hasMany(DetalleOrdenCompra, { foreignKey: 'id_producto', as: 'detallesOrden' });
DetalleOrdenCompra.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });

Producto.hasMany(LoteMercancia, { foreignKey: 'id_producto', as: 'lotes' });
LoteMercancia.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });
Bodega.hasMany(LoteMercancia, { foreignKey: 'id_bodega', as: 'lotes' });
LoteMercancia.belongsTo(Bodega, { foreignKey: 'id_bodega', as: 'bodega' });
OrdenCompra.hasMany(LoteMercancia, { foreignKey: 'id_orden_compra', as: 'lotes' });
LoteMercancia.belongsTo(OrdenCompra, { foreignKey: 'id_orden_compra', as: 'ordenCompra' });

Producto.hasMany(MovimientoInventario, { foreignKey: 'id_producto', as: 'movimientos' });
MovimientoInventario.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });
LoteMercancia.hasMany(MovimientoInventario, { foreignKey: 'id_lote', as: 'movimientos' });
MovimientoInventario.belongsTo(LoteMercancia, { foreignKey: 'id_lote', as: 'lote' });
Bodega.hasMany(MovimientoInventario, { foreignKey: 'id_bodega', as: 'movimientos' });
MovimientoInventario.belongsTo(Bodega, { foreignKey: 'id_bodega', as: 'bodega' });
MovimientoInventario.belongsTo(Bodega, { foreignKey: 'bodega_origen_id', as: 'bodegaOrigen' });
MovimientoInventario.belongsTo(Bodega, { foreignKey: 'bodega_destino_id', as: 'bodegaDestino' });

export {
  sequelize, Cliente, Trabajador, ClienteTrabajador, Producto, Proveedor, Bodega,
  Inventario, OrdenCompra, DetalleOrdenCompra, LoteMercancia, MovimientoInventario,
  Factura, DetalleFactura, Configuracion,
};

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
 main
