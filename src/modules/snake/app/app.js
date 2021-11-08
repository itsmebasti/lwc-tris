import { LightningElement, track } from 'lwc';
import Canvas from '../../arcade/view/model/canvas';
import KeyListener from '../../../classes/keyListener';
import { RIGHT, LEFT, UP, DOWN } from '../../../classes/directions';
import Engine from './engine/engine';
import cookies from '../../../classes/cookie';

const COOKIE = cookies('snake');

export default class App extends LightningElement {
    @track canvas = new Canvas({width: 20, height: 20});
    engine = new Engine(this.canvas);
    keyListener = new KeyListener(15, 250);
    speed = COOKIE.speed ?? 75;
    score = 0;
    length = 4;
    
    connectedCallback() {
        this.keyListener.listen({
            'ArrowRight': () => this.engine.next(RIGHT),
            'ArrowLeft': () => this.engine.next(LEFT),
            'ArrowUp': () => this.engine.next(UP),
            'ArrowDown': () => this.engine.next(DOWN),
            'Enter': () => (this.engine.running) ? this.reset() : this.engine.start(this.speed)
        });
        
        this.engine.on('gameOver', () => this.toast('GAME OVER'));
        this.engine.on('snack', ({ value }) => {this.score += value - this.speed; this.length += 1});
    }
    
    disconnectedCallback() {
        this.keyListener.stopListening();
        this.engine.reset();
    }
    
    renderedCallback() {
        this.template.querySelector('.main').focus();
    }
    
    reset() {
        this.engine.reset();
        this.score = 0;
        this.length = 4;
    }
    
    updateSpeed({target: {value}}) {
        this.reset();
        this.speed = Number(value);
        COOKIE.speed = this.speed;
    }
    
    get modes() {
        const speed = this.speed;
        return [{ name: 'Beginner', value: 250},
                { name: 'Normal', value: 200},
                { name: 'Advanced', value: 150},
                { name: 'Professional', value: 100},
                { name: 'Godlike', value: 75},
                { name: 'Impossible', value: 50}]
            .map((mode) => ({...mode, get selected() {return (this.value === speed)}}));
    }
    
    toast = (errorOrMessage) => {
        errorOrMessage && this.template.querySelector('arcade-toast')
                              .show(errorOrMessage.message ?? errorOrMessage);
    }
}