import type { Locator } from '@playwright/test';
import { expect } from './fixtures';

export interface PreviewGeometry {
  readonly kind: string;
  readonly origin: readonly [number, number];
  readonly offsets: readonly (readonly [number, number])[];
}

/** Measures painted BoardCells, independently of source-coordinate diagnostics or CSS classes. */
export async function expectCenteredPreview(image: Locator, expected: PreviewGeometry) {
  const layout = await image.evaluate(stencil => {
    const box = (element: Element) => {
      const r = element.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    const outer = box(stencil);
    const style = getComputedStyle(stencil);
    const content = {
      left: outer.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft),
      top: outer.top + parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop),
      right: outer.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight),
      bottom: outer.bottom - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingBottom),
    };
    const measure = (cell: Element) => {
      const rect = box(cell);
      let visible = true;
      let clipped = false;
      for (let ancestor: Element | null = cell; ancestor; ancestor = ancestor.parentElement) {
        const s = getComputedStyle(ancestor);
        visible &&= s.display !== 'none' && s.visibility === 'visible' && Number(s.opacity) > 0;
        if (ancestor === cell) continue;
        const bounds = ancestor.getBoundingClientRect();
        const clipX = /hidden|clip|scroll|auto/.test(s.overflowX);
        const clipY = /hidden|clip|scroll|auto/.test(s.overflowY);
        clipped ||= clipX && (rect.left < bounds.left + ancestor.clientLeft - 1 || rect.right > bounds.left + ancestor.clientLeft + ancestor.clientWidth + 1);
        clipped ||= clipY && (rect.top < bounds.top + ancestor.clientTop - 1 || rect.bottom > bounds.top + ancestor.clientTop + ancestor.clientHeight + 1);
      }
      return { ...rect, visible, clipped, color: getComputedStyle(cell).backgroundColor, piece: cell.getAttribute('data-piece') };
    };
    return {
      content, total: stencil.querySelectorAll('[data-state]').length,
      occupied: stencil.querySelectorAll('[data-piece]').length,
      background: Array.from(stencil.querySelectorAll('[data-state="empty"]'), measure),
      foreground: Array.from(stencil.querySelectorAll('[data-state="locked"]'), measure)
        .sort((a, b) => a.top - b.top || a.left - b.left),
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
    };
  });
  expect(layout.overflow).toBe(false);
  expect(layout.total).toBe(20);
  expect(layout.occupied).toBe(4);
  expect(layout.background).toHaveLength(16);
  expect(layout.foreground).toHaveLength(4);
  const side = (layout.content.right - layout.content.left) / 4;
  expect(side).toBeGreaterThan(0);
  expect(Math.abs(layout.content.bottom - layout.content.top - side * 4)).toBeLessThan(1);
  for (const [index, cell] of layout.background.entries()) {
    expect(cell.piece).toBeNull();
    expect(Math.abs(cell.left - layout.content.left - (index % 4) * side)).toBeLessThan(1);
    expect(Math.abs(cell.top - layout.content.top - Math.floor(index / 4) * side)).toBeLessThan(1);
  }
  for (const cell of [...layout.background, ...layout.foreground]) {
    expect(cell.visible).toBe(true);
    expect(cell.clipped).toBe(false);
    expect(Math.abs(cell.width - side)).toBeLessThan(1);
    expect(Math.abs(cell.height - side)).toBeLessThan(1);
  }
  for (const [index, cell] of layout.foreground.entries()) {
    const [x, y] = expected.offsets[index]!;
    expect(cell.piece).toBe(expected.kind);
    expect(cell.color).not.toBe(layout.background[0]!.color);
    expect(cell.color).not.toBe('rgba(0, 0, 0, 0)');
    expect(cell.color).not.toBe('transparent');
    expect(Math.abs(cell.left - layout.content.left - (expected.origin[0] + x) * side)).toBeLessThan(1);
    expect(Math.abs(cell.top - layout.content.top - (expected.origin[1] + y) * side)).toBeLessThan(1);
    expect(cell.left).toBeGreaterThanOrEqual(layout.content.left - 1);
    expect(cell.right).toBeLessThanOrEqual(layout.content.right + 1);
    expect(cell.top).toBeGreaterThanOrEqual(layout.content.top - 1);
    expect(cell.bottom).toBeLessThanOrEqual(layout.content.bottom + 1);
  }
  const left = Math.min(...layout.foreground.map(cell => cell.left));
  const right = Math.max(...layout.foreground.map(cell => cell.right));
  const top = Math.min(...layout.foreground.map(cell => cell.top));
  const bottom = Math.max(...layout.foreground.map(cell => cell.bottom));
  expect(Math.abs(left + right - layout.content.left - layout.content.right)).toBeLessThan(1);
  expect(Math.abs(top + bottom - layout.content.top - layout.content.bottom)).toBeLessThan(1);
}
