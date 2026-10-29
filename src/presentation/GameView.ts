import { GamePage, type GamePageElement } from '../../components/GamePage';
import type { GameController } from '../application/GameController';
import { gameScreen } from './gameScreen';

export class GameView {
  readonly element: GamePageElement;

  constructor(controller: GameController) {
    this.element = GamePage({
      data: gameScreen(controller.snapshot()),
      availability: { actions: ['start', 'restart'] },
      statusMessage: 'Пока доступны начало и перезапуск партии. Движение, падение и пауза появятся позже.',
      onAction: action => {
        if (action === 'start' || action === 'restart') {
          this.element.update(gameScreen(controller.dispatch(action)));
        }
      },
    });
  }
}
