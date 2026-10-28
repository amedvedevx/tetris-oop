import { GamePage } from '../components/GamePage';
import '../components/theme.css';
import { initialScreen } from './presentation/initialScreen';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('Application root #app is missing');

root.replaceChildren(GamePage({ data: initialScreen() }));
