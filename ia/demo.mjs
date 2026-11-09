// Respuestas de ejemplo con los campos que usa el asistente del contrato EcoObra.
const material = {
  material_id: 5,
  material_codigo: 'ADI-ACE-005',
  material_nombre: 'Aditivo acelerante',
  bodega_id: 1,
  bodega_nombre: 'Bodega Central Puntarenas',
  unidad: 'unidad',
};
const vencido = {
  ...material,
  lote_id: 8,
  codigo_lote: 'AC-K-0090',
  cantidad: 30,
  fecha_vencimiento: '2026-11-01',
  dias_para_vencer: -8,
  estado_vencimiento: 'vencido',
};
const apto = {
  ...material,
  lote_id: 9,
  codigo_lote: 'AC-M-0331',
  cantidad: 90,
  fecha_vencimiento: '2027-04-08',
  dias_para_vencer: 150,
  estado_vencimiento: 'vigente',
};
export const respuestasDemo = {
  '/alertas/vencimientos': [vencido],
  '/materiales/5/existencias': [vencido, apto],
};
