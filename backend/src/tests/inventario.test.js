import { describe, expect, it } from 'vitest';
import { calcStockSeguridad, calcPuntoReorden, estadoStock, diasParaVencer, estadoVencimiento, esPosibleDuplicado } from '../services/inventario.js';

describe('Reglas de inventario EcoObra', () => {
  it('calcula stock de seguridad y punto de reorden', () => {
    expect(calcStockSeguridad(18, 12, 4)).toBe(24);
    expect(calcPuntoReorden(12, 4, 24)).toBe(72);
  });
  it('calcula estados de stock', () => {
    expect(estadoStock(0, 72, 200)).toBe('agotado');
    expect(estadoStock(60, 72, 200)).toBe('reordenar');
    expect(estadoStock(250, 72, 200)).toBe('sobrestock');
    expect(estadoStock(100, 72, 200)).toBe('ok');
  });
  it('detecta vencidos y críticos', () => {
    const hoy = new Date(2026, 10, 9);
    expect(diasParaVencer('2026-11-01', hoy)).toBe(-8);
    expect(estadoVencimiento(-8)).toBe('vencido');
    expect(estadoVencimiento(25)).toBe('critico');
    expect(estadoVencimiento(60)).toBe('proximo');
  });
  it('detecta una posible OC duplicada', () => {
    const a = { id: 1, proveedor_id: 2, material_id: 6, cantidad: 150, fecha: '2026-11-06' };
    const b = { id: 2, proveedor_id: 2, material_id: 6, cantidad: 145, fecha: '2026-11-08' };
    expect(esPosibleDuplicado(a,b)).toEqual({ diferencia_dias: 2, diferencia_cantidad_pct: 3.3 });
  });
  it('no considera duplicadas OC de otro proveedor', () => {
    const a = { id: 1, proveedor_id: 1, material_id: 6, cantidad: 150, fecha: '2026-11-06' };
    const b = { id: 2, proveedor_id: 2, material_id: 6, cantidad: 150, fecha: '2026-11-08' };
    expect(esPosibleDuplicado(a,b)).toBeNull();
  });
});
