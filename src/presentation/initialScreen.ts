import type { GameScreenData } from '../../components/GameScreenData';

/** The static shell has no session, clock, queue or storage yet. */
export function initialScreen(): GameScreenData {
  return {
    phase: 'ready',
    cells: Array.from({ length: 20 }, () => Array.from({ length: 10 }, () => ({ state: 'empty' as const }))),
    next: null,
    metrics: { score: 0, lines: 0, level: 1, highScore: 0 },
  };
}
