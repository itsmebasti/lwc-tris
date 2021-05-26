import { LightningElement, track } from 'lwc';
import Engine from './engine/engine';
import Canvas from '../../view/divCanvas/model/canvas';
import database from './database/database';
import randomName from './randomName';

const URL_PARAMS = new URL(window.location.href).searchParams;

export default class Tetris extends LightningElement {
    // Note: the canvas (array) needs to be declared here, to fulfill all tracking requirements.
    @track canvas;
    @track nextView;
    @track state;
    engine;
    room = URL_PARAMS.get('room');
    player = randomName();
    
    @track competitors = [];
    
    reference = database.ref(this.room + '/competitors');
    
    renderedCallback() {
        this.template.querySelector('.main').focus();
    }
    
    connectedCallback() {
        document.addEventListener('keydown', this.execute);
        this.reference.on('child_changed', this.updateCompetitors);
        this.reset();
    }
    
    disconnectedCallback() {
        document.removeEventListener('keydown', this.execute);
        this.reference.off('child_changed', this.updateCompetitors);
    }
    
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
        if(this.engine.state.current === 'game over') {
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
        this.engine.onchange(this.storeState);
    }
    
    execute = (evt) => {
        evt.preventDefault();
        this.actions[evt.key] && this.actions[evt.key]();
    }
    
    updateCompetitors = (data) => {
        const canvasArray = data.val();
        if(this.player === data.key) return;
        
        const index = this.competitors.findIndex((value) => value.key === data.key);
        const newValue = {key: data.key, canvas: Canvas.for(canvasArray)};
        
        if(index === -1) {
            this.competitors.push(newValue);
        }
        else {
            this.competitors[index] = newValue;
        }
    }
    
    storeState = (canvas) => {
        this.reference.child(this.player).set(JSON.parse(JSON.stringify(canvas)));
    }
}