import { describe, expect, it } from 'vitest';
import { computeScrollProgress } from '../../src/motion.js';

describe('computeScrollProgress (unitário)', () => {
  it('retorna 0 no topo da página', () => {
    expect(computeScrollProgress(0, 2000, 800)).toBe(0);
  });

  it('retorna 1 quando rolado até o fim', () => {
    expect(computeScrollProgress(1200, 2000, 800)).toBe(1);
  });

  it('retorna um valor proporcional no meio da rolagem', () => {
    // scrollHeight - clientHeight = 1000 (altura rolável); scrollTop 500 -> 50%
    expect(computeScrollProgress(500, 1800, 800)).toBeCloseTo(0.5, 5);
  });

  it('nunca ultrapassa 1, mesmo com scrollTop além do limite', () => {
    expect(computeScrollProgress(9999, 2000, 800)).toBe(1);
  });

  it('nunca fica negativo, mesmo com scrollTop negativo', () => {
    expect(computeScrollProgress(-50, 2000, 800)).toBe(0);
  });

  it('retorna 0 quando a página inteira cabe na viewport (nada para rolar)', () => {
    expect(computeScrollProgress(0, 600, 800)).toBe(0);
  });
});
