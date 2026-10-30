import type { RandomSource } from '../../src/domain/RandomSource';

/** A finite external input: unexpected draws fail instead of silently repeating the last bag. */
export class ScriptedRandom implements RandomSource {
  #cursor = 0;
  readonly #values: readonly (number | Error)[];

  constructor(values: readonly (number | Error)[]) {
    this.#values = [...values];
  }

  get calls(): number { return this.#cursor; }

  next(): number {
    const value = this.#values[this.#cursor++];
    if (value === undefined) throw new Error('Controlled random sequence exhausted');
    if (value instanceof Error) throw value;
    return value;
  }
}
