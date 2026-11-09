import { StatItem } from './StatItem';
import { Wrapper } from './Wrapper';

export interface GameStatsProps { readonly score: number; readonly elapsedMs: number }
export interface GameStatsElement extends HTMLElement { updateElapsedTime(elapsedMs: number): void }

function formatTime(elapsedMs: number): string {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) throw new RangeError('Elapsed time must be finite and non-negative');
  const seconds = Math.floor(elapsedMs / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function GameStats({ score, elapsedMs }: GameStatsProps): GameStatsElement {
  const time = StatItem({ label: 'time', value: formatTime(elapsedMs), variant: 'readout' });
  const element = document.createElement('section');
  element.className = 'w-full rounded-b-lg bg-surface-dark px-2 py-3';
  element.setAttribute('aria-label', 'Показатели партии');
  element.append(Wrapper({ display: 'grid', columns: 2, gap: 'sm', children: [
    StatItem({ label: 'score', value: String(score).padStart(4, '0'), variant: 'readout' }),
    Wrapper({ dir: 'row', justify: 'end', children: [time] }),
  ] }));
  return Object.assign(element, {
    updateElapsedTime(elapsedMs: number) { time.setValue(formatTime(elapsedMs)); },
  });
}
