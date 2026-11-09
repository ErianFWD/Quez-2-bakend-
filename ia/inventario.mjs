const estadosAptos = new Set(['critico', 'proximo', 'vigente']);

function datosLote(lote) {
  const {
    codigo_lote, material_codigo, material_nombre, bodega_nombre, cantidad,
    unidad, fecha_vencimiento, estado_vencimiento, dias_para_vencer,
  } = lote;
  return {
    codigo_lote, material_codigo, material_nombre, bodega_nombre, cantidad,
    unidad, fecha_vencimiento, estado_vencimiento, dias_para_vencer,
  };
}

export async function prepararConsulta(consultar, accion, codigo) {
  const alertas = await consultar('/alertas/vencimientos');
  const coincidencias = codigo
    ? alertas.filter((lote) => lote.codigo_lote.toUpperCase() === codigo)
    : alertas;

  if (!coincidencias.length) {
    return {
      accion,
      mensaje: codigo ? 'No hay una alerta para ese código de lote.' : 'No hay alertas de vencimiento.',
      registros: [],
    };
  }
  if (accion === 'vencimientos') {
    return { accion, registros: coincidencias.map(datosLote) };
  }

  // Un código puede repetirse para otro material o aparecer en varias bodegas.
  const existenciasPorMaterial = new Map();
  const registros = [];
  for (const lote of coincidencias) {
    if (!existenciasPorMaterial.has(lote.material_id)) {
      existenciasPorMaterial.set(lote.material_id, await consultar(`/materiales/${lote.material_id}/existencias`));
    }
    const aptos = existenciasPorMaterial.get(lote.material_id)
      .filter((fila) => fila.material_id === lote.material_id && fila.bodega_id === lote.bodega_id
        && Number(fila.cantidad) > 0 && Number(fila.dias_para_vencer) >= 0
        && estadosAptos.has(fila.estado_vencimiento));
    aptos.sort((a, b) => a.fecha_vencimiento.localeCompare(b.fecha_vencimiento));
    registros.push({ lote_alertado: datosLote(lote), lote_sugerido: aptos[0] ? datosLote(aptos[0]) : null });
  }
  return { accion, registros };
}
