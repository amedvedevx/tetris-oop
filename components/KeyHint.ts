import { Typography } from './Typography';

export interface KeyHintProps {
  key: string;
}

export function KeyHint({ key }: KeyHintProps): HTMLElement {
  const element = document.createElement('kbd');
  element.className = 'inline-flex min-w-8 w-fit max-w-full items-center justify-center rounded-md border border-b-2 border-line bg-surface-muted px-2 py-1';
  element.append(Typography({ as: 'span', variant: 'caption', text: key }));
  return element;
}
