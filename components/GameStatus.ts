import type { GamePhase } from './GameScreenData';
import { Surface } from './Surface';
import { Typography } from './Typography';
import { Wrapper } from './Wrapper';

export interface GameStatusProps { phase: GamePhase; message?: string }
export interface GameStatusElement extends HTMLElement {
  update(phase: GamePhase, message?: string): void;
}

const messages: Record<GamePhase, { title: string; detail: string }> = {
  ready: { title: 'Готов к новой партии', detail: 'Начните партию, чтобы на поле появилась первая фигура.' },
  running: { title: 'Партия идёт', detail: 'Собирайте полные линии и следите за следующей фигурой.' },
  paused: { title: 'Пауза', detail: 'Можно перевести дух. Продолжите, когда будете готовы.' },
  gameOver: { title: 'Партия завершена', detail: 'Попробуйте ещё раз — следующая партия начинается с чистого поля.' },
};

export function GameStatus({ phase, message }: GameStatusProps): GameStatusElement {
  const title = Typography({ as: 'h2', variant: 'heading', text: messages[phase].title });
  const detail = Typography({ variant: 'caption', tone: 'muted', text: message ?? messages[phase].detail });
  const element = Surface({ variant: 'muted', size: 'compact', children: [
    Wrapper({ gap: 'xs', children: [title, detail] }),
  ] });
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
  element.setAttribute('aria-atomic', 'true');
  element.dataset.phase = phase;
  return Object.assign(element, {
    update(next: GamePhase, nextMessage?: string) {
      title.textContent = messages[next].title;
      detail.textContent = nextMessage ?? messages[next].detail;
      element.dataset.phase = next;
    },
  });
}
