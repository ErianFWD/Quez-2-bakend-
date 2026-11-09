// Datos semilla de demostración para Químicos EcoObra S.A.
// Las fechas se calculan a partir de HOY para que siempre haya lotes
// vencidos, por vencer y vigentes al hacer la demo.
import { hoyISO, sumarDias } from '../utils/inventario.js';

export function crearDatosSemilla() {
  const hoy = hoyISO();
  const d = (n) => sumarDias(hoy, n); // d(-5) = hace 5 días, d(30) = en 30 días
  const dt = (n, hora = '09:00') => `${d(n)}T${hora}:00`;

  const bodegas = [
    { id: 1, nombre: 'Bodega Central Puntarenas', tipo: 'bodega' },
    { id: 2, nombre: 'Bodega San José', tipo: 'bodega' },
    { id: 3, nombre: 'Obra Residencial Las Palmas', tipo: 'obra' },
  ];

  const proveedores = [
    { id: 1, nombre: 'QuimiCR S.A.' },
    { id: 2, nombre: 'Adhesivos del Pacífico' },
    { id: 3, nombre: 'SellaTec Distribuciones' },
  ];

  const materiales = [
    { id: 1, codigo: 'SEL-ACR-001', nombre: 'Sellador acrílico para concreto 1 gal', categoria: 'Selladores', unidad: 'galón', stock_minimo: 40, stock_maximo: 200, demanda_promedio: 12, demanda_maxima: 18, tiempo_entrega: 4, vida_util_dias: 365 },
    { id: 2, codigo: 'ADH-EPO-002', nombre: 'Adhesivo epóxico 2 componentes 1 kg', categoria: 'Adhesivos', unidad: 'kit', stock_minimo: 20, stock_maximo: 150, demanda_promedio: 6, demanda_maxima: 9, tiempo_entrega: 7, vida_util_dias: 540 },
    { id: 3, codigo: 'SEL-SIL-003', nombre: 'Silicón neutro transparente 300 ml', categoria: 'Selladores', unidad: 'tubo', stock_minimo: 60, stock_maximo: 400, demanda_promedio: 30, demanda_maxima: 45, tiempo_entrega: 3, vida_util_dias: 365 },
    { id: 4, codigo: 'IMP-ASF-004', nombre: 'Impermeabilizante asfáltico cubeta 19 L', categoria: 'Impermeabilizantes', unidad: 'cubeta', stock_minimo: 15, stock_maximo: 100, demanda_promedio: 5, demanda_maxima: 8, tiempo_entrega: 6, vida_util_dias: 730 },
    { id: 5, codigo: 'ADI-ACE-005', nombre: 'Aditivo acelerante de fraguado 4 L', categoria: 'Aditivos', unidad: 'galón', stock_minimo: 25, stock_maximo: 160, demanda_promedio: 8, demanda_maxima: 12, tiempo_entrega: 5, vida_util_dias: 270 },
    { id: 6, codigo: 'SEL-PUR-006', nombre: 'Espuma de poliuretano expansiva 750 ml', categoria: 'Selladores', unidad: 'lata', stock_minimo: 40, stock_maximo: 250, demanda_promedio: 15, demanda_maxima: 22, tiempo_entrega: 4, vida_util_dias: 450 },
    { id: 7, codigo: 'ADI-DES-007', nombre: 'Desmoldante para formaleta 20 L', categoria: 'Aditivos', unidad: 'pichinga', stock_minimo: 10, stock_maximo: 60, demanda_promedio: 3, demanda_maxima: 5, tiempo_entrega: 7, vida_util_dias: 365 },
    { id: 8, codigo: 'ADH-CER-008', nombre: 'Adhesivo para cerámica 20 kg', categoria: 'Adhesivos', unidad: 'saco', stock_minimo: 80, stock_maximo: 600, demanda_promedio: 25, demanda_maxima: 40, tiempo_entrega: 3, vida_util_dias: 180 },
  ];

  // Órdenes de compra (una línea por OC, como en el extracto del enunciado).
  // OC-2041/OC-2042 y OC-2050/OC-2053 son posibles duplicados a propósito.
  const ordenes = [
    { id: 1, codigo: 'OC-2020', fecha: d(-400), proveedor_id: 2, material_id: 6, cantidad: 20, precio_unitario: 4200, estado: 'recibida', solicitante: 'Bodega Central' },
    { id: 2, codigo: 'OC-2027', fecha: d(-270), proveedor_id: 1, material_id: 5, cantidad: 30, precio_unitario: 9800, estado: 'recibida', solicitante: 'Bodega Central' },
    { id: 3, codigo: 'OC-2029', fecha: d(-360), proveedor_id: 1, material_id: 3, cantidad: 200, precio_unitario: 2350, estado: 'recibida', solicitante: 'Bodega Central' },
    { id: 4, codigo: 'OC-2031', fecha: d(-160), proveedor_id: 3, material_id: 1, cantidad: 80, precio_unitario: 14500, estado: 'recibida', solicitante: 'Bodega Central' },
    { id: 5, codigo: 'OC-2033', fecha: d(-120), proveedor_id: 2, material_id: 2, cantidad: 70, precio_unitario: 11800, estado: 'recibida', solicitante: 'Obras' },
    { id: 6, codigo: 'OC-2035', fecha: d(-110), proveedor_id: 1, material_id: 4, cantidad: 40, precio_unitario: 32500, estado: 'recibida', solicitante: 'Mantenimiento' },
    { id: 7, codigo: 'OC-2036', fecha: d(-95), proveedor_id: 3, material_id: 7, cantidad: 30, precio_unitario: 18900, estado: 'recibida', solicitante: 'Obras' },
    { id: 8, codigo: 'OC-2038', fecha: d(-90), proveedor_id: 3, material_id: 1, cantidad: 40, precio_unitario: 14900, estado: 'recibida', solicitante: 'Obras' },
    { id: 9, codigo: 'OC-2039', fecha: d(-60), proveedor_id: 1, material_id: 5, cantidad: 90, precio_unitario: 9650, estado: 'recibida', solicitante: 'Bodega Central' },
    { id: 10, codigo: 'OC-2041', fecha: d(-21), proveedor_id: 2, material_id: 6, cantidad: 150, precio_unitario: 4350, estado: 'recibida', solicitante: 'Obras' },
    { id: 11, codigo: 'OC-2042', fecha: d(-20), proveedor_id: 2, material_id: 6, cantidad: 150, precio_unitario: 4350, estado: 'pendiente', solicitante: 'Obras' },
    { id: 12, codigo: 'OC-2044', fecha: d(-18), proveedor_id: 2, material_id: 2, cantidad: 50, precio_unitario: 11800, estado: 'recibida', solicitante: 'Mantenimiento' },
    { id: 13, codigo: 'OC-2045', fecha: d(-15), proveedor_id: 1, material_id: 3, cantidad: 160, precio_unitario: 2300, estado: 'recibida', solicitante: 'Bodega Central' },
    { id: 14, codigo: 'OC-2050', fecha: d(-12), proveedor_id: 2, material_id: 8, cantidad: 500, precio_unitario: 6200, estado: 'recibida', solicitante: 'Obras' },
    { id: 15, codigo: 'OC-2053', fecha: d(-10), proveedor_id: 2, material_id: 8, cantidad: 480, precio_unitario: 6200, estado: 'pendiente', solicitante: 'Obras' },
  ];

  // Lotes: cada entrada de mercadería crea un lote con su fecha de vencimiento
  // y la OC de donde proviene (trazabilidad).
  const lotes = [
    { id: 1, codigo_lote: 'SA-A-0401', material_id: 1, fecha_vencimiento: d(200), oc_id: 4 },
    { id: 2, codigo_lote: 'SA-B-0612', material_id: 1, fecha_vencimiento: d(25), oc_id: 8 },
    { id: 3, codigo_lote: 'EP-01-0388', material_id: 2, fecha_vencimiento: d(120), oc_id: 5 },
    { id: 4, codigo_lote: 'EP-02-0915', material_id: 2, fecha_vencimiento: d(300), oc_id: 12 },
    { id: 5, codigo_lote: 'SN-X-1102', material_id: 3, fecha_vencimiento: d(12), oc_id: 3 },
    { id: 6, codigo_lote: 'SN-Y-1460', material_id: 3, fecha_vencimiento: d(260), oc_id: 13 },
    { id: 7, codigo_lote: 'IA-1-0207', material_id: 4, fecha_vencimiento: d(60), oc_id: 6 },
    { id: 8, codigo_lote: 'AC-K-0090', material_id: 5, fecha_vencimiento: d(-8), oc_id: 2 },
    { id: 9, codigo_lote: 'AC-M-0331', material_id: 5, fecha_vencimiento: d(150), oc_id: 9 },
    { id: 10, codigo_lote: 'PU-Z-0019', material_id: 6, fecha_vencimiento: d(-40), oc_id: 1 },
    { id: 11, codigo_lote: 'PU-Q-0742', material_id: 6, fecha_vencimiento: d(180), oc_id: 10 },
    { id: 12, codigo_lote: 'DM-3-0155', material_id: 7, fecha_vencimiento: d(70), oc_id: 7 },
    { id: 13, codigo_lote: 'AC-20-5560', material_id: 8, fecha_vencimiento: d(100), oc_id: 14 },
  ];

  let id = 0;
  const mov = (o) => ({ id: ++id, bodega_origen_id: null, bodega_destino_id: null, observacion: '', ...o });

  const movimientos = [
    // Espuma PU: lote viejo que venció y se dio de baja con un ajuste
    mov({ fecha: dt(-398), tipo: 'entrada', material_id: 6, lote_id: 10, bodega_destino_id: 1, cantidad: 20, usuario: 'mrojas', documento_tipo: 'OC', documento_ref: 'OC-2020' }),
    mov({ fecha: dt(-35, '15:20'), tipo: 'ajuste', material_id: 6, lote_id: 10, bodega_destino_id: 1, cantidad: -20, usuario: 'mrojas', documento_tipo: 'Acta de ajuste', documento_ref: 'AJ-0007', observacion: 'Desecho por vencimiento (gestor autorizado de residuos)' }),

    mov({ fecha: dt(-268), tipo: 'entrada', material_id: 5, lote_id: 8, bodega_destino_id: 1, cantidad: 30, usuario: 'mrojas', documento_tipo: 'OC', documento_ref: 'OC-2027' }),
    mov({ fecha: dt(-200), tipo: 'salida', material_id: 5, lote_id: 8, bodega_origen_id: 1, cantidad: 15, usuario: 'jvargas', documento_tipo: 'Vale de salida', documento_ref: 'VS-1120' }),

    mov({ fecha: dt(-357), tipo: 'entrada', material_id: 3, lote_id: 5, bodega_destino_id: 1, cantidad: 200, usuario: 'mrojas', documento_tipo: 'OC', documento_ref: 'OC-2029' }),
    mov({ fecha: dt(-40), tipo: 'salida', material_id: 3, lote_id: 5, bodega_origen_id: 1, cantidad: 60, usuario: 'jvargas', documento_tipo: 'Vale de salida', documento_ref: 'VS-1388' }),

    mov({ fecha: dt(-158), tipo: 'entrada', material_id: 1, lote_id: 1, bodega_destino_id: 1, cantidad: 80, usuario: 'mrojas', documento_tipo: 'OC', documento_ref: 'OC-2031' }),
    mov({ fecha: dt(-30), tipo: 'salida', material_id: 1, lote_id: 1, bodega_origen_id: 1, cantidad: 45, usuario: 'jvargas', documento_tipo: 'Vale de salida', documento_ref: 'VS-1401' }),

    mov({ fecha: dt(-118), tipo: 'entrada', material_id: 2, lote_id: 3, bodega_destino_id: 1, cantidad: 70, usuario: 'mrojas', documento_tipo: 'OC', documento_ref: 'OC-2033' }),
    mov({ fecha: dt(-50, '11:10'), tipo: 'traslado', material_id: 2, lote_id: 3, bodega_origen_id: 1, bodega_destino_id: 3, cantidad: 20, usuario: 'mrojas', documento_tipo: 'Traslado', documento_ref: 'TR-0215' }),
    mov({ fecha: dt(-44), tipo: 'salida', material_id: 2, lote_id: 3, bodega_origen_id: 3, cantidad: 10, usuario: 'lsolano', documento_tipo: 'Vale de salida', documento_ref: 'VS-1360' }),

    mov({ fecha: dt(-108), tipo: 'entrada', material_id: 4, lote_id: 7, bodega_destino_id: 1, cantidad: 40, usuario: 'mrojas', documento_tipo: 'OC', documento_ref: 'OC-2035' }),
    mov({ fecha: dt(-20), tipo: 'salida', material_id: 4, lote_id: 7, bodega_origen_id: 1, cantidad: 10, usuario: 'jvargas', documento_tipo: 'Vale de salida', documento_ref: 'VS-1422' }),

    mov({ fecha: dt(-93), tipo: 'entrada', material_id: 7, lote_id: 12, bodega_destino_id: 1, cantidad: 30, usuario: 'mrojas', documento_tipo: 'OC', documento_ref: 'OC-2036' }),
    mov({ fecha: dt(-9), tipo: 'salida', material_id: 7, lote_id: 12, bodega_origen_id: 1, cantidad: 18, usuario: 'lsolano', documento_tipo: 'Vale de salida', documento_ref: 'VS-1450' }),

    mov({ fecha: dt(-88), tipo: 'entrada', material_id: 1, lote_id: 2, bodega_destino_id: 1, cantidad: 40, usuario: 'mrojas', documento_tipo: 'OC', documento_ref: 'OC-2038' }),
    mov({ fecha: dt(-6), tipo: 'salida', material_id: 1, lote_id: 2, bodega_origen_id: 1, cantidad: 15, usuario: 'jvargas', documento_tipo: 'Vale de salida', documento_ref: 'VS-1461' }),

    mov({ fecha: dt(-58), tipo: 'entrada', material_id: 5, lote_id: 9, bodega_destino_id: 1, cantidad: 90, usuario: 'mrojas', documento_tipo: 'OC', documento_ref: 'OC-2039' }),
    mov({ fecha: dt(-5), tipo: 'salida', material_id: 5, lote_id: 9, bodega_origen_id: 1, cantidad: 15, usuario: 'jvargas', documento_tipo: 'Vale de salida', documento_ref: 'VS-1466' }),

    mov({ fecha: dt(-19), tipo: 'entrada', material_id: 6, lote_id: 11, bodega_destino_id: 1, cantidad: 150, usuario: 'mrojas', documento_tipo: 'OC', documento_ref: 'OC-2041' }),
    mov({ fecha: dt(-16), tipo: 'entrada', material_id: 2, lote_id: 4, bodega_destino_id: 2, cantidad: 50, usuario: 'acastro', documento_tipo: 'OC', documento_ref: 'OC-2044' }),
    mov({ fecha: dt(-13), tipo: 'entrada', material_id: 3, lote_id: 6, bodega_destino_id: 2, cantidad: 160, usuario: 'acastro', documento_tipo: 'OC', documento_ref: 'OC-2045' }),

    mov({ fecha: dt(-10), tipo: 'entrada', material_id: 8, lote_id: 13, bodega_destino_id: 1, cantidad: 500, usuario: 'mrojas', documento_tipo: 'OC', documento_ref: 'OC-2050' }),
    mov({ fecha: dt(-2), tipo: 'salida', material_id: 8, lote_id: 13, bodega_origen_id: 1, cantidad: 100, usuario: 'lsolano', documento_tipo: 'Vale de salida', documento_ref: 'VS-1472' }),
  ];

  const configuracion = {
    dias_alerta_critica: 30,
    dias_alerta_proxima: 90,
    duplicado_dias: 3,
    duplicado_tolerancia_pct: 10,
    usuario_actual: 'dperez',
  };

  return { bodegas, proveedores, materiales, ordenes, lotes, movimientos, configuracion };
}
