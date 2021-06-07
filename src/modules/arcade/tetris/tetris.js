import { LightningElement, track } from 'lwc';
import Engine from './engine/engine';
import Canvas from '../../view/model/canvas';
import Session from './database/session';
import AudioPlayer from '../../audioPlayer/audioPlayer';
import Shape from '../../view/model/shape';
import trackableState from './trackableState';

const audio = new AudioPlayer("tetris");
const URL_PARAMS = new URL(window.location.href).searchParams;

export default class Tetris extends LightningElement {
    // Note: the canvas (array) needs to be declared here, to fulfill all tracking requirements.
    @track canvas;
    @track state;
    engine;
    
    @track nextView;
    nextBlock;
    highScore;
    
    session;
    room = URL_PARAMS.get('room') || 'Default';
    player;
    @track competitors = [];
    
    actions = {
        'ArrowRight': () => this.engine.move(1),
        'ArrowLeft': () => this.engine.move(-1),
        'ArrowUp': () => this.engine.rotate(),
        'ArrowDown': () => this.engine.softDrop(),
        ' ': () => this.engine.hardDrop(),
        'Enter': () => this.playPause(),
        'm': () => audio.toggleAudio()
    };
    
    constructor() {
        super();
        this.state = trackableState();
        this.canvas = new Canvas({width: 10, height: 20});
        this.nextView = new Canvas({height: 4, width: 4});
        this.engine = new Engine(this.canvas, () => this.state.speed);
    }
    
    connectedCallback() {
        document.addEventListener('keydown', this.execute);
    }
    
    disconnectedCallback() {
        document.removeEventListener('keydown', this.execute);
        this.session.disconnect();
        this.engine.reset();
    }
    
    playPause() {
        switch(this.engine.state) {
            case 'stopped': return this.requestStart();
            case 'paused': return this.resume();
            case 'running': return this.pause();
        }
    }
    
    execute = (evt) => {
        this.actions[evt.key] && this.actions[evt.key]();
    }
    
    updateName(evt) {
        this.player = evt.target.value;
    }
    
    reset() {
        audio.speed(1);
        this.state.reset();
        this.engine.reset();
        this.canvas.reset();
        this.nextView.reset();
        this.nextBlock = undefined;
    }
    
    get paused() {
        return !this.state.playing;
    }
    
    requestStart() {
        this.requireSession()
            .then(() => this.session.requestStart())
            .then((errorOrString) => this.toast(errorOrString.message || errorOrString))
            .catch((errorOrString) => this.toast(errorOrString.message || errorOrString));
    }
    
    requireSession() {
        if(!this.player) {
            return Promise.reject('Please enter a name');
        }
        
        if(!this.session) {
            this.session = new Session(this.room, this.player);
            
            return this.session.connect(this.canvas, this.state)
                       .then(() => {
                           this.session.onStart(this.startRound);
                           this.session.onCompetitorUpdate(this.updateCompetitor);
                           this.session.onCompetitorQuit(this.removeCompetitor);
                
                           this.addEngineHandlers();
                       })
        }
        else {
            return Promise.resolve();
        }
    }
    
    pause() {
        this.toast('Pausing is not possible during multi player mode');
    }
    
    resume() {
        this.engine.resume();
        audio.play();
    }
    
    startRound = () => {
        this.reset();
        this.state.start();
        this.engine.start();
        audio.play();
        this.highScore = undefined;
    }
    
    updateCompetitor = (name, {state, canvas}) => {
        const index = this.competitors.findIndex((player) => player.name === name);
        const newValue = {name, state, canvas: new Canvas({rows: canvas})};
    
        if(index === -1) {
            this.competitors.push(newValue);
        }
        else {
            this.competitors[index] = newValue;
        }
    }
    
    removeCompetitor = (removed) => {
        this.competitors = this.competitors.filter(({name}) => name !== removed)
    }
    
    addEngineHandlers() {
        this.engine.handle('insertBlock', () => {
            this.engine.insertNext(this.nextBlock || new Shape(this.session.nextBlock()));
    
            this.nextBlock = new Shape(this.session.nextBlock());
            this.nextView.reset();
            this.nextView.draw(0, 0, this.nextBlock);
        });
    
        this.engine.handle('change', (canvas) => this.session.update({ state: this.state, canvas }));
        
        this.engine.handle('rotate', () => audio.play("rotate"));
        
        this.engine.handle('lock', () => {
            this.state.lockedBlock();
            audio.play("touchDown");
        });
        
        this.engine.handle('tetris', (tetris) => {
            this.state.apply(tetris);
            audio.speed(1 + 0.5 * this.state.levelFactor);
        });
        
        this.engine.handle('gameOver', () => {
            audio.stop();
            audio.play("gameOver");
    
            this.state.stop();
            this.session.addScore(this.state)
                .then((highScore) => this.highScore = highScore)
        });
    }
    
    rendered = false;
    renderedCallback() {
        if(!this.rendered) {
            this.rendered = true;
            this.template.querySelector('input').focus();
        }
    }
    
    toast(message) {
        this.template.querySelector('view-toast').show(message);
    }
}