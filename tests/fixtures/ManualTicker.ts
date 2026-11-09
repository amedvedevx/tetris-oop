import type { Ticker } from '../../src/presentation/Ticker';

export class ManualTicker implements Ticker {
  readonly #callbacks = new Set<() => void>();

  get activeCount(): number { return this.#callbacks.size; }

  subscribe(onTick: () => void): () => void {
    this.#callbacks.add(onTick);
    return () => { this.#callbacks.delete(onTick); };
  }

  tick(): void {
    this.queuedTick()();
  }

  /** Work already queued before an unsubscribe can still be delivered. */
  queuedTick(): () => void {
    const callbacks = [...this.#callbacks];
    return () => callbacks.forEach(callback => callback());
  }
}
