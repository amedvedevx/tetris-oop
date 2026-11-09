import type { Ticker } from '../presentation/Ticker';

export class BrowserTicker implements Ticker {
  subscribe(onTick: () => void): () => void {
    const handle = window.setInterval(onTick, 250);
    return () => window.clearInterval(handle);
  }
}
