import { Typography } from './Typography';
import { Wrapper } from './Wrapper';

export function GameHeader(): HTMLElement {
  return Wrapper({ as: 'header', gap: 'xs', children: [
    Typography({ variant: 'caption', tone: 'accent', text: 'ЛОКАЛЬНО. В СВОЁМ ТЕМПЕ.' }),
    Typography({ as: 'h1', variant: 'title', text: 'Tetris OOP' }),
    Typography({ tone: 'muted', text: 'Собирайте линии, освобождайте место для следующего хода.' }),
  ] });
}
