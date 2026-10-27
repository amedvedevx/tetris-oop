import { Button, type ButtonProps } from './Button';
import { Typography } from './Typography';
import { Wrapper } from './Wrapper';

export type ButtonInteractionDemoProps = Omit<ButtonProps, 'onClick'>;

/** A local interaction example for the component library; each instance owns its counter. */
export function ButtonInteractionDemo(props: ButtonInteractionDemoProps): HTMLElement {
  let count = 0;
  const feedback = Typography({ text: 'Нажатий: 0', live: 'polite' });
  return Wrapper({
    gap: 'md',
    children: [
      Button({ ...props, onClick: () => { feedback.textContent = `Нажатий: ${++count}`; } }),
      feedback,
    ],
  });
}
