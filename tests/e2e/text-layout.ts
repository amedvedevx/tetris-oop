import type { Locator } from '@playwright/test';
import { expect } from './fixtures';

/** Text ranges expose clipping that a page-level scrollWidth check can miss. */
export async function textMetrics(target: Locator) {
  return target.evaluate(element => {
    const bounds = element.getBoundingClientRect();
    const lines: DOMRect[] = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const range = document.createRange();
      range.selectNodeContents(walker.currentNode);
      lines.push(...Array.from(range.getClientRects()).filter(rect => rect.width > 0 && rect.height > 0));
    }
    const problems: string[] = [];
    const tolerance = 1;
    for (const line of lines) {
      if (line.left < -tolerance || line.right > innerWidth + tolerance) problems.push('text leaves viewport');
      if (line.left < bounds.left - tolerance || line.right > bounds.right + tolerance
        || line.top < bounds.top - tolerance || line.bottom > bounds.bottom + tolerance) {
        problems.push('text leaves its component');
      }
    }
    for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      const rect = ancestor.getBoundingClientRect();
      const left = rect.left + ancestor.clientLeft;
      const top = rect.top + ancestor.clientTop;
      for (const line of lines) {
        if (/(hidden|clip|auto|scroll)/.test(style.overflowX)
          && (line.left < left - tolerance || line.right > left + ancestor.clientWidth + tolerance)) {
          problems.push('ancestor clips text horizontally');
        }
        if (/(hidden|clip|auto|scroll)/.test(style.overflowY)
          && (line.top < top - tolerance || line.bottom > top + ancestor.clientHeight + tolerance)) {
          problems.push('ancestor clips text vertically');
        }
      }
    }
    return {
      width: bounds.width,
      height: bounds.height,
      fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
      lineCount: new Set(lines.map(line => Math.round(line.top))).size,
      rangeCount: lines.length,
      overflow: element.scrollWidth > element.clientWidth + tolerance,
      pageOverflow: document.documentElement.scrollWidth > innerWidth + tolerance,
      problems,
    };
  });
}

export async function expectReadable(target: Locator, text: string, wraps: boolean) {
  await expect(target).toHaveText(text);
  const metrics = await textMetrics(target);
  expect(metrics.width).toBeGreaterThan(0);
  expect(metrics.height).toBeGreaterThan(0);
  expect(metrics.rangeCount).toBeGreaterThan(0);
  expect(metrics.problems).toEqual([]);
  expect(metrics.overflow).toBe(false);
  expect(metrics.pageOverflow).toBe(false);
  if (wraps) expect(metrics.lineCount).toBeGreaterThan(1);
  return metrics;
}
