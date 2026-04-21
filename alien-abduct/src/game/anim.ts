import type { AnimStep } from './types';

export class AnimQueue {
  private steps: AnimStep[] = [];
  private elapsedInCurrent = 0;

  enqueue(steps: AnimStep[]): void {
    this.steps.push(...steps);
  }

  clear(): void {
    this.steps = [];
    this.elapsedInCurrent = 0;
  }

  get current(): AnimStep | undefined {
    return this.steps[0];
  }

  get isEmpty(): boolean {
    return this.steps.length === 0;
  }

  get progress(): number {
    const c = this.current;
    if (!c) return 0;
    return Math.min(1, this.elapsedInCurrent / c.duration);
  }

  tick(dtMs: number): void {
    this.elapsedInCurrent += dtMs;
    while (this.steps.length > 0 && this.elapsedInCurrent >= this.steps[0]!.duration) {
      this.elapsedInCurrent -= this.steps[0]!.duration;
      this.steps.shift();
    }
  }
}
