export interface SurfaceProps {
  children: readonly HTMLElement[];
  as?: 'div' | 'section';
  variant?: 'plain' | 'muted' | 'inverted';
  size?: 'compact' | 'comfortable';
  fullWidth?: boolean;
  id?: string;
  ariaLabel?: string;
}

const variants = {
  plain: 'border-line bg-surface',
  muted: 'border-line bg-surface-muted',
  inverted: 'border-surface-dark bg-surface-dark',
};
const sizes = { compact: 'p-4', comfortable: 'p-6' };

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
