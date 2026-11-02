import { Typography } from './Typography';
import { Wrapper } from './Wrapper';

export interface StatItemProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'readout';
}
export interface StatItemElement extends HTMLDListElement { setValue(value: string | number): void }

export function StatItem({ label, value, variant = 'default' }: StatItemProps): StatItemElement {
  const readout = variant === 'readout';
  const element = document.createElement('dl');
  element.className = 'min-w-0';
  const term = document.createElement('dt');
  term.append(Typography({ as: 'span', variant: readout ? 'readoutLabel' : 'caption', tone: readout ? 'inverseMuted' : 'muted', text: label }));
  const definition = document.createElement('dd');
  definition.className = 'min-w-0';
  const text = Typography({ as: 'span', variant: readout ? 'readoutValue' : 'metric', tone: readout ? 'inverse' : 'default', text: value });
  definition.append(text);
  element.append(Wrapper({ dir: readout ? 'row' : 'column', gap: 'xs', align: readout ? 'center' : 'stretch', children: [term, definition] }));
  return Object.assign(element, {
    setValue(value: string | number) {
      if (text.textContent !== String(value)) text.textContent = String(value);
    },
  });
}
