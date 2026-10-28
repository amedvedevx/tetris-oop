import { wrapperClasses } from './Wrapper.layout';

export const wrapperOptions = {
  tags: ['div', 'main', 'section', 'header', 'footer'],
  displays: ['flex', 'grid'],
  directions: ['row', 'column'],
  columns: [1, 2, 3, 4, 10],
  spaces: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
  alignments: ['start', 'center', 'end', 'stretch'],
  justifications: ['start', 'center', 'end', 'between'],
  widths: ['auto', 'full'],
  maxWidths: ['none', 'reading', 'game', 'content'],
} as const;
export type Space = typeof wrapperOptions.spaces[number];
export type Responsive<T> = T | { base: T; sm?: T; md?: T; lg?: T };
export type Direction = typeof wrapperOptions.directions[number];
export type Alignment = typeof wrapperOptions.alignments[number];
export type Justification = typeof wrapperOptions.justifications[number];
export type Columns = typeof wrapperOptions.columns[number];

interface SharedLayoutProps {
  children: readonly HTMLElement[];
  as?: typeof wrapperOptions.tags[number];
  gap?: Responsive<Space>;
  padding?: Responsive<Space>;
  margin?: Responsive<Space>;
  align?: Responsive<Alignment>;
  justify?: Responsive<Justification>;
  width?: typeof wrapperOptions.widths[number];
  maxWidth?: typeof wrapperOptions.maxWidths[number];
  id?: string;
  ariaLabel?: string;
}

// Direction belongs to flex; column count belongs to grid.
export type WrapperProps = SharedLayoutProps & (
  | { display?: 'flex'; dir?: Responsive<Direction>; columns?: never }
  | { display: 'grid'; columns?: Responsive<Columns>; dir?: never }
);

export function Wrapper(props: WrapperProps): HTMLElement {
  const { children, as = 'div', id, ariaLabel } = props;
  const element = document.createElement(as);
  element.className = wrapperClasses(props);
  if (id) element.id = id;
  if (ariaLabel) element.setAttribute('aria-label', ariaLabel);
  element.append(...children);
  return element;
}
