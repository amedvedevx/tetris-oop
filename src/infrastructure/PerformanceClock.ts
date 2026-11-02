import type { Clock } from '../domain/Clock';

export class PerformanceClock implements Clock {
  now(): number {
    return performance.now();
  }
}
