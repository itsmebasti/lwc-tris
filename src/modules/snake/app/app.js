import { LightningElement, track } from 'lwc';
import Grid from '../../view/model/grid';
import KeyListener from '../../../classes/keyListener';
import { RIGHT, LEFT, UP, DOWN } from '../../../classes/directions';
import Engine from './engine/engine';
import cookies from '../../../classes/cookie';

const COOKIE = cookies('snake');

export default class App extends LightningElement {
    @track grid = new Grid(20);
    engine = new Engine(this.grid);
    keyListener = new KeyListener(15, 250);
    speed = COOKIE.speed ?? 75;
    view = COOKIE.view ?? 'canvas';
    
    running = false;
    score = 0;
    length = 4;
    viewOptions = [];
    
    renderedCallback() {
        this.template.querySelector('.main').focus();
        
        if(!this.viewOptions.length) {
            this.viewOptions = this.template.querySelector('arcade-view').types()
                             .map((name) => ({name, selected: name === this.view}));
        }
    }
    
    connectedCallback() {
        this.keyListener.listen({
            'ArrowRight': () => this.engine.next(RIGHT),
            'ArrowLeft': () => this.engine.next(LEFT),
            'ArrowUp': () => this.engine.next(UP),
            'ArrowDown': () => this.engine.next(DOWN),
            'd': () => this.engine.next(RIGHT),
            'a': () => this.engine.next(LEFT),
            'w': () => this.engine.next(UP),
            's': () => this.engine.next(DOWN),
            'D': () => this.engine.next(RIGHT),
            'A': () => this.engine.next(LEFT),
            'W': () => this.engine.next(UP),
            'S': () => this.engine.next(DOWN),
            'Enter': () => this.engine.start(this.speed),
        });
        
        this.engine.on('gameOver', () => (this.running = false, this.toast('GAME OVER')));
        this.engine.on('snack', ({ length }) => {this.score = (length-4) * (300 - this.speed); this.length = length});
        this.engine.on('start', () => (this.running = true, this.score = 0, this.length = 4));
    }
    
    disconnectedCallback() {
        this.keyListener.stopListening();
        this.engine.reset();
    }
    
    updateSpeed({target: {value}}) {
        this.engine.reset();
        this.speed = Number(value);
        COOKIE.speed = this.speed;
    }
    
    updateView({target: {value}}) {
        this.engine.reset();
        this.view = value;
        COOKIE.view = this.view;
    }
    
    get modesOptions() {
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