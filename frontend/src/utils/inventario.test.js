import { describe, it, expect } from 'vitest';
import {
  calcStockSeguridad,
  calcPuntoReorden,
  estadoStock,
  diasParaVencer,
  estadoVencimiento,
  loteSugeridoFEFO,
  esPosibleDuplicado,
} from './inventario.js';

describe('Stock de seguridad y punto de reorden', () => {
  it('calcula el ejemplo del cemento del enunciado (A5)', () => {
    const ss = calcStockSeguridad(55, 40, 3); // (55-40)*3
    expect(ss).toBe(45);
    expect(calcPuntoReorden(40, 3, ss)).toBe(165); // 40*3 + 45
  });

  it('nunca devuelve stock de seguridad negativo', () => {
    expect(calcStockSeguridad(5, 10, 4)).toBe(0);
  });

  it('marca reordenar cuando el disponible cae al punto de reorden', () => {
    expect(estadoStock(72, 72, 200)).toBe('reordenar');
    expect(estadoStock(0, 72, 200)).toBe('agotado');
    expect(estadoStock(100, 72, 200)).toBe('ok');
    expect(estadoStock(250, 72, 200)).toBe('sobrestock');
  });
});

describe('Vencimientos', () => {
  const hoy = new Date(2026, 10, 9); // 9 nov 2026
  const cfg = { dias_alerta_critica: 30, dias_alerta_proxima: 90 };

  it('cuenta los días hasta el vencimiento', () => {
    expect(diasParaVencer('2026-11-19', hoy)).toBe(10);
    expect(diasParaVencer('2026-11-01', hoy)).toBe(-8);
  });

  it('clasifica el semáforo según los umbrales', () => {
    expect(estadoVencimiento(-1, cfg)).toBe('vencido');
    expect(estadoVencimiento(0, cfg)).toBe('critico');
    expect(estadoVencimiento(30, cfg)).toBe('critico');
    expect(estadoVencimiento(60, cfg)).toBe('proximo');
    expect(estadoVencimiento(200, cfg)).toBe('vigente');
  });

  it('FEFO sugiere el lote que vence primero, saltando los vencidos', () => {
    const existencias = [
      { id: 1, fecha_vencimiento: '2027-05-01', cantidad: 10 },
      { id: 2, fecha_vencimiento: '2026-10-01', cantidad: 10 }, // vencido
      { id: 3, fecha_vencimiento: '2026-12-01', cantidad: 10 },
    ];
    expect(loteSugeridoFEFO(existencias, hoy).id).toBe(3);
  });
});

describe('Posibles compras duplicadas', () => {
  const regla = { duplicado_dias: 3, duplicado_tolerancia_pct: 10 };
  const base = { id: 1, proveedor_id: 1, material_id: 1, cantidad: 500, fecha: '2026-10-08' };

  it('detecta mismo proveedor, material, cantidad parecida y fecha cercana', () => {
    const r = esPosibleDuplicado(base, { ...base, id: 2, cantidad: 480, fecha: '2026-10-09' }, regla);
    expect(r).not.toBeNull();
    expect(r.diferencia_dias).toBe(1);
  });

  it('no marca si el proveedor es distinto', () => {
    expect(esPosibleDuplicado(base, { ...base, id: 2, proveedor_id: 2 }, regla)).toBeNull();
  });

  it('no marca si las fechas están muy separadas', () => {
    expect(esPosibleDuplicado(base, { ...base, id: 2, fecha: '2026-10-20' }, regla)).toBeNull();
  });

  it('no marca si la cantidad difiere más que la tolerancia', () => {
    expect(esPosibleDuplicado(base, { ...base, id: 2, cantidad: 300 }, regla)).toBeNull();
  });
});
