import { describe, it, expect } from 'vitest';
import { WAVES } from './waves';

describe('waves', () => {
  it('has 5 waves', () => {
    expect(WAVES).toHaveLength(5);
  });

  it('W1 has 2 grunts', () => {
    expect(WAVES[0]).toEqual(['grunt', 'grunt']);
  });

  it('W5 has brute, sniper, bomber, medic', () => {
    expect(WAVES[4]).toEqual(['brute', 'sniper', 'bomber', 'medic']);
  });

  it('every wave has 2..4 mobs', () => {
    for (const w of WAVES) {
      expect(w.length).toBeGreaterThanOrEqual(2);
      expect(w.length).toBeLessThanOrEqual(4);
    }
  });
});
