import '@lwc/synthetic-shadow';
import { createElement } from 'lwc';
import Lobby from 'main/lobby';

document.querySelector('body')
        .appendChild(createElement('main-lobby', { is: Lobby }));
