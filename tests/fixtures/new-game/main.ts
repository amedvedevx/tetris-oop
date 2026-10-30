import '../../../components/theme.css';
import { GameController } from '../../../src/application/GameController';
import { GameSession } from '../../../src/domain/GameSession';
import { GameView } from '../../../src/presentation/GameView';
import { ScriptedRandom } from '../ScriptedRandom';
import { browserSequence } from '../new-game-data';

// Only the external randomness differs from production; no game-state hooks or UI replacement.
const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('Controlled test entry root is missing');
const session = new GameSession(new ScriptedRandom(browserSequence));
root.replaceChildren(new GameView(new GameController(session)).element);
