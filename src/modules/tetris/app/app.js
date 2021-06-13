import { LightningElement, track } from 'lwc';
import Engine from './engine/engine';
import Canvas from '../../arcade/view/model/canvas';
import AudioPlayer from '../../../classes/audioPlayer';
import KeyListener from '../../../classes/keyListener';
import SinglePlayerSession from './sesssion/singlePlayerSession';
import MultiPlayerSession from './sesssion/multiPlayerSession';
import cookie from '../../../classes/cookie';
import url from '../../../classes/url';

export default class App extends LightningElement {
    @track canvas = new Canvas({width: 10, height: 20});
    @track nextView = new Canvas({height: 4, width: 4});
    
    engine = new Engine(this.canvas);
    state = this.engine.state;
    
    keyListener = new KeyListener(15, 250);
    audio = new AudioPlayer("tetris");
    
    player = cookie.player;
    session;
    
    highScore;
    
    constructor() {
        super();
        this.keyListener.listen({'Enter': this.commitName});
        this.load(MultiPlayerSession);
        this.addEngineHandlers();
    }
    
    load(Session) {
        this.engine.reset();
        this.nextView.clear();
    
        this.session && this.session.disconnect();
        this.session = new Session(url.room);
        this.session.on('start', this.startRound);
    
        this.connect(this.player);
    }
    
    commitName = () => {
        const input = this.template.querySelector('input');
        input.focus();
        this.connect(input.value.trim());
    }
    
    connect(player) {
        if(player) {
            this.tryToConnect(player)
                .catch(() => new Promise((resolve) => setTimeout(resolve, 2000))
                    .then(() => this.tryToConnect(player)))
                .catch((error) => {
                    this.player = undefined;
                    return (error.code === 'PERMISSION_DENIED') ? player + ' is already playing' : error;
                })
                .then(this.toast);
        }
        else {
            this.toast('please enter a name');
        }
    }
    
    tryToConnect(player) {
        return this.session.connect(player, this.canvas, this.state)
            .then(() => {
                this.player = player;
                cookie.player = player;
        
                this.keyListener.stopListening();
                this.keyListener.listen({
                    'ArrowRight': () => this.engine.move(1),
                    'ArrowLeft': () => this.engine.move(-1),
                    'ArrowUp': () => this.engine.rotate(),
                    'ArrowDown': () => this.engine.softDrop(),
                    ' ': () => this.engine.hardDrop(),
                    'Enter': () => (this.state.playing) ? this.engine.pauseResume() : this.requestStart(),
                    'm': () => this.audio.toggleAudio()
                });
            })
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
    
        this.engine.on('start', () => this.audio.speed(1) && this.audio.play());
        this.engine.on('rotate', () => this.audio.play("rotate"));
        this.engine.on('lock', () => this.audio.play("lock"));
        this.engine.on('tetris', () => this.audio.play("clear") && this.audio.speed(1 + 0.5 * this.engine.levelFactor));
        this.engine.on('gameOver', () => this.audio.stop() && this.audio.play("gameOver"));
    }
    
    queryHighScore = () => {
        this.session.queryHighScore()
            .then((highScore) => this.highScore = highScore)
    }
    
    toggleMode({target}) {
        target.blur();
        this.load( (target.value === 's') ? SinglePlayerSession : MultiPlayerSession);
    }
    
    renderedCallback() {
        !this.player && this.template.querySelector('input').focus();
    }
    
    get running() {
        return this.state.playing && !this.state.paused;
    }
    
    toast = (errorOrMessage) => {
        errorOrMessage && this.template.querySelector('arcade-toast')
            .show(errorOrMessage.message ? errorOrMessage.message : errorOrMessage);
    }
}