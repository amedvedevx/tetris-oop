import type { GameMetrics } from './GameScreenData';
import { StatItem } from './StatItem';
import { Surface } from './Surface';
import { Typography } from './Typography';
import { Wrapper } from './Wrapper';

export function GameStats(metrics: GameMetrics): HTMLElement {
  return Surface({
    as: 'section', size: 'compact', ariaLabel: 'Показатели партии',
    children: [Wrapper({ gap: 'md', children: [
      Typography({ as: 'h2', variant: 'label', text: 'Показатели партии' }),
      Wrapper({ display: 'grid', columns: 2, gap: 'md', children: [
        StatItem({ label: 'Очки', value: metrics.score }),
        StatItem({ label: 'Рекорд', value: metrics.highScore }),
        StatItem({ label: 'Линии', value: metrics.lines }),
        StatItem({ label: 'Уровень', value: metrics.level }),
      ] }),
    ] })],
  });
}
