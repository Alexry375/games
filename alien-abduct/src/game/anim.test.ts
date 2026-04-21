import { describe, it, expect } from 'vitest';
import { AnimQueue } from './anim';
import type { AnimStep } from './types';

const step = (id: string, duration = 200, parallel = false): AnimStep =>
  ({ id, kind: 'hit', duration, data: {}, parallel });

describe('AnimQueue', () => {
  it('empty by default', () => {
    const q = new AnimQueue();
    expect(q.isEmpty).toBe(true);
  });

  it('enqueue + tick(0) activates first step', () => {
    const q = new AnimQueue();
    q.enqueue([step('a'), step('b')]);
    q.tick(0);
    expect(q.current?.id).toBe('a');
  });

  it('tick beyond duration pops to next', () => {
    const q = new AnimQueue();
    q.enqueue([step('a', 100), step('b', 100)]);
    q.tick(50);
    expect(q.current?.id).toBe('a');
    q.tick(60);
    expect(q.current?.id).toBe('b');
  });

  it('isEmpty true after last step done', () => {
    const q = new AnimQueue();
    q.enqueue([step('a', 50)]);
    q.tick(100);
    expect(q.isEmpty).toBe(true);
  });

  it('returns progress 0..1', () => {
    const q = new AnimQueue();
    q.enqueue([step('a', 100)]);
    q.tick(30);
    expect(q.progress).toBeCloseTo(0.3, 2);
  });
});
