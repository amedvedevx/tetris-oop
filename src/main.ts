import { Typography } from '../components/Typography';
import '../components/theme.css';

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) throw new Error('Application root #app is missing');

// The game page is a separate task; this heading verifies the local entry point.
root.replaceChildren(Typography({ as: 'h1', variant: 'title', text: 'Tetris OOP' }));
