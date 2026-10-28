import { Button } from './Button';
import type { GameAction, GamePhase } from './GameScreenData';
import { KeyHint } from './KeyHint';
import { Surface } from './Surface';
import { Typography } from './Typography';
import { Wrapper } from './Wrapper';

export interface GameControlsProps {
  phase: GamePhase;
  onAction?: (action: GameAction) => void;
}
export interface GameControlsElement extends HTMLElement { update(phase: GamePhase): void }
interface ActionLabel { label: string; action: GameAction }

const actions: Record<GamePhase, { primary: ActionLabel; secondary: ActionLabel | null }> = {
  ready: { primary: { label: 'Начать игру', action: 'start' }, secondary: null },
  running: { primary: { label: 'Начать заново', action: 'restart' }, secondary: { label: 'Пауза', action: 'pause' } },
  paused: { primary: { label: 'Продолжить игру', action: 'resume' }, secondary: { label: 'Начать заново', action: 'restart' } },
  gameOver: { primary: { label: 'Играть снова', action: 'restart' }, secondary: null },
};
const shortcuts = [
  ['← / →', 'Сдвинуть'], ['↑ / X', 'Повернуть вправо'], ['Z', 'Повернуть влево'],
  ['↓', 'Мягкое падение'], ['Space', 'Сбросить фигуру'], ['P / Esc', 'Пауза'],
] as const;

export function GameControls({ phase, onAction }: GameControlsProps): GameControlsElement {
  let current = phase;
  const dispatch = (slot: 'primary' | 'secondary') => {
    const action = actions[current][slot];
    if (action) onAction?.(action.action);
  };
  const primary = Button({ label: actions[phase].primary.label, fullWidth: true, disabled: !onAction, onClick: () => dispatch('primary') });
  const secondary = Button({ label: actions[phase].secondary?.label ?? 'Пауза', variant: 'secondary', fullWidth: true, disabled: !onAction || !actions[phase].secondary, onClick: () => dispatch('secondary') });
  const element = Surface({
    as: 'section', size: 'compact', ariaLabel: 'Управление',
    children: [Wrapper({ gap: 'md', children: [
      Typography({ as: 'h2', variant: 'label', text: 'Управление' }),
      Wrapper({ gap: 'sm', children: [primary, secondary] }),
      ...(!onAction ? [Typography({ variant: 'caption', tone: 'muted', text: 'Демонстрация интерфейса. Управление пока недоступно.' })] : []),
      Wrapper({ gap: 'sm', children: shortcuts.map(([key, description]) => Wrapper({
        dir: 'row', gap: 'md', align: 'center', justify: 'between', children: [
          KeyHint({ key }), Typography({ variant: 'caption', tone: 'muted', text: description }),
        ],
      })) }),
    ] })],
  });
  return Object.assign(element, {
    update(next: GamePhase) {
      current = next;
      primary.setLabel(actions[next].primary.label);
      primary.disabled = !onAction;
      secondary.setLabel(actions[next].secondary?.label ?? 'Пауза');
      secondary.disabled = !onAction || !actions[next].secondary;
    },
  });
}
