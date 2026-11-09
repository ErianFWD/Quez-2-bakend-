import { Op } from 'sequelize';
import { Producto, LoteMercancia, MovimientoInventario, Bodega, OrdenCompra, DetalleOrdenCompra, Proveedor, Inventario } from '../models/index.js';
import { calcStockSeguridad, calcPuntoReorden, estadoStock, diasParaVencer, estadoVencimiento } from './inventario.js';
import { error, cleanString, isNonNegative, plain, formatExistencia, formatMaterial, formatMovimiento } from './helpers.js';

export async function calcularExistencias(configuracion){
  const movimientos=await MovimientoInventario.findAll({include:[{model:LoteMercancia,as:'lote',include:[{model:Producto,as:'producto'},{model:OrdenCompra,as:'ordenCompra',include:[{model:Proveedor,as:'proveedor'}]}]},{model:Bodega,as:'bodega'},{model:Producto,as:'producto'}],order:[['fecha_movimiento','ASC'],['id_movimiento','ASC']]});
  const mapa=new Map();
  const add=(lote,bodega,cant)=>{if(!bodega)return;const k=`${lote}-${bodega}`;mapa.set(k,(mapa.get(k)||0)+Number(cant));};
  for(const m of movimientos){
    if(m.tipo_movimiento==='entrada')add(m.id_lote,m.bodega_destino_id,m.cantidad);
    if(m.tipo_movimiento==='salida')add(m.id_lote,m.bodega_origen_id,-Number(m.cantidad));
    if(m.tipo_movimiento==='traslado'){add(m.id_lote,m.bodega_origen_id,-Number(m.cantidad));add(m.id_lote,m.bodega_destino_id,Number(m.cantidad));}
    if(m.tipo_movimiento==='ajuste')add(m.id_lote,m.id_bodega,Number(m.cantidad));
  }
  const lotes=await LoteMercancia.findAll({include:[{model:Producto,as:'producto'},{model:OrdenCompra,as:'ordenCompra',include:[{model:Proveedor,as:'proveedor'}]}]});
  const bodegas=await Bodega.findAll();const bm=new Map(bodegas.map(b=>[b.id_bodega,b]));const out=[];
  for(const [key,cantidad] of mapa){if(cantidad<=0)continue;const [loteId,bodegaId]=key.split('-').map(Number);const lote=lotes.find(l=>l.id_lote===loteId);if(!lote)continue;const b=bm.get(bodegaId);if(!b)continue;out.push(formatExistencia({lote:plain(lote),producto:plain(lote.producto),bodega:plain(b),cantidad,oc:plain(lote.ordenCompra),proveedor:plain(lote.ordenCompra?.proveedor),configuracion}));}
  return out.sort((a,b)=>a.fecha_vencimiento.localeCompare(b.fecha_vencimiento)||a.material_id-b.material_id||a.bodega_id-b.bodega_id);
}

