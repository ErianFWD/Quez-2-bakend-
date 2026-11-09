export function calcStockSeguridad(demandaMaxima, demandaPromedio, tiempoEntrega) {
  return Math.max(0, Math.round((Number(demandaMaxima) - Number(demandaPromedio)) * Number(tiempoEntrega)));
}
export function calcPuntoReorden(demandaPromedio, tiempoEntrega, stockSeguridad) {
  return Math.round(Number(demandaPromedio) * Number(tiempoEntrega) + Number(stockSeguridad));
}
export function estadoStock(disponible, puntoReorden, stockMaximo) {
  if (disponible <= 0) return 'agotado';
  if (disponible <= puntoReorden) return 'reordenar';
  if (Number(stockMaximo) > 0 && disponible > Number(stockMaximo)) return 'sobrestock';
  return 'ok';
}
export function cantidadSugerida(disponible, stockMaximo) { return Math.max(0, Number(stockMaximo) - Number(disponible)); }
export function parseFecha(iso) { const [y,m,d]=String(iso).slice(0,10).split('-').map(Number); return new Date(y,m-1,d); }
export function hoyISO(base=new Date()) { return `${base.getFullYear()}-${String(base.getMonth()+1).padStart(2,'0')}-${String(base.getDate()).padStart(2,'0')}`; }
export function diasParaVencer(fechaVencimiento, hoy=new Date()) { const v=parseFecha(fechaVencimiento); const h=new Date(hoy.getFullYear(),hoy.getMonth(),hoy.getDate()); return Math.round((v-h)/86400000); }
export function estadoVencimiento(dias,cfg={dias_alerta_critica:30,dias_alerta_proxima:90}) { if(dias<0)return 'vencido'; if(dias<=Number(cfg.dias_alerta_critica))return 'critico'; if(dias<=Number(cfg.dias_alerta_proxima))return 'proximo'; return 'vigente'; }
export function ordenarFEFO(lotes) { return [...lotes].sort((a,b)=>parseFecha(a.fecha_vencimiento)-parseFecha(b.fecha_vencimiento)); }
export function esPosibleDuplicado(a,b,regla={duplicado_dias:3,duplicado_tolerancia_pct:10}) {
  if(a.id===b.id || Number(a.proveedor_id)!==Number(b.proveedor_id) || Number(a.material_id)!==Number(b.material_id)) return null;
  const dias=Math.abs(Math.round((parseFecha(a.fecha)-parseFecha(b.fecha))/86400000)); if(dias>Number(regla.duplicado_dias)) return null;
  const mayor=Math.max(Number(a.cantidad),Number(b.cantidad)); const dif=mayor===0?0:Math.abs(Number(a.cantidad)-Number(b.cantidad))/mayor*100;
  if(dif>Number(regla.duplicado_tolerancia_pct))return null; return {diferencia_dias:dias,diferencia_cantidad_pct:Math.round(dif*10)/10};
}
export function buscarDuplicados(ordenes,regla){const r=[];for(let i=0;i<ordenes.length;i++)for(let j=i+1;j<ordenes.length;j++){const x=esPosibleDuplicado(ordenes[i],ordenes[j],regla);if(x)r.push({oc_a:ordenes[i],oc_b:ordenes[j],...x});}return r;}
