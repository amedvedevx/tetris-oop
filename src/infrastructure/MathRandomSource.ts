import type { RandomSource } from '../domain/RandomSource';

export class MathRandomSource implements RandomSource {
  next(): number {
    return Math.random();
  }
}
