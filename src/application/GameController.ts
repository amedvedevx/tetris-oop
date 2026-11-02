import { GameSession, type GameSnapshot } from '../domain/GameSession';

const movementCommands = ['moveLeft', 'moveRight'] as const;
export const gameCommands = Object.freeze(['start', 'restart', ...movementCommands] as const);
export type MovementCommand = (typeof movementCommands)[number];
export type GameCommand = (typeof gameCommands)[number];
export interface GameState extends GameSnapshot { readonly highScore: number }

export function isGameCommand(command: string): command is GameCommand {
  return gameCommands.some(supported => supported === command);
}

export class GameController {
  constructor(private readonly session: GameSession, private readonly highScore = 0) {}

  snapshot(): GameState {
    return { ...this.session.snapshot(), highScore: this.highScore };
  }

  elapsedMs(): number {
    return this.session.elapsedMs();
  }

  dispatch(command: GameCommand): GameState {
    switch (command) {
      case 'start': this.session.start(); break;
      case 'restart': this.session.restart(); break;
      case 'moveLeft': this.session.move('left'); break;
      case 'moveRight': this.session.move('right'); break;
    }
    return this.snapshot();
  }
}
