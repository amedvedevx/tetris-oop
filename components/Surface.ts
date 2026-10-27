export const surfaceOptions = {
  tags: ['div', 'section'],
  variants: ['plain', 'muted', 'inverted'],
  sizes: ['compact', 'comfortable'],
} as const;

export interface SurfaceProps {
  children: readonly HTMLElement[];
  as?: typeof surfaceOptions.tags[number];
  variant?: typeof surfaceOptions.variants[number];
  size?: typeof surfaceOptions.sizes[number];
  fullWidth?: boolean;
  id?: string;
  ariaLabel?: string;
}

const variants: Record<NonNullable<SurfaceProps['variant']>, string> = {
  plain: 'border-line bg-surface',
  muted: 'border-line bg-surface-muted',
  inverted: 'border-surface-dark bg-surface-dark',
};
const sizes: Record<NonNullable<SurfaceProps['size']>, string> = { compact: 'p-4', comfortable: 'p-6' };

export function Surface({
  children, as = 'div', variant = 'plain', size = 'comfortable',
  fullWidth = true, id, ariaLabel,
}: SurfaceProps): HTMLElement {
  const element = document.createElement(as);
  element.className = [
    'min-w-0 max-w-full rounded-2xl border shadow-sm',
    variants[variant], sizes[size], fullWidth ? 'w-full' : 'w-fit',
  ].join(' ');
  if (id) element.id = id;
  if (ariaLabel) element.setAttribute('aria-label', ariaLabel);
  element.append(...children);
  return element;
}
