import { GameSession, type GameSnapshot } from '../domain/GameSession';

export type GameCommand = 'start' | 'restart';
export interface GameState extends GameSnapshot { readonly highScore: number }

export class GameController {
  constructor(private readonly session: GameSession, private readonly highScore = 0) {}

  snapshot(): GameState {
    return { ...this.session.snapshot(), highScore: this.highScore };
  }

  dispatch(command: GameCommand): GameState {
    if (command === 'start') this.session.start();
    else this.session.restart();
    return this.snapshot();
  }
}
