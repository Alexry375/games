import { describe, it, expect } from 'vitest';
import { clamp01, lerp, easeOutCubic, easeOutQuad, polarToCart } from './math';

describe('math', () => {
  it('clamp01', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(2)).toBe(1);
  });
  it('lerp', () => {
    expect(lerp(0, 10, 0.3)).toBeCloseTo(3);
  });
  it('easeOutCubic(0)=0, (1)=1, (0.5)≈0.875', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875, 3);
  });
  it('easeOutQuad(0.5)=0.75', () => {
    expect(easeOutQuad(0.5)).toBe(0.75);
  });
  it('polarToCart around center', () => {
    const p = polarToCart(100, 200, 10, 0);
    expect(p.x).toBeCloseTo(110);
    expect(p.y).toBeCloseTo(200);
  });
});
