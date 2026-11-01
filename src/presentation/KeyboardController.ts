import type { MovementCommand } from '../application/GameController';

/** Own only listeners on this game area; multiple views never share keyboard input. */
export class KeyboardController {
  constructor(private readonly root: HTMLElement, private readonly onMove: (command: MovementCommand) => boolean) {
    root.addEventListener('keydown', this.onKeyDown);
    root.addEventListener('click', this.onClick);
  }

  dispose(): void {
    this.root.removeEventListener('keydown', this.onKeyDown);
    this.root.removeEventListener('click', this.onClick);
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
      || !this.root.contains(this.root.ownerDocument.activeElement) || this.isEditable(event.target)) return;
    const command = event.key === 'ArrowLeft' ? 'moveLeft' : event.key === 'ArrowRight' ? 'moveRight' : null;
    if (command && this.onMove(command)) event.preventDefault();
  };

  private readonly onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (target instanceof Element && !target.closest('button,a,input,textarea,select,summary,[contenteditable]')) {
      this.root.focus({ preventScroll: true });
    }
  };

  private isEditable(target: EventTarget | null): boolean {
    return target instanceof Element && Boolean(target.closest('input,textarea,select,[contenteditable]'));
  }
}
