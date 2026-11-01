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
const movementActions = [
  { action: 'moveLeft', label: '←', ariaLabel: 'Сдвинуть фигуру влево' },
  { action: 'moveRight', label: '→', ariaLabel: 'Сдвинуть фигуру вправо' },
] as const;

export function GameControls({ phase, onAction, availability }: GameControlsProps): GameControlsElement {
  let current = phase;
  const allowed = new Set(availability?.actions ?? ['start', 'restart', 'pause', 'resume']);
  const hints = (availability?.shortcuts ?? Object.keys(shortcuts) as GameShortcut[]).map(kind => shortcuts[kind]);
  const enabled = (action: ActionLabel | null) => Boolean(onAction && action && allowed.has(action.action));
  const dispatch = (slot: 'primary' | 'secondary') => {
    const action = actions[current][slot];
    if (action && enabled(action)) onAction?.(action.action);
  };
  const phaseButtons = (['primary', 'secondary'] as const).map(slot => ({
    slot,
    button: Button({
      label: actions[phase][slot]?.label ?? 'Пауза',
      variant: slot === 'primary' ? 'primary' : 'secondary', fullWidth: true,
      disabled: !enabled(actions[phase][slot]), onClick: () => dispatch(slot),
    }),
  }));
  const canMove = (action: GameAction) => current === 'running' && Boolean(onAction) && allowed.has(action);
  const movement = allowed.has('moveLeft') || allowed.has('moveRight') ? movementActions.map(({ action, label, ariaLabel }) => ({
    action,
    button: Button({
      label, ariaLabel, variant: 'secondary', size: 'small', fullWidth: true, disabled: !canMove(action),
      onClick: () => { if (canMove(action)) onAction?.(action); },
    }),
  })) : [];
  const children = [
    Typography({ as: 'h2', variant: 'label', text: 'Управление' }),
    Wrapper({ gap: 'sm', children: phaseButtons.map(({ button }) => button) }),
  ];
  if (movement.length) {
    children.push(Wrapper({ display: 'grid', columns: 2, gap: 'sm', children: movement.map(({ button }) => button) }));
  }
  if (!onAction) {
    children.push(Typography({ variant: 'caption', tone: 'muted', text: 'Демонстрация интерфейса. Управление пока недоступно.' }));
  }
  if (hints.length) {
    children.push(Wrapper({ gap: 'sm', children: hints.map(([key, description]) => Wrapper({
      dir: 'row', gap: 'md', align: 'center', justify: 'between', children: [
        KeyHint({ key }), Typography({ variant: 'caption', tone: 'muted', text: description }),
      ],
    })) }));
  }
  const element = Surface({
    as: 'section', size: 'compact', ariaLabel: 'Управление',
    children: [Wrapper({ gap: 'md', children })],
  });
  return Object.assign(element, {
    update(next: GamePhase) {
      current = next;
      for (const { slot, button } of phaseButtons) {
        const action = actions[next][slot];
        button.setLabel(action?.label ?? 'Пауза');
        button.disabled = !enabled(action);
      }
      for (const { action, button } of movement) button.disabled = !canMove(action);
    },
  });
}
