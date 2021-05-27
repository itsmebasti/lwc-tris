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
    rendered = false;
    engine;
    room = URL_PARAMS.get('room');
    player = randomName();
    session = database.ref('room/' + this.room);
    
    @track competitors = [];
    
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
    
    renderedCallback() {
        if(!this.rendered) {
            this.rendered = true;
            // Note: in combination with tabindex=1 this works inside iframes
            this.template.querySelector('.main').focus();
        }
    }
    
    connectedCallback() {
        document.addEventListener('keydown', this.execute);
        this.session.child('competitors').on('value', this.updateCompetitors);
        this.reset();
    }
    
    disconnectedCallback() {
        document.removeEventListener('keydown', this.execute);
        this.session.child('competitors').off('value', this.updateCompetitors);
    }
    
    execute = (evt) => {
        evt.preventDefault();
        this.actions[evt.key] && this.actions[evt.key]();
    }
    
    reset() {
        this.engine && this.engine.stop();
        this.state = {score: 0, level: 0, current: 'new', lines: 0};
        
        this.canvas = new Canvas({width: 10, height: 20});
        this.nextView = new Canvas({width: 4, height: 4});
        this.engine = new Engine(this.canvas, this.nextView, this.state);
        this.engine.onchange(this.uploadState);
    }
    
    playPause() {
        if(this.engine.state.current === 'game over') {
            this.reset();
        }
        
        this.engine.playPause();
    }
    
    updateCompetitors = (data) => {
        this.competitors = Object.entries(data.val())
            .filter(([key, {time}]) => time > Date.now() - 3000 && key !== this.player)
            .map(([key, {state, canvas}]) => ({key, state, canvas: new Canvas({shape: canvas})}));
    }
    
    uploadState = (canvas) => {
        this.session.child('competitors/'+this.player).set({
            time: Date.now(),
            state: this.state,
            canvas: JSON.parse(JSON.stringify(canvas))
        });
    }
    
    get paused() {
        return this.engine.state.current !== "running";
    }
}