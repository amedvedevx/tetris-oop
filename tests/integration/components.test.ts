import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BoardCell } from '../../components/BoardCell';
import { Button } from '../../components/Button';
import { ButtonInteractionDemo } from '../../components/ButtonInteractionDemo';
import { KeyHint } from '../../components/KeyHint';
import { Surface } from '../../components/Surface';
import { Typography } from '../../components/Typography';
import { Wrapper } from '../../components/Wrapper';

// These are DOM integration tests: all composed children use their real implementations.
describe('Typography content and semantics', () => {
  it('keeps heading semantics when the visual variant is body', () => {
    document.body.append(Typography({ as: 'h2', variant: 'body', text: 'Следующая фигура' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Следующая фигура' })).toBeVisible();
  });

  it('does not turn the title visual variant into a heading', () => {
    const text = Typography({ as: 'p', variant: 'title', text: 'Статистика' });
    document.body.append(text);
    expect(text.tagName).toBe('P');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('Статистика')).toBeVisible();
  });

  it.each([0, ''])('preserves the value %j', value => {
    const text = Typography({ text: value });
    document.body.append(text);
    expect(text.textContent).toBe(String(value));
    expect(text).toBeInTheDocument();
  });

  it('renders HTML-like content literally without creating HTML descendants', () => {
    const literal = '<strong>Это обычный текст</strong>';
    const text = Typography({ text: literal });
    document.body.append(text);
    expect(screen.getByText(literal)).toBe(text);
    expect(text.children).toHaveLength(0);
  });

  it('preserves the supplied identity, accessible name and live announcement mode', () => {
    const text = Typography({ text: 42, as: 'h3', id: 'score', ariaLabel: 'Очки', live: 'polite' });
    document.body.append(text);
    expect(screen.getByRole('heading', { level: 3, name: 'Очки' })).toHaveTextContent('42');
    expect(text).toHaveAttribute('id', 'score');
    expect(text).toHaveAttribute('aria-live', 'polite');
  });
});

describe('real component composition', () => {
  it('preserves content, accessibility and native button behavior inside a form', async () => {
    const user = userEvent.setup();
    const form = document.createElement('form');
    let submissions = 0;
    form.addEventListener('submit', event => { event.preventDefault(); submissions += 1; });
    const heading = Typography({ as: 'h2', variant: 'heading', text: 'Партия' });
    const description = Typography({ id: 'start-description', text: 'Создаёт новую партию.' });
    const feedback = Typography({ text: 'Нажатий: 0', live: 'polite' });
    let clicks = 0;
    const action = Button({
      label: 'Старт', ariaLabel: 'Начать новую партию', ariaDescribedBy: 'start-description',
      onClick: () => { feedback.textContent = `Нажатий: ${++clicks}`; },
    });
    const hint = KeyHint({ key: 'Enter' });
    const children = [heading, description, action, hint, feedback];
    const layout = Wrapper({
      display: 'grid', columns: 2, gap: 'md', padding: 'sm', margin: 'xs', children,
    });
    form.append(Surface({ as: 'section', ariaLabel: 'Управление партией', children: [layout] }));
    document.body.append(form);

    const panel = screen.getByRole('region', { name: 'Управление партией' });
    const button = within(panel).getByRole('button', { name: 'Начать новую партию' });
    expect(button).toHaveAccessibleDescription('Создаёт новую партию.');
    expect(within(panel).getByRole('heading', { level: 2, name: 'Партия' })).toBe(heading);
    expect(Array.from(layout.children)).toEqual(children);
    expect(hint.tagName).toBe('KBD');
    expect(within(hint).getByText('Enter')).toBeVisible();
    for (const attribute of ['dir', 'display', 'columns', 'gap', 'padding', 'margin', 'align', 'justify']) {
      expect(layout).not.toHaveAttribute(attribute);
    }

    await user.click(button);
    expect(feedback).toHaveTextContent('Нажатий: 1');
    expect(button).toHaveFocus();
    expect(submissions).toBe(0);
  });

  it('skips a disabled action in tab order and suppresses its action', async () => {
    const user = userEvent.setup();
    const feedback = Typography({ text: 'Действий: 0' });
    let actions = 0;
    const onClick = () => { feedback.textContent = `Действий: ${++actions}`; };
    const before = Button({ label: 'До', onClick });
    const disabled = Button({ label: 'Недоступно', disabled: true, onClick });
    const after = Button({ label: 'После', onClick });
    document.body.append(Wrapper({ children: [before, disabled, after, feedback] }));

    await user.tab();
    expect(before).toHaveFocus();
    await user.tab();
    expect(after).toHaveFocus();
    await user.click(disabled);
    disabled.click();
    expect(feedback).toHaveTextContent('Действий: 0');
    expect(disabled).toBeDisabled();
    await user.click(after);
    expect(feedback).toHaveTextContent('Действий: 1');
  });

  it('isolates simultaneous demo instances and initializes a new instance independently', async () => {
    const user = userEvent.setup();
    const first = ButtonInteractionDemo({ label: 'Первая' });
    const second = ButtonInteractionDemo({ label: 'Вторая' });
    document.body.append(first, second);
    const firstAction = within(first).getByRole('button', { name: 'Первая' });
    await user.click(firstAction);
    await user.click(firstAction);
    expect(within(first).getByText('Нажатий: 2')).toHaveAttribute('aria-live', 'polite');
    expect(within(second).getByText('Нажатий: 0')).toBeVisible();
    await user.click(within(second).getByRole('button', { name: 'Вторая' }));
    expect(within(first).getByText('Нажатий: 2')).toBeVisible();
    expect(within(second).getByText('Нажатий: 1')).toBeVisible();

    const third = ButtonInteractionDemo({ label: 'Третья' });
    document.body.append(third);
    expect(within(third).getByText('Нажатий: 0')).toBeVisible();
    expect(within(first).getByText('Нажатий: 2')).toBeVisible();
    expect(within(second).getByText('Нажатий: 1')).toBeVisible();
  });
});

describe('BoardCell accessible content', () => {
  it('distinguishes empty, active and locked cells and hides decorative cells', () => {
    const empty = BoardCell({ state: 'empty' });
    const active = BoardCell({ state: 'active', piece: 'T' });
    const locked = BoardCell({ state: 'locked', piece: 'I' });
    const decorative = BoardCell({ state: 'locked', piece: 'S', decorative: true });
    document.body.append(Wrapper({ children: [empty, active, locked, decorative] }));
    expect(screen.getByRole('img', { name: 'Пустая клетка' })).toBe(empty);
    expect(screen.getByRole('img', { name: 'Активный блок T' })).toBe(active);
    expect(screen.getByRole('img', { name: 'Закреплённый блок I' })).toBe(locked);
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.queryByRole('img', { name: 'Закреплённый блок S' })).not.toBeInTheDocument();
    expect(decorative).toHaveAttribute('aria-hidden', 'true');
    expect(empty).not.toHaveAttribute('data-piece');
    expect(active).toHaveAttribute('data-state', 'active');
    expect(active).toHaveAttribute('data-piece', 'T');
  });
});
