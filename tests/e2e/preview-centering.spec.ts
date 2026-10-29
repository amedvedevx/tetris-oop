import { test, expect, openStory } from './fixtures';
import { expectCenteredPreview, type PreviewGeometry } from './preview-layout';

// Independent visual positions in units of a background cell, not the component's centering formula.
const examples: (PreviewGeometry & { story: string })[] = [
  { kind: 'I', story: 'i', origin: [0, 1.5], offsets: [[0, 0], [1, 0], [2, 0], [3, 0]] },
  { kind: 'O', story: 'o', origin: [1, 1], offsets: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  { kind: 'T', story: 't', origin: [0.5, 1], offsets: [[1, 0], [0, 1], [1, 1], [2, 1]] },
  { kind: 'S', story: 's', origin: [0.5, 1], offsets: [[1, 0], [2, 0], [0, 1], [1, 1]] },
  { kind: 'Z', story: 'z', origin: [0.5, 1], offsets: [[0, 0], [1, 0], [1, 1], [2, 1]] },
  { kind: 'J', story: 'j', origin: [0.5, 1], offsets: [[0, 0], [0, 1], [1, 1], [2, 1]] },
  { kind: 'L', story: 'l', origin: [0.5, 1], offsets: [[2, 0], [0, 1], [1, 1], [2, 1]] },
  { kind: 'I', story: 'supplied-stencil', origin: [1, 0.5], offsets: [[0, 0], [1, 0], [0, 1], [0, 2]] },
];

for (const width of [320, 768, 1280]) {
  for (const example of examples) {
    test(`preview ${example.story} keeps its real cells centered at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await openStory(page, `blocks-nextpiecepreview--${example.story}`);
      await expectCenteredPreview(page.getByRole('img', { name: `Следующая фигура: ${example.kind}`, exact: true }), example);
    });
  }
}

for (const example of examples.filter(item => ['i', 'o', 'supplied-stencil'].includes(item.story))) {
  test(`preview ${example.story} stays centered at 320px and verified 200% root font`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openStory(page, `blocks-nextpiecepreview--${example.story}`);
    const title = page.getByRole('heading', { name: 'Следующая фигура', exact: true });
    const baseline = await title.evaluate(element => parseFloat(getComputedStyle(element).fontSize));
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const enlarged = await title.evaluate(element => parseFloat(getComputedStyle(element).fontSize));
    expect(enlarged).toBeGreaterThanOrEqual(baseline * 1.99);
    await expectCenteredPreview(page.getByRole('img', { name: `Следующая фигура: ${example.kind}`, exact: true }), example);
  });
}
