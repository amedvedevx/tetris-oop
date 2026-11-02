import type { Ticker } from '../../src/presentation/Ticker';

export class ManualTicker implements Ticker {
  readonly #callbacks = new Set<() => void>();

  subscribe(onTick: () => void): () => void {
    this.#callbacks.add(onTick);
    return () => { this.#callbacks.delete(onTick); };
  }

  tick(): void {
    [...this.#callbacks].forEach(callback => callback());
  }
}
