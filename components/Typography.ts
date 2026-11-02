export const typographyOptions = {
  tags: ['h1', 'h2', 'h3', 'p', 'span'],
  variants: ['title', 'heading', 'body', 'caption', 'label', 'metric', 'readoutLabel', 'readoutValue'],
  tones: ['default', 'muted', 'inverse', 'inverseMuted', 'accent', 'danger'],
  live: ['off', 'polite', 'assertive'],
} as const;
export type TypographyTag = typeof typographyOptions.tags[number];
export type TypographyVariant = typeof typographyOptions.variants[number];
export type TypographyTone = typeof typographyOptions.tones[number];

export interface TypographyProps {
  text: string | number;
  as?: TypographyTag;
  variant?: TypographyVariant;
  tone?: TypographyTone;
  id?: string;
  ariaLabel?: string;
  live?: typeof typographyOptions.live[number];
}

const variants: Record<TypographyVariant, string> = {
  title: 'font-sans text-title font-bold tracking-tight',
  heading: 'font-sans text-heading font-semibold',
  body: 'font-sans text-body font-normal',
  caption: 'font-sans text-caption font-normal',
  label: 'font-sans text-label font-semibold',
  metric: 'font-sans text-metric font-bold tabular-nums tracking-tight',
  readoutLabel: 'font-mono text-xs leading-5 font-medium sm:text-sm',
  readoutValue: 'font-mono text-sm leading-5 font-semibold tabular-nums sm:text-base',
};

const tones: Record<TypographyTone, string> = {
  default: 'text-ink',
  muted: 'text-muted',
  inverse: 'text-inverse',
  inverseMuted: 'text-inverse-muted',
  accent: 'text-accent',
  danger: 'text-danger',
};

export function Typography({
  text,
  as = 'p',
  variant = 'body',
  tone = 'default',
  id,
  ariaLabel,
  live,
}: TypographyProps): HTMLElement {
  const element = document.createElement(as);
  element.className = `m-0 min-w-0 max-w-full [overflow-wrap:anywhere] ${variants[variant]} ${tones[tone]}`;
  element.textContent = String(text);
  if (id) element.id = id;
  if (ariaLabel) element.setAttribute('aria-label', ariaLabel);
  if (live) element.setAttribute('aria-live', live);
  return element;
}
