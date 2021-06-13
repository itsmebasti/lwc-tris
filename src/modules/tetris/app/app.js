import { LightningElement, track } from 'lwc';
import Engine from './engine/engine';
import Canvas from '../../arcade/view/model/canvas';
import AudioPlayer from '../../../classes/audioPlayer';
import KeyListener from '../../../classes/keyListener';
import SinglePlayerSession from './sesssion/singlePlayerSession';
import MultiPlayerSession from './sesssion/multiPlayerSession';

const audio = new AudioPlayer("tetris");
const URL_PARAMS = new URL(window.location.href).searchParams;

export default class App extends LightningElement {
    @track canvas;
    @track nextView
    
    session;
    engine;
    state;
    keyListener;
    highScore;
    
    room = URL_PARAMS.get('room') || 'Default';
    player;
    
    constructor() {
        super();
        this.canvas = new Canvas({width: 10, height: 20});
        this.nextView = new Canvas({height: 4, width: 4});
        this.engine = new Engine(this.canvas);
        this.state = this.engine.state;
        this.keyListener = new KeyListener(15, 250);
        this.load(MultiPlayerSession);
        
        this.addEngineHandlers();
    }
    
    load(Session) {
        this.session && this.session.disconnect();
    
        this.engine.reset();
        this.nextView.clear();
        
        this.session = new Session(this.room);
        this.session.on('start', this.startRound);
        
        if(this.player) {
            this.connect(this.player);
        }
        else {
            this.keyListener.stopListening();
        }
    }
    
    commitName(evt) {
        if(evt.key === 'Enter') {
            const player = evt.target.value.trim();
            (player.length) ? this.connect(player) : this.toast('Please enter a name');
        }
    }
    
    connect(player) {
        this.session.connect(player, this.canvas, this.state)
            .then(() => {
                this.player = player;
                
                this.keyListener.listen({
                    'ArrowRight': () => this.engine.move(1),
                    'ArrowLeft': () => this.engine.move(-1),
                    'ArrowUp': () => this.engine.rotate(),
                    'ArrowDown': () => this.engine.softDrop(),
                    ' ': () => this.engine.hardDrop(),
                    'Enter': () => (this.state.playing) ? this.engine.pauseResume() : this.requestStart(),
                    'm': () => audio.toggleAudio()
                });
            })
            .catch((error) => (error.code === 'PERMISSION_DENIED') ? player + ' is already playing' : error)
            .then(this.toast);
    }
    
    disconnectedCallback() {
        this.engine.reset();
        this.session.disconnect();
        this.keyListener.stopListening();
    }
    
    requestStart() {
        this.session.startBlockStream()
            .catch(this.toast)
            .then(this.toast);
    }
    
    startRound = (blockStream) => {
        this.canvas.clear();
        this.nextView.clear();
        
        this.engine.start(blockStream);
    }
    
    addEngineHandlers = () => {
        this.engine.on('next', () => this.nextView.set(0, 0, this.engine.nextBlock()));
        this.engine.on('change', (changed) => {
            if(changed.state) this.state = changed.state;
    
            this.session.update(changed);
        });
        this.engine.on('gameOver', () => this.session.update({state: this.state}).then(this.queryHighScore));
    
        this.engine.on('start', () => audio.speed(1) && audio.play());
        this.engine.on('rotate', () => audio.play("rotate"));
        this.engine.on('lock', () => audio.play("lock"));
        this.engine.on('tetris', () => audio.play("clear") && audio.speed(1 + 0.5 * this.engine.levelFactor));
        this.engine.on('gameOver', () => audio.stop() && audio.play("gameOver"));
    }
    
    queryHighScore = () => {
        this.session.queryHighScore()
            .then((highScore) => this.highScore = highScore)
    }
    
    get running() {
        return this.state.playing && !this.state.paused;
    }
    
    toggleMode({target}) {
        target.blur();
        this.load( (target.value === 's') ? SinglePlayerSession : MultiPlayerSession);
    }
    
    get multiPlayer() {
        return (this.session instanceof MultiPlayerSession);
    }
    
    rendered = false;
    renderedCallback() {
        if(!this.rendered) {
            this.rendered = true;
            this.template.querySelector('input').focus();
        }
    }
    
    toast = (errorOrMessage) => {
        errorOrMessage && this.template.querySelector('arcade-toast')
            .show(errorOrMessage.message ? errorOrMessage.message : errorOrMessage);
    }
    
    json(value) {
        return JSON.parse(JSON.stringify(value));
    }
}