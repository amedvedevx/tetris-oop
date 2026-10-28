import { test, expect, openStory } from './fixtures';
import { expectReadable } from './text-layout';

for (const width of [320, 768, 1280]) {
  test(`production app loads its real theme at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const response = await page.goto('http://127.0.0.1:4180/');
    expect(response?.ok()).toBe(true);
    const title = page.getByRole('heading', { level: 1, name: 'Tetris OOP', exact: true });
    await expect(title).toBeVisible();
    const styles = await title.evaluate(element => {
      const titleStyle = getComputedStyle(element);
      return {
        size: Number.parseFloat(titleStyle.fontSize),
        rootSize: Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
        weight: Number(titleStyle.fontWeight),
        margins: [titleStyle.marginTop, titleStyle.marginBottom, getComputedStyle(document.body).margin],
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    // UA h1 styling passes a size-only assertion; reset AND title rules must both load.
    expect(styles.size).toBeGreaterThan(styles.rootSize);
    expect(styles.weight).toBeGreaterThanOrEqual(600);
    expect(styles.margins).toEqual(['0px', '0px', '0px']);
    expect(styles.overflow).toBe(false);
  });
}

test('actual mouse, Enter and Space each activate once without losing focus', async ({ page }) => {
  await openStory(page, 'examples-buttoninteractiondemo--interactive');
  const action = page.getByRole('button', { name: 'Начать игру', exact: true });
  const feedback = page.locator('[aria-live="polite"]');
  await expect(feedback).toHaveText('Нажатий: 0');
  await action.click();
  await expect(feedback).toHaveText('Нажатий: 1');
  await expect(action).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(feedback).toHaveText('Нажатий: 2');
  await expect(action).toBeFocused();
  await page.keyboard.down('Space');
  await expect(feedback).toHaveText('Нажатий: 2');
  await page.keyboard.up('Space');
  await expect(feedback).toHaveText('Нажатий: 3');
  await expect(action).toBeFocused();
});

test('native disabled action ignores a physical pointer click and stays unfocused', async ({ page }) => {
  await openStory(page, 'examples-buttoninteractiondemo--disabled');
  const action = page.getByRole('button', { name: 'Начать игру', exact: true });
  await expect(action).toBeDisabled();
  const bounds = await action.boundingBox();
  expect(bounds).not.toBeNull();
  await page.mouse.click(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await expect(action).not.toBeFocused();
  // Keyboard is delivered to the actual active element, not synthetically to a disabled button.
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await expect(page.locator('[aria-live="polite"]')).toHaveText('Нажатий: 0');
  await expect(action).not.toBeFocused();
});

test('responsive row changes actual placement without overlapping items', async ({ page }) => {
  await openStory(page, 'foundations-wrapper--responsive-row');
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    const items = await Promise.all(['Первый блок', 'Второй блок', 'Третий блок'].map(async text => {
      const item = page.getByText(text, { exact: true });
      await expect(item).toBeVisible();
      return item.boundingBox();
    }));
    expect(items.every(item => item && item.width > 0 && item.height > 0)).toBe(true);
    const [first, second, third] = items;
    if (width === 320) {
      expect(second!.y).toBeGreaterThanOrEqual(first!.y + first!.height);
      expect(third!.y).toBeGreaterThanOrEqual(second!.y + second!.height);
    } else {
      expect(Math.abs(first!.y - second!.y)).toBeLessThan(1);
      expect(Math.abs(second!.y - third!.y)).toBeLessThan(1);
      expect(second!.x).toBeGreaterThanOrEqual(first!.x + first!.width);
      expect(third!.x).toBeGreaterThanOrEqual(second!.x + second!.width);
    }
  }
});

test('responsive grid places one, two and three actual columns', async ({ page }) => {
  await openStory(page, 'foundations-wrapper--responsive-grid');
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    const boxes = await Promise.all(['Первый блок', 'Второй блок', 'Третий блок']
      .map(text => page.getByText(text, { exact: true }).boundingBox()));
    expect(boxes.every(box => box && box.width > 0 && box.height > 0)).toBe(true);
    const [first, second, third] = boxes;
    if (width === 320) {
      expect(second!.y).toBeGreaterThanOrEqual(first!.y + first!.height);
      expect(third!.y).toBeGreaterThanOrEqual(second!.y + second!.height);
    } else {
      expect(Math.abs(first!.y - second!.y)).toBeLessThan(1);
      expect(second!.x).toBeGreaterThanOrEqual(first!.x + first!.width);
      if (width === 768) {
        expect(third!.y).toBeGreaterThanOrEqual(first!.y + first!.height);
        expect(Math.abs(third!.x - first!.x)).toBeLessThan(1);
      } else {
        expect(Math.abs(third!.y - first!.y)).toBeLessThan(1);
        expect(third!.x).toBeGreaterThanOrEqual(second!.x + second!.width);
      }
    }
  }
});

const longContent = [
  {
    story: 'foundations-typography--long-text',
    text: 'ОченьДлиннаяНепрерывнаяПодписьДляПроверкиПереносаБезОбрезанияТекстаНаУзкомЭкране',
    wraps: true,
  },
  { story: 'foundations-typography--metric', text: '1234567890', wraps: false },
  {
    story: 'examples-buttoninteractiondemo--long-label',
    text: 'Продолжить текущую игру после возвращения к активной вкладке', wraps: true,
  },
  {
    story: 'components-keyhint--long-key',
    text: 'ОченьДлинноеОбозначениеКлавишиДляПроверкиПереноса', wraps: true,
  },
  {
    story: 'components-surface--long-content',
    text: 'ДлиннаяПодписьКотораяДолжнаОставатьсяВГраницахПанелиИПереноситьсяНаУзкомЭкране', wraps: true,
  },
];

for (const { story, text, wraps } of longContent) {
  test(`${story} remains readable at 320px and verified 200% root font`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openStory(page, story);
    const target = page.getByText(text, { exact: true });
    const baseline = await expectReadable(target, text, wraps);
    // A documented root-font stress test, not browser-native text zoom or deviceScaleFactor.
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const enlarged = await expectReadable(target, text, wraps);
    expect(enlarged.fontSize).toBeGreaterThanOrEqual(baseline.fontSize * 1.99);
    if (story === 'examples-buttoninteractiondemo--long-label') {
      await page.getByRole('button', { name: text, exact: true }).click();
      await expect(page.locator('[aria-live="polite"]')).toHaveText('Нажатий: 1');
    }
  });
}

test('fixed and fluid cells stay nonzero squares, with fluid filling the available width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await openStory(page, 'components-boardcell--large');
  const fixed = await page.getByRole('img', { name: 'Закреплённый блок O' }).boundingBox();
  expect(fixed).not.toBeNull();
  expect(fixed!.width).toBeGreaterThan(0);
  expect(Math.abs(fixed!.height - fixed!.width)).toBeLessThan(1);
  await openStory(page, 'components-boardcell--fluid');
  const cell = page.getByRole('img', { name: 'Закреплённый блок J' });
  const fluid = await cell.boundingBox();
  expect(fluid).not.toBeNull();
  const availableWidth = await cell.evaluate(element => {
    const parent = element.parentElement!;
    const style = getComputedStyle(parent);
    return parent.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight);
  });
  expect(availableWidth).toBeGreaterThan(0);
  expect(fluid!.width).toBeCloseTo(availableWidth, 0);
  expect(Math.abs(fluid!.height - fluid!.width)).toBeLessThan(1);
});
