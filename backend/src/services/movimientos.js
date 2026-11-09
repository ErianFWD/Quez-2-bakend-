import { Op } from 'sequelize';
import { sequelize, Producto, LoteMercancia, MovimientoInventario, Bodega, OrdenCompra, Proveedor, Inventario } from '../models/index.js';
import { calcularExistencias, materialConStock } from './materiales.js';
import { cleanString, error, isPositive, plain, formatMovimiento } from './helpers.js';
import { diasParaVencer } from './inventario.js';

async function existenciaDe(loteId,bodegaId,config){return (await calcularExistencias(config)).find(e=>e.lote_id===Number(loteId)&&e.bodega_id===Number(bodegaId));}
async function sincronizarInventario(productoId,config,transaction){
  const ex=await calcularExistencias(config);const propias=ex.filter(e=>e.material_id===Number(productoId));const bodegas=await Bodega.findAll({transaction});
  const producto=await Producto.findByPk(productoId,{transaction});
  for(const b of bodegas){let row=await Inventario.findOne({where:{id_producto:productoId,id_bodega:b.id_bodega},transaction});if(!row){row=await Inventario.create({id_producto:productoId,id_bodega:b.id_bodega,stock:0,stock_minimo:0,stock_maximo:0}, {transaction});}const cantidad=propias.filter(e=>e.bodega_id===b.id_bodega).reduce((s,e)=>s+Number(e.cantidad),0);row.stock=cantidad;await row.save({transaction});}
  return producto;
}

export async function listarMovimientos(){
 const rows=await MovimientoInventario.findAll({include:[{model:Producto,as:'producto'},{model:LoteMercancia,as:'lote',include:[{model:OrdenCompra,as:'ordenCompra',include:[{model:Proveedor,as:'proveedor'}]}]},{model:Bodega,as:'bodegaOrigen'},{model:Bodega,as:'bodegaDestino'}],order:[['fecha_movimiento','DESC'],['id_movimiento','DESC']]});
 return rows.map(m=>{const l=plain(m.lote),oc=plain(l?.ordenCompra),p=plain(oc?.proveedor);return formatMovimiento(m,{producto:plain(m.producto),lote:l,bodegaOrigen:plain(m.bodegaOrigen),bodegaDestino:plain(m.bodegaDestino),oc,proveedor:p});});
}

