import { createElement } from 'lwc';
import Lobby from 'arcade/lobby';

document.querySelector('main')
        .appendChild(createElement('arcade-lobby', { is: Lobby }));
