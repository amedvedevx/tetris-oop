import { expect, it, vi } from 'vitest';
import { BrowserTicker } from '../../src/infrastructure/BrowserTicker';

it('cancels browser ticker subscriptions independently and stops their deliveries', () => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
  let stopFirst: (() => void) | undefined;
  let stopSecond: (() => void) | undefined;
  try {
    const ticker = new BrowserTicker();
    let first = 0;
    let second = 0;
    stopFirst = ticker.subscribe(() => { first++; });
    stopSecond = ticker.subscribe(() => { second++; });
    vi.advanceTimersByTime(1000);
    expect(first).toBeGreaterThan(0);
    expect(second).toBeGreaterThan(0);

    stopFirst();
    stopFirst();
    const firstStopped = first;
    const secondBefore = second;
    vi.advanceTimersByTime(1000);
    expect(first).toBe(firstStopped);
    expect(second).toBeGreaterThan(secondBefore);

    stopSecond();
    const secondStopped = second;
    vi.advanceTimersByTime(1000);
    expect(first).toBe(firstStopped);
    expect(second).toBe(secondStopped);
  } finally {
    stopFirst?.();
    stopSecond?.();
    vi.useRealTimers();
  }
});
