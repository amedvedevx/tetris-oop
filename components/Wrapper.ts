export type Space = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Responsive<T> = T | { base: T; sm?: T; md?: T; lg?: T };
type Direction = 'row' | 'column';
type Alignment = 'start' | 'center' | 'end' | 'stretch';
type Justification = 'start' | 'center' | 'end' | 'between';
type Columns = 1 | 2 | 3 | 4 | 10;
type ClassSet = readonly [string, string, string, string];

export interface WrapperProps {
  children: readonly HTMLElement[];
  as?: 'div' | 'main' | 'section' | 'header' | 'footer';
  display?: 'flex' | 'grid';
  dir?: Responsive<Direction>;
  columns?: Responsive<Columns>;
  gap?: Responsive<Space>;
  padding?: Responsive<Space>;
  margin?: Responsive<Space>;
  align?: Responsive<Alignment>;
  justify?: Responsive<Justification>;
  width?: 'auto' | 'full';
  maxWidth?: 'none' | 'reading' | 'content';
  id?: string;
  ariaLabel?: string;
}

// Complete class names keep every responsive variant visible to Tailwind's scanner.
const directions: Record<Direction, ClassSet> = {
  row: ['flex-row', 'sm:flex-row', 'md:flex-row', 'lg:flex-row'],
  column: ['flex-col', 'sm:flex-col', 'md:flex-col', 'lg:flex-col'],
};
const columns: Record<Columns, ClassSet> = {
  1: ['grid-cols-1', 'sm:grid-cols-1', 'md:grid-cols-1', 'lg:grid-cols-1'],
  2: ['grid-cols-2', 'sm:grid-cols-2', 'md:grid-cols-2', 'lg:grid-cols-2'],
  3: ['grid-cols-3', 'sm:grid-cols-3', 'md:grid-cols-3', 'lg:grid-cols-3'],
  4: ['grid-cols-4', 'sm:grid-cols-4', 'md:grid-cols-4', 'lg:grid-cols-4'],
  10: ['grid-cols-10', 'sm:grid-cols-10', 'md:grid-cols-10', 'lg:grid-cols-10'],
};
const gaps: Record<Space, ClassSet> = {
  none: ['gap-0', 'sm:gap-0', 'md:gap-0', 'lg:gap-0'],
  xs: ['gap-1', 'sm:gap-1', 'md:gap-1', 'lg:gap-1'],
  sm: ['gap-2', 'sm:gap-2', 'md:gap-2', 'lg:gap-2'],
  md: ['gap-4', 'sm:gap-4', 'md:gap-4', 'lg:gap-4'],
  lg: ['gap-6', 'sm:gap-6', 'md:gap-6', 'lg:gap-6'],
  xl: ['gap-8', 'sm:gap-8', 'md:gap-8', 'lg:gap-8'],
};
const paddings: Record<Space, ClassSet> = {
  none: ['p-0', 'sm:p-0', 'md:p-0', 'lg:p-0'],
  xs: ['p-1', 'sm:p-1', 'md:p-1', 'lg:p-1'],
  sm: ['p-2', 'sm:p-2', 'md:p-2', 'lg:p-2'],
  md: ['p-4', 'sm:p-4', 'md:p-4', 'lg:p-4'],
  lg: ['p-6', 'sm:p-6', 'md:p-6', 'lg:p-6'],
  xl: ['p-8', 'sm:p-8', 'md:p-8', 'lg:p-8'],
};
const margins: Record<Space, ClassSet> = {
  none: ['m-0', 'sm:m-0', 'md:m-0', 'lg:m-0'],
  xs: ['m-1', 'sm:m-1', 'md:m-1', 'lg:m-1'],
  sm: ['m-2', 'sm:m-2', 'md:m-2', 'lg:m-2'],
  md: ['m-4', 'sm:m-4', 'md:m-4', 'lg:m-4'],
  lg: ['m-6', 'sm:m-6', 'md:m-6', 'lg:m-6'],
  xl: ['m-8', 'sm:m-8', 'md:m-8', 'lg:m-8'],
};
const alignments: Record<Alignment, ClassSet> = {
  start: ['items-start', 'sm:items-start', 'md:items-start', 'lg:items-start'],
  center: ['items-center', 'sm:items-center', 'md:items-center', 'lg:items-center'],
  end: ['items-end', 'sm:items-end', 'md:items-end', 'lg:items-end'],
  stretch: ['items-stretch', 'sm:items-stretch', 'md:items-stretch', 'lg:items-stretch'],
};
const justifications: Record<Justification, ClassSet> = {
  start: ['justify-start', 'sm:justify-start', 'md:justify-start', 'lg:justify-start'],
  center: ['justify-center', 'sm:justify-center', 'md:justify-center', 'lg:justify-center'],
  end: ['justify-end', 'sm:justify-end', 'md:justify-end', 'lg:justify-end'],
  between: ['justify-between', 'sm:justify-between', 'md:justify-between', 'lg:justify-between'],
};

function responsiveClasses<T extends string | number>(
  value: Responsive<T>,
  classes: Record<T, ClassSet>,
): string {
  if (typeof value !== 'object') return classes[value][0];
  return [
    classes[value.base][0],
    value.sm === undefined ? '' : classes[value.sm][1],
    value.md === undefined ? '' : classes[value.md][2],
    value.lg === undefined ? '' : classes[value.lg][3],
  ].join(' ');
}

export function Wrapper({
  children, as = 'div', display = 'flex', dir = 'column', columns: columnCount = 1,
  gap = 'none', padding = 'none', margin = 'none', align = 'stretch', justify = 'start',
  width = 'auto', maxWidth = 'none', id, ariaLabel,
}: WrapperProps): HTMLElement {
  const element = document.createElement(as);
  const widths = { auto: 'w-auto', full: 'w-full' };
  const maximums = { none: 'max-w-none', reading: 'max-w-prose', content: 'max-w-6xl' };
  element.className = [
    'min-w-0', display === 'grid' ? 'grid' : 'flex', widths[width], maximums[maxWidth],
    display === 'grid'
      ? responsiveClasses(columnCount, columns)
      : responsiveClasses(dir, directions),
    responsiveClasses(gap, gaps), responsiveClasses(padding, paddings),
    responsiveClasses(margin, margins), responsiveClasses(align, alignments),
    responsiveClasses(justify, justifications),
  ].join(' ');
  if (id) element.id = id;
  if (ariaLabel) element.setAttribute('aria-label', ariaLabel);
  element.append(...children);
  return element;
}
