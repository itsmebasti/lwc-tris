import { LightningElement, track } from 'lwc';
import Canvas from '../../arcade/view/model/canvas';
import KeyListener from '../../../classes/keyListener';
import { RIGHT, LEFT, UP, DOWN } from '../../../classes/directions';
import Engine from './engine/engine';

export default class App extends LightningElement {
    @track canvas = new Canvas({width: 20, height: 20});
    engine = new Engine(this.canvas);
    keyListener = new KeyListener(15, 250);
    
    connectedCallback() {
        this.keyListener.listen({
            'ArrowRight': () => this.engine.next(RIGHT),
            'ArrowLeft': () => this.engine.next(LEFT),
            'ArrowUp': () => this.engine.next(UP),
            'ArrowDown': () => this.engine.next(DOWN),
            'Enter': () => (this.engine.running) ? this.engine.reset() : this.engine.start()
        });
        
        this.engine.on('gameOver', () => this.toast('GAME OVER'));
    }
    
    disconnectedCallback() {
        this.keyListener.stopListening();
        this.engine.reset();
    }
    
    toast = (errorOrMessage) => {
        errorOrMessage && this.template.querySelector('arcade-toast')
                              .show(errorOrMessage.message ?? errorOrMessage);
    }
}