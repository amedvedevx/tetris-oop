import { Typography } from './Typography';
import { Wrapper } from './Wrapper';

export interface StatItemProps {
  label: string;
  value: string | number;
}

export function StatItem({ label, value }: StatItemProps): HTMLDListElement {
  const element = document.createElement('dl');
  element.className = 'min-w-0';
  const term = document.createElement('dt');
  term.append(Typography({ as: 'span', variant: 'caption', tone: 'muted', text: label }));
  const definition = document.createElement('dd');
  definition.append(Typography({ as: 'span', variant: 'metric', text: value }));
  element.append(Wrapper({ gap: 'xs', children: [term, definition] }));
  return element;
}
