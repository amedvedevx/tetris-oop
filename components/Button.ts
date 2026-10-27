import { Typography, type TypographyTone } from './Typography';

export const buttonOptions = {
  variants: ['primary', 'secondary', 'danger'],
  sizes: ['small', 'medium'],
} as const;

export interface ButtonProps {
  label: string;
  variant?: typeof buttonOptions.variants[number];
  size?: typeof buttonOptions.sizes[number];
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: (event: MouseEvent) => void;
  id?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

interface ButtonAppearance {
  classes: string;
  labelTone: TypographyTone;
}

const variants: Record<NonNullable<ButtonProps['variant']>, ButtonAppearance> = {
  primary: { classes: 'border-accent bg-accent hover:bg-accent-hover', labelTone: 'inverse' },
  secondary: { classes: 'border-line bg-surface hover:bg-surface-muted', labelTone: 'default' },
  danger: { classes: 'border-danger bg-danger hover:bg-danger-hover', labelTone: 'inverse' },
};
const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
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
    variants[variant].classes, sizes[size], fullWidth ? 'w-full' : 'w-fit',
  ].join(' ');
  element.append(Typography({
    as: 'span', variant: 'label', text: label,
    tone: variants[variant].labelTone,
  }));
  if (id) element.id = id;
  if (ariaLabel) element.setAttribute('aria-label', ariaLabel);
  if (ariaDescribedBy) element.setAttribute('aria-describedby', ariaDescribedBy);
  if (onClick) element.addEventListener('click', onClick);
  return element;
}
