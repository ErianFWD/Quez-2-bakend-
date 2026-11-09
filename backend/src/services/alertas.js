import { listarMateriales, calcularExistencias } from './materiales.js';
import { cantidadSugerida } from './inventario.js';
export async function alertasReorden(config){const ms=await listarMateriales(config);return ms.filter(m=>m.stock_disponible<=m.punto_reorden).map(m=>({...m,cantidad_sugerida:cantidadSugerida(m.stock_disponible,m.stock_maximo)})).sort((a,b)=>(a.stock_disponible/(a.punto_reorden||1))-(b.stock_disponible/(b.punto_reorden||1)));}
export async function alertasVencimientos(config){return (await calcularExistencias(config)).filter(e=>e.estado_vencimiento==='vencido'||e.estado_vencimiento==='critico');}
