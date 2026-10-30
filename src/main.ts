import '../components/theme.css';
import { GameController } from './application/GameController';
import { GameSession } from './domain/GameSession';
import { MathRandomSource } from './infrastructure/MathRandomSource';
import { GameView } from './presentation/GameView';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('Application root #app is missing');

const session = new GameSession(new MathRandomSource());
const view = new GameView(new GameController(session));
root.replaceChildren(view.element);