export async function crearMovimiento(data,config){
 const tipo=cleanString(data.tipo);if(!['entrada','salida','traslado','ajuste'].includes(tipo))throw error('Tipo de movimiento inválido');
 const producto=await Producto.findByPk(data.material_id);if(!producto||!producto.activo)throw error('Material no encontrado',404);
 if(!isPositive(data.cantidad))throw error('La cantidad debe ser mayor que 0');if(!cleanString(data.usuario))throw error('El usuario es obligatorio');if(!cleanString(data.documento_ref))throw error('El documento de origen es obligatorio');if(!cleanString(data.documento_tipo))throw error('El tipo de documento es obligatorio');
 let id;
 await sequelize.transaction(async t=>{
  let base={id_producto:producto.id_producto,id_lote:null,id_bodega:data.bodega_destino_id||data.bodega_origen_id||null,tipo_movimiento:tipo,cantidad:Number(data.cantidad),usuario:cleanString(data.usuario),documento_tipo:cleanString(data.documento_tipo),documento_ref:cleanString(data.documento_ref),referencia:cleanString(data.referencia)||cleanString(data.documento_ref),observacion:cleanString(data.observacion),bodega_origen_id:null,bodega_destino_id:null};
  if(tipo==='entrada'){
   const b=await Bodega.findByPk(data.bodega_destino_id,{transaction:t});if(!b)throw error('Bodega de destino no encontrada',404);if(!cleanString(data.codigo_lote))throw error('El código de lote es obligatorio en una entrada');if(!data.fecha_vencimiento)throw error('La fecha de vencimiento es obligatoria en una entrada');if(diasParaVencer(data.fecha_vencimiento)<0)throw error('No se puede recibir un lote que ya está vencido');
   const codigo=cleanString(data.codigo_lote).toUpperCase();let lote=await LoteMercancia.findOne({where:{id_producto:producto.id_producto,id_bodega:b.id_bodega,codigo_lote:codigo},transaction:t});
   if(lote&&String(lote.fecha_vencimiento).slice(0,10)!==String(data.fecha_vencimiento).slice(0,10))throw error('Ese lote ya existe con otra fecha de vencimiento');
   if(!lote){const oc=await OrdenCompra.findOne({where:{codigo:base.documento_ref.toUpperCase()},transaction:t});lote=await LoteMercancia.create({id_producto:producto.id_producto,id_bodega:b.id_bodega,codigo_lote:codigo,cantidad:0,fecha_ingreso:new Date(),fecha_vencimiento:data.fecha_vencimiento,estado:'vigente',id_orden_compra:oc?.id_orden_compra??null},{transaction:t});}
   base.id_lote=lote.id_lote;base.id_bodega=b.id_bodega;base.bodega_destino_id=b.id_bodega;
  } else {
   if(!data.lote_id)throw error('El lote es obligatorio');if(!data.bodega_origen_id)throw error('Seleccione la bodega de origen');const lote=await LoteMercancia.findByPk(data.lote_id,{transaction:t});if(!lote||Number(lote.id_producto)!==Number(producto.id_producto))throw error('Seleccione un lote válido para el material');const ex=await existenciaDe(lote.id_lote,data.bodega_origen_id,config);if(!ex)throw error('Seleccione un lote con existencias');
   if((tipo==='salida'||tipo==='traslado')&&ex.dias_para_vencer<0)throw error('No se puede despachar un lote vencido. Use un ajuste para darlo de baja.');if((tipo==='salida'||tipo==='traslado')&&Number(data.cantidad)>ex.cantidad)throw error(`Solo hay ${ex.cantidad} ${producto.unidad} en ese lote y bodega`);
   if(tipo==='salida'){base.id_lote=lote.id_lote;base.id_bodega=Number(data.bodega_origen_id);base.bodega_origen_id=Number(data.bodega_origen_id);}
   if(tipo==='traslado'){if(!data.bodega_destino_id)throw error('Seleccione la bodega de destino');if(Number(data.bodega_destino_id)===Number(data.bodega_origen_id))throw error('El destino debe ser distinto del origen');const destino=await Bodega.findByPk(data.bodega_destino_id,{transaction:t});if(!destino)throw error('Bodega de destino no encontrada',404);let loteDestino=await LoteMercancia.findOne({where:{id_producto:producto.id_producto,id_bodega:destino.id_bodega,codigo_lote:lote.codigo_lote},transaction:t});if(!loteDestino){loteDestino=await LoteMercancia.create({id_producto:producto.id_producto,id_bodega:destino.id_bodega,codigo_lote:lote.codigo_lote,cantidad:0,fecha_ingreso:lote.fecha_ingreso,fecha_vencimiento:lote.fecha_vencimiento,estado:lote.estado,id_orden_compra:lote.id_orden_compra},{transaction:t});}base.id_lote=lote.id_lote;base.id_bodega=Number(data.bodega_origen_id);base.bodega_origen_id=Number(data.bodega_origen_id);base.bodega_destino_id=Number(data.bodega_destino_id);
   }
   if(tipo==='ajuste'){if(!['positivo','negativo'].includes(data.sentido))throw error('El ajuste requiere sentido "positivo" o "negativo"');if(!base.observacion)throw error('Indique el motivo del ajuste');if(data.sentido==='negativo'&&Number(data.cantidad)>ex.cantidad)throw error(`El ajuste no puede dejar el lote en negativo (hay ${ex.cantidad})`);base.id_lote=lote.id_lote;base.id_bodega=Number(data.bodega_origen_id);base.bodega_destino_id=Number(data.bodega_origen_id);base.cantidad=data.sentido==='positivo'?Number(data.cantidad):-Number(data.cantidad);}
  }
  const mov=await MovimientoInventario.create(base,{transaction:t});id=mov.id_movimiento;
 });
 await sincronizarInventario(producto.id_producto,config);
 const full=await MovimientoInventario.findByPk(id,{include:[{model:Producto,as:'producto'},{model:LoteMercancia,as:'lote',include:[{model:OrdenCompra,as:'ordenCompra',include:[{model:Proveedor,as:'proveedor'}]}]},{model:Bodega,as:'bodegaOrigen'},{model:Bodega,as:'bodegaDestino'}]});const l=plain(full.lote),oc=plain(l?.ordenCompra),prov=plain(oc?.proveedor);return {movimiento:formatMovimiento(full,{producto:plain(full.producto),lote:l,bodegaOrigen:plain(full.bodegaOrigen),bodegaDestino:plain(full.bodegaDestino),oc,proveedor:prov}),material:await materialConStock(producto,await calcularExistencias(config))};
}
