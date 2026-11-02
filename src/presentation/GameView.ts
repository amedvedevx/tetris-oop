import { GamePage, type GamePageElement } from '../../components/GamePage';
import { gameCommands, isGameCommand, type GameCommand, type GameController } from '../application/GameController';
import { KeyboardController } from './KeyboardController';
import { gameScreen } from './gameScreen';
import type { Ticker } from './Ticker';

export class GameView {
  readonly element: GamePageElement;
  readonly #keyboard: KeyboardController;
  #disposed = false;
  #stopTicker: (() => void) | null = null;

  constructor(private readonly controller: GameController, private readonly ticker: Ticker) {
    const snapshot = controller.snapshot();
    this.element = GamePage({
      data: gameScreen(snapshot),
      availability: { actions: gameCommands },
      statusMessage: 'Доступны начало, перезапуск и движение влево/вправо. Повороты, падение и пауза появятся позже.',
      onAction: action => {
        if (isGameCommand(action)) this.perform(action);
      },
    });
    this.#keyboard = new KeyboardController(this.element, command => {
      if (controller.snapshot().phase !== 'running') return false;
      this.perform(command);
      return true;
    });
    if (snapshot.phase === 'running') this.startTicker();
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#keyboard.dispose();
    this.#stopTicker?.();
    this.#stopTicker = null;
  }

  private perform(command: GameCommand): void {
    if (this.#disposed) return;
    const snapshot = this.controller.dispatch(command);
    this.element.update(gameScreen(snapshot));
    if (snapshot.phase === 'running' && (command === 'start' || command === 'restart')) this.startTicker();
  }

  private startTicker(): void {
    this.#stopTicker?.();
    this.#stopTicker = this.ticker.subscribe(() => {
      if (!this.#disposed) this.element.updateElapsedTime(this.controller.elapsedMs());
    });
  }
}
