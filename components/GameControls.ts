import { Button } from './Button';
import type { GameAction, GamePhase } from './GameScreenData';
import { KeyHint } from './KeyHint';
import { Surface } from './Surface';
import { Typography } from './Typography';
import { Wrapper } from './Wrapper';

export interface GameControlsProps {
  phase: GamePhase;
  onAction?: (action: GameAction) => void;
  availability?: GameControlsAvailability;
}
export interface GameControlsAvailability {
  readonly actions: readonly GameAction[];
  readonly shortcuts?: readonly GameShortcut[];
}
export type GameShortcut = keyof typeof shortcuts;
export interface GameControlsElement extends HTMLElement { update(phase: GamePhase): void }
interface ActionLabel { label: string; action: GameAction }

const actions: Record<GamePhase, { primary: ActionLabel; secondary: ActionLabel | null }> = {
  ready: { primary: { label: 'Начать игру', action: 'start' }, secondary: null },
  running: { primary: { label: 'Начать заново', action: 'restart' }, secondary: { label: 'Пауза', action: 'pause' } },
  paused: { primary: { label: 'Продолжить игру', action: 'resume' }, secondary: { label: 'Начать заново', action: 'restart' } },
  gameOver: { primary: { label: 'Играть снова', action: 'restart' }, secondary: null },
};
const shortcuts = {
  move: ['← / →', 'Сдвинуть'], rotateRight: ['↑ / X', 'Повернуть вправо'], rotateLeft: ['Z', 'Повернуть влево'],
  softDrop: ['↓', 'Мягкое падение'], hardDrop: ['Space', 'Сбросить фигуру'], pause: ['P / Esc', 'Пауза'],
} as const;

export function GameControls({ phase, onAction, availability }: GameControlsProps): GameControlsElement {
  let current = phase;
  const allowed = new Set(availability?.actions ?? ['start', 'restart', 'pause', 'resume']);
  const hints = (availability?.shortcuts ?? Object.keys(shortcuts) as GameShortcut[]).map(kind => shortcuts[kind]);
  const enabled = (action: ActionLabel | null) => Boolean(onAction && action && allowed.has(action.action));
  const dispatch = (slot: 'primary' | 'secondary') => {
    const action = actions[current][slot];
    if (action && enabled(action)) onAction?.(action.action);
  };
  const primary = Button({ label: actions[phase].primary.label, fullWidth: true, disabled: !enabled(actions[phase].primary), onClick: () => dispatch('primary') });
  const secondary = Button({ label: actions[phase].secondary?.label ?? 'Пауза', variant: 'secondary', fullWidth: true, disabled: !enabled(actions[phase].secondary), onClick: () => dispatch('secondary') });
  const element = Surface({
    as: 'section', size: 'compact', ariaLabel: 'Управление',
    children: [Wrapper({ gap: 'md', children: [
      Typography({ as: 'h2', variant: 'label', text: 'Управление' }),
      Wrapper({ gap: 'sm', children: [primary, secondary] }),
      ...(!onAction ? [Typography({ variant: 'caption', tone: 'muted', text: 'Демонстрация интерфейса. Управление пока недоступно.' })] : []),
      ...(hints.length ? [Wrapper({ gap: 'sm', children: hints.map(([key, description]) => Wrapper({
        dir: 'row', gap: 'md', align: 'center', justify: 'between', children: [
          KeyHint({ key }), Typography({ variant: 'caption', tone: 'muted', text: description }),
        ],
      })) })] : []),
    ] })],
  });
  return Object.assign(element, {
    update(next: GamePhase) {
      current = next;
      primary.setLabel(actions[next].primary.label);
      primary.disabled = !enabled(actions[next].primary);
      secondary.setLabel(actions[next].secondary?.label ?? 'Пауза');
      secondary.disabled = !enabled(actions[next].secondary);
    },
  });
}
