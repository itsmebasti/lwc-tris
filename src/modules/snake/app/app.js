import { LightningElement, track } from 'lwc';
import Grid from '../../view/model/grid';
import KeyListener from '../../../classes/keyListener';
import { RIGHT, LEFT, UP, DOWN } from '../../../classes/directions';
import Engine from './engine/engine';
import cookies from '../../../classes/cookie';

const COOKIE = cookies('snake');

export default class App extends LightningElement {
    @track grid = new Grid({width: 20, height: 20});
    engine = new Engine(this.grid);
    keyListener = new KeyListener(15, 250);
    speed = COOKIE.speed ?? 75;
    running = false;
    score = 0;
    length = 4;
    view = 'canvas';
    
    renderedCallback() {
        this.template.querySelector('.main').focus();
    }
    
    connectedCallback() {
        this.keyListener.listen({
            'ArrowRight': () => this.engine.next(RIGHT),
            'ArrowLeft': () => this.engine.next(LEFT),
            'ArrowUp': () => this.engine.next(UP),
            'ArrowDown': () => this.engine.next(DOWN),
            'Enter': () => this.engine.start(this.speed),
        });
        
        this.engine.on('gameOver', () => (this.running = false, this.toast('GAME OVER')));
        this.engine.on('snack', ({ value }) => {this.score += value - this.speed; this.length += 1});
        this.engine.on('start', () => this.running = true);
    }
    
    disconnectedCallback() {
        this.keyListener.stopListening();
        this.engine.reset();
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
    
    updateView({target: {value}}) {
        this.engine.reset();
        this.view = value;
    }
    
    get views() {
        return ['div', 'canvas', 'checkbox']
            .map((view) => ({name: view, selected: view === this.view}))
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