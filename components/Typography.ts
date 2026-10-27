export const typographyOptions = {
  tags: ['h1', 'h2', 'h3', 'p', 'span'],
  variants: ['title', 'heading', 'body', 'caption', 'label', 'metric'],
  tones: ['default', 'muted', 'inverse', 'accent', 'danger'],
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
  title: 'text-title font-bold tracking-tight',
  heading: 'text-heading font-semibold',
  body: 'text-body font-normal',
  caption: 'text-caption font-normal',
  label: 'text-label font-semibold',
  metric: 'text-metric font-bold tabular-nums tracking-tight',
};

const tones: Record<TypographyTone, string> = {
  default: 'text-ink',
  muted: 'text-muted',
  inverse: 'text-inverse',
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
  element.className = `m-0 min-w-0 max-w-full font-sans [overflow-wrap:anywhere] ${variants[variant]} ${tones[tone]}`;
  element.textContent = String(text);
  if (id) element.id = id;
  if (ariaLabel) element.setAttribute('aria-label', ariaLabel);
  if (live) element.setAttribute('aria-live', live);
  return element;
}
