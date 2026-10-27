export type TypographyTag = 'h1' | 'h2' | 'h3' | 'p' | 'span';
export type TypographyVariant = 'title' | 'heading' | 'body' | 'caption' | 'label' | 'metric';
export type TypographyTone = 'default' | 'muted' | 'inverse' | 'accent' | 'danger';

export interface TypographyProps {
  text: string | number;
  as?: TypographyTag;
  variant?: TypographyVariant;
  tone?: TypographyTone;
  id?: string;
  ariaLabel?: string;
  live?: 'off' | 'polite' | 'assertive';
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
