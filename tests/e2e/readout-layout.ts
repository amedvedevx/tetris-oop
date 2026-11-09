import type { Locator } from '@playwright/test';
import { expect } from './fixtures';

/** Measure the rendered glyph ranges, including wrapped lines, in each readout. */
export async function expectReadoutsSeparated(panel: Locator) {
  const ranges = await panel.locator('dl').evaluateAll(pairs => pairs.map(pair => {
    const walker = document.createTreeWalker(pair, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    const lines: { left: number; right: number }[] = [];
    while (walker.nextNode()) {
      range.selectNodeContents(walker.currentNode);
      for (const rect of range.getClientRects()) {
        if (rect.width > 0 && rect.height > 0) lines.push({ left: rect.left, right: rect.right });
      }
    }
    return lines;
  }));
  expect(ranges).toHaveLength(2);
  const [score, time] = ranges;
  expect(score!.length).toBeGreaterThan(0);
  expect(time!.length).toBeGreaterThan(0);
  expect(Math.max(...score!.map(rect => rect.right))).toBeLessThanOrEqual(Math.min(...time!.map(rect => rect.left)) + 1);
}
