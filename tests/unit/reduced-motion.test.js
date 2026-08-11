import { describe, expect, it, vi } from 'vitest';
import { prefersReducedMotion } from '../../src/motion.js';

describe('prefersReducedMotion (unitário)', () => {
  it('retorna true quando matchMedia reporta a preferência ativa', () => {
    const matchMediaFn = vi.fn().mockReturnValue({ matches: true });
    expect(prefersReducedMotion(matchMediaFn)).toBe(true);
    expect(matchMediaFn).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('retorna false quando matchMedia reporta a preferência inativa', () => {
    const matchMediaFn = vi.fn().mockReturnValue({ matches: false });
    expect(prefersReducedMotion(matchMediaFn)).toBe(false);
  });

  it('retorna false com segurança quando não há matchMedia disponível', () => {
    expect(prefersReducedMotion(null)).toBe(false);
  });
});
