// Ejecutar solo contra una base de pruebas: crea materiales, órdenes y movimientos.
import assert from 'node:assert/strict';
const base = process.env.API_URL || 'http://localhost:3000/api';
async function req(path, method = 'GET', body, status = 200) {
  const r = await fetch(base + path, { method, headers: {'Content-Type':'application/json'}, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json();
  assert.equal(r.status, status, `${method} ${path}: ${JSON.stringify(data)}`);
  return data;
}
for (const path of ['/salud','/materiales','/bodegas','/proveedores','/lotes','/movimientos','/ordenes','/ordenes/posibles-duplicados','/alertas/reorden','/alertas/vencimientos','/configuracion']) await req(path);
const config = await req('/configuracion');
const updated = await req('/configuracion','PUT',{...config,usuario_actual:'verificacion'});
assert.equal(updated.usuario_actual,'verificacion');
await req('/configuracion','PUT',config);
const suffix = Date.now().toString();
const material = await req('/materiales', 'POST', {codigo:`TEST-${suffix}`,nombre:'Material de prueba integración',categoria:'Selladores',unidad:'galón',stock_minimo:1,stock_maximo:100,demanda_promedio:1,demanda_maxima:2,tiempo_entrega:1,vida_util_dias:365}, 201);
await req(`/materiales/${material.id}`, 'PUT', {nombre:'Material de prueba actualizado'});
await req('/materiales/999999', 'GET', undefined, 404);
await req('/movimientos', 'POST', {}, 400);
const bodegas = await req('/bodegas');
assert.ok(bodegas.length >= 2, 'Se requieren dos bodegas de prueba');
const proveedores = await req('/proveedores');
const o = await req('/ordenes', 'POST', {fecha:new Date().toISOString().slice(0,10),proveedor_id:proveedores[0].id,bodega_id:bodegas[0].id,material_id:material.id,cantidad:10,precio_unitario:100,solicitante:'Pruebas'}, 201);
await req(`/ordenes/${o.orden.id}/recibir`, 'POST', {codigo_lote:`LOTE-${suffix}`,fecha_vencimiento:'2035-12-31',usuario:'pruebas'});
let ex = await req(`/materiales/${material.id}/existencias`);
assert.equal(ex[0].cantidad,10);
const common = {material_id:material.id,lote_id:ex[0].lote_id,bodega_origen_id:bodegas[0].id,usuario:'pruebas',documento_tipo:'Prueba',documento_ref:`TEST-${suffix}`};
await req('/movimientos','POST',{...common,tipo:'traslado',cantidad:3,bodega_destino_id:bodegas[1].id},201);
await req('/movimientos','POST',{...common,tipo:'salida',cantidad:2},201);
await req('/movimientos','POST',{...common,tipo:'ajuste',cantidad:1,sentido:'negativo',observacion:'Conteo de prueba'},201);
ex = await req(`/materiales/${material.id}/existencias`);
assert.equal(ex.find(x=>x.bodega_id===bodegas[0].id).cantidad,4);
assert.equal(ex.find(x=>x.bodega_id===bodegas[1].id).cantidad,3);
await req('/movimientos','POST',{...common,tipo:'salida',cantidad:999},400);
await req(`/ordenes/${o.orden.id}/recibir`, 'POST', {},400);
const trace = await req(`/materiales/${material.id}/trazabilidad`);
assert.equal(trace.movimientos.length,4);
assert.equal(trace.material.stock_total,7);
console.log('Integración OK: lecturas, material, recepción, traslado, salida, ajuste y errores controlados.');
