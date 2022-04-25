import '@lwc/synthetic-shadow';
import { createElement } from 'lwc';
import Lobby from 'arcade/lobby';

document.querySelector('body')
        .appendChild(createElement('arcade-lobby', { is: Lobby }));
