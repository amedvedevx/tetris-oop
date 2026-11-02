import type { Clock } from '../../src/domain/Clock';

/** Controlled external time; advancing it does not deliver a refresh callback. */
export class ManualClock implements Clock {
  constructor(private time = 0) {}

  now(): number { return this.time; }
  advance(milliseconds: number): void { this.time += milliseconds; }
}
