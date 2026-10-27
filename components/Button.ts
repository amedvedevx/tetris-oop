import { Typography } from './Typography';

export interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium';
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: (event: MouseEvent) => void;
  id?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const variants = {
  primary: 'border-accent bg-accent hover:bg-accent-hover',
  secondary: 'border-line bg-surface hover:bg-surface-muted',
  danger: 'border-danger bg-danger hover:bg-danger-hover',
};
const sizes = {
  small: 'min-h-9 px-3 py-2',
  medium: 'min-h-11 px-5 py-3',
};

export function Button({
  label, variant = 'primary', size = 'medium', disabled = false,
  fullWidth = false, onClick, id, ariaLabel, ariaDescribedBy,
}: ButtonProps): HTMLButtonElement {
  const element = document.createElement('button');
  element.type = 'button';
  element.disabled = disabled;
  element.className = [
    'inline-flex min-w-0 max-w-full cursor-pointer items-center justify-center rounded-xl border',
    'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    'disabled:cursor-not-allowed disabled:opacity-55',
    variants[variant], sizes[size], fullWidth ? 'w-full' : 'w-fit',
  ].join(' ');
  element.append(Typography({
    as: 'span', variant: 'label', text: label,
    tone: variant === 'secondary' ? 'default' : 'inverse',
  }));
  if (id) element.id = id;
  if (ariaLabel) element.setAttribute('aria-label', ariaLabel);
  if (ariaDescribedBy) element.setAttribute('aria-describedby', ariaDescribedBy);
  if (onClick) element.addEventListener('click', onClick);
  return element;
}