async function parametrosStock(producto){
  const inv=await Inventario.findAll({where:{id_producto:producto.id_producto}});
  return {stock_minimo:inv.reduce((s,x)=>s+Number(x.stock_minimo),0),stock_maximo:inv.reduce((s,x)=>s+Number(x.stock_maximo),0)};
}
export async function materialConStock(p,existencias){
  const own=existencias.filter(e=>e.material_id===p.id_producto);const total=own.reduce((s,e)=>s+e.cantidad,0);const venc=own.filter(e=>e.dias_para_vencer<0).reduce((s,e)=>s+e.cantidad,0);const disponible=total-venc;
  const ss=calcStockSeguridad(p.demanda_maxima,p.demanda_promedio,p.tiempo_entrega);const pr=calcPuntoReorden(p.demanda_promedio,p.tiempo_entrega,ss);const params=await parametrosStock(p);const prox=own.find(e=>e.dias_para_vencer>=0);
  return formatMaterial(p,{...params,stock_total:total,stock_vencido:venc,stock_disponible:disponible,stock_seguridad:ss,punto_reorden:pr,estado:estadoStock(disponible,pr,params.stock_maximo),proximo_vencimiento:prox?.fecha_vencimiento??null,lotes_activos:own.length});
}
export async function listarMateriales(config){const ex=await calcularExistencias(config);const ps=await Producto.findAll({where:{activo:true},order:[['id_producto','ASC']]});return Promise.all(ps.map(p=>materialConStock(p,ex)));}
export async function obtenerMaterial(id,config){const p=await Producto.findByPk(id);if(!p||!p.activo)throw error('Material no encontrado',404);return materialConStock(p,await calcularExistencias(config));}
function validar(data,parcial=false){
  const req=['codigo','nombre','categoria','unidad','stock_minimo','stock_maximo','demanda_promedio','demanda_maxima','tiempo_entrega','vida_util_dias'];if(!parcial)for(const k of req)if(data[k]===undefined||data[k]===null||cleanString(data[k])==='')throw error(`El campo ${k} es obligatorio`);
  for(const k of ['stock_minimo','stock_maximo','demanda_promedio','demanda_maxima','tiempo_entrega','vida_util_dias'])if(data[k]!==undefined&&!isNonNegative(data[k]))throw error(`${k} debe ser un número mayor o igual a 0`);
  if(data.tiempo_entrega!==undefined&&Number(data.tiempo_entrega)<1)throw error('tiempo_entrega debe ser mayor o igual a 1');
  if(data.stock_minimo!==undefined&&data.stock_maximo!==undefined&&Number(data.stock_maximo)<=Number(data.stock_minimo))throw error('stock_maximo debe ser mayor que stock_minimo');
  if(data.demanda_promedio!==undefined&&data.demanda_maxima!==undefined&&Number(data.demanda_maxima)<Number(data.demanda_promedio))throw error('demanda_maxima debe ser mayor o igual que demanda_promedio');
  if(data.categoria!==undefined&&!['Selladores','Adhesivos','Impermeabilizantes','Aditivos'].includes(data.categoria))throw error('Categoría inválida');
}
export async function crearMaterial(data,config){validar(data);const codigo=cleanString(data.codigo).toUpperCase();if(await Producto.findOne({where:{codigo}}))throw error('Ya existe un material con ese código',409);const p=await Producto.create({codigo,nombre:cleanString(data.nombre),categoria:data.categoria,unidad:cleanString(data.unidad),descripcion:data.descripcion??null,precio:Number(data.precio??0),precio_base:Number(data.precio_base??0),demanda_promedio:Number(data.demanda_promedio),demanda_maxima:Number(data.demanda_maxima),tiempo_entrega:Number(data.tiempo_entrega),vida_util_dias:Number(data.vida_util_dias),activo:true});const b=await Bodega.findOne({order:[['id_bodega','ASC']]});if(b)await Inventario.create({id_producto:p.id_producto,id_bodega:b.id_bodega,stock:0,stock_minimo:Number(data.stock_minimo),stock_maximo:Number(data.stock_maximo),fecha_maximo:null});return materialConStock(p,await calcularExistencias(config));}
export async function actualizarMaterial(id,data,config){const p=await Producto.findByPk(id);if(!p||!p.activo)throw error('Material no encontrado',404);validar({...data,stock_minimo:data.stock_minimo??0,stock_maximo:data.stock_maximo??1},true);if(data.codigo){const codigo=cleanString(data.codigo).toUpperCase();if(await Producto.findOne({where:{codigo,id_producto:{[Op.ne]:id}}}))throw error('Ya existe un material con ese código',409);p.codigo=codigo;}for(const k of ['nombre','categoria','unidad','descripcion','precio','precio_base','demanda_promedio','demanda_maxima','tiempo_entrega','vida_util_dias'])if(data[k]!==undefined)p[k]=data[k];await p.save();const inv=await Inventario.findOne({where:{id_producto:id},order:[['id_inventario','ASC']]});if(inv){if(data.stock_minimo!==undefined)inv.stock_minimo=data.stock_minimo;if(data.stock_maximo!==undefined)inv.stock_maximo=data.stock_maximo;await inv.save();}return materialConStock(p,await calcularExistencias(config));}
export async function existenciasMaterial(id,config){await obtenerMaterial(id,config);return (await calcularExistencias(config)).filter(e=>e.material_id===Number(id));}
export async function trazabilidadMaterial(id,config){const material=await obtenerMaterial(id,config);const existencias=(await calcularExistencias(config)).filter(e=>e.material_id===Number(id));const movimientos=await MovimientoInventario.findAll({where:{id_producto:id},include:[{model:Producto,as:'producto'},{model:LoteMercancia,as:'lote',include:[{model:OrdenCompra,as:'ordenCompra',include:[{model:Proveedor,as:'proveedor'}]}]},{model:Bodega,as:'bodegaOrigen'},{model:Bodega,as:'bodegaDestino'}],order:[['fecha_movimiento','ASC'],['id_movimiento','ASC']]});return {material,existencias,movimientos:movimientos.map(m=>{const l=plain(m.lote),oc=plain(l?.ordenCompra),prov=plain(oc?.proveedor);return formatMovimiento(m,{producto:plain(m.producto),lote:l,bodegaOrigen:plain(m.bodegaOrigen),bodegaDestino:plain(m.bodegaDestino),oc,proveedor:prov});})};}
