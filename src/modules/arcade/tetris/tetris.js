import { LightningElement, track } from 'lwc';
import Engine from './engine/engine';
import Canvas from '../../view/divCanvas/model/canvas';

export default class Tetris extends LightningElement {
    // Note: the canvas (array) needs to be declared here, to fulfill all tracking requirements.
    @track canvas;
    @track nextView;
    @track state;
    engine;
    
    actions = {
        'ArrowRight': () => this.engine.move(1),
        'ArrowLeft': () => this.engine.move(-1),
        'ArrowUp': () => this.engine.rotate(),
        'ArrowDown': () => this.engine.softDrop(),
        ' ': () => this.engine.hardDrop(),
        'r': () => this.reset(),
        'Escape': () => this.playPause(),
        'Enter': () => this.playPause(),
        'm': () => this.engine.toggleAudio()
    };
    
    playPause() {
        if(this.engine.state.current === "game over") {
            this.reset();
        }
        
        this.engine.playPause();
    }
    
    get paused() {
        return this.engine.state.current !== "running";
    }
    
    reset() {
        this.engine && this.engine.stop();
        this.state = {score: 0, level: 0, current: 'new', lines: 0};
        
        this.canvas = new Canvas(10, 20);
        this.nextView = new Canvas(4, 4);
        this.engine = new Engine(this.canvas, this.nextView, this.state);
    }
    
    execute = (evt) => {
        evt.preventDefault();
        this.actions[evt.key] && this.actions[evt.key]();
    }
    
    connectedCallback() {
        document.addEventListener('keydown', this.execute);
        
        this.reset();
    }
    
    disconnectedCallback() {
        document.removeEventListener('keydown', this.execute);
    }
}