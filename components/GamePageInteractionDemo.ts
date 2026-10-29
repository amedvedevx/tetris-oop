import { GamePage, type GamePageElement } from './GamePage';
import type { GameAction } from './GameScreenData';
import { readyScreen, runningScreen } from './gameShell.fixtures';

/** Storybook-only snapshot switching. It deliberately does not implement a playable game. */
export function GamePageInteractionDemo(): GamePageElement {
  let snapshot = readyScreen();
  const page = GamePage({ data: snapshot, onAction(action: GameAction) {
    switch (action) {
      case 'start': case 'restart': snapshot = runningScreen(); break;
      case 'pause': snapshot = { ...snapshot, phase: 'paused' }; break;
      case 'resume': snapshot = { ...snapshot, phase: 'running' }; break;
    }
    page.update(snapshot);
  } });
  return page;
}
