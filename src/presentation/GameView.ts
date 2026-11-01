import { GamePage, type GamePageElement } from '../../components/GamePage';
import type { GameCommand, GameController } from '../application/GameController';
import { KeyboardController } from './KeyboardController';
import { gameScreen } from './gameScreen';

export class GameView {
  readonly element: GamePageElement;
  readonly #keyboard: KeyboardController;
  #disposed = false;

  constructor(private readonly controller: GameController) {
    this.element = GamePage({
      data: gameScreen(controller.snapshot()),
      availability: { actions: ['start', 'restart', 'moveLeft', 'moveRight'] },
      statusMessage: 'Доступны начало, перезапуск и движение влево/вправо. Повороты, падение и пауза появятся позже.',
      onAction: action => {
        if (action === 'start' || action === 'restart' || action === 'moveLeft' || action === 'moveRight') {
          this.perform(action);
        }
      },
    });
    this.#keyboard = new KeyboardController(this.element, command => {
      if (controller.snapshot().phase !== 'running') return false;
      this.perform(command);
      return true;
    });
  }

  dispose(): void {
    this.#disposed = true;
    this.#keyboard.dispose();
  }

  private perform(command: GameCommand): void {
    if (this.#disposed) return;
    this.element.update(gameScreen(this.controller.dispatch(command)));
  }
}
