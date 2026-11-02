import '../components/theme.css';
import { GameController } from './application/GameController';
import { GameSession } from './domain/GameSession';
import { MathRandomSource } from './infrastructure/MathRandomSource';
import { PerformanceClock } from './infrastructure/PerformanceClock';
import { BrowserTicker } from './infrastructure/BrowserTicker';
import { GameView } from './presentation/GameView';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('Application root #app is missing');

const session = new GameSession(new MathRandomSource(), new PerformanceClock());
const view = new GameView(new GameController(session), new BrowserTicker());
root.replaceChildren(view.element);
if (import.meta.hot) import.meta.hot.dispose(() => view.dispose());
