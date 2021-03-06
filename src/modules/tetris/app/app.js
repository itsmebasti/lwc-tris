import { LightningElement, track } from 'lwc';
import './sesssion/database';
import Engine from './engine/engine';
import { AudioPlayer, KeyListener, Grid, Cookie } from 'lwc-arcade';
import SinglePlayerSession from './sesssion/singlePlayerSession';
import MultiPlayerSession from './sesssion/multiPlayerSession';
import Url from '../../../lib/url';

const COOKIE = Cookie('tetris');

export default class App extends LightningElement {
    @track grid = new Grid(10, 20);
    @track nextView = new Grid(4);
    
    engine = new Engine(this.grid);
    state = this.engine.state;
    
    keyListener = new KeyListener(15, 250);
    audio = new AudioPlayer("./assets/audio/tetris/");
    
    player = COOKIE.player;
    session;
    
    highScore;
    
    connectedCallback() {
        this.load(MultiPlayerSession);
        this.addEngineHandlers();
    }
    
    disconnectedCallback() {
        this.engine.reset();
        this.session.disconnect?.();
        this.keyListener.stopListening();
    }
    
    renderedCallback() {
        this.template.querySelector('.main').focus();
        if(!this.player) {
            this.template.querySelector('input').focus();
            this.keyListener.listen({'Enter': this.commitName});
        }
    }
    
    load(sessionConstructor) {
        this.engine.reset();
        this.nextView.clear();
    
        this.session?.disconnect?.();
        this.session = new sessionConstructor(Url.room);
        this.session.on('connect', this.nameApproved);
        this.session.on('connect', this.addKeyListeners);
        this.session.on('start', this.startRound);
        
        this.connect(this.player);
    }
    
    commitName = () => {
        const input = this.template.querySelector('input');
        input.focus();
        const player = input.value.trim();
        
        if(player.length) {
            this.connect(player);
        }
        else {
            this.toast('please enter a name');
        }
    }
    
    nameApproved = (player) => {
        this.player = player;
        COOKIE.player = player;
    
        this.toast('Welcome ' + player);
    }
    
    connect(player) {
        player && this.tryToConnect(player)
            .catch(() => new Promise((resolve) => setTimeout(resolve, MultiPlayerSession.TIMEOUT))
                                .then(() => this.tryToConnect(player))
                                .catch((error) => {
                                    this.player = undefined;
                                    this.toast(error);
                                }));
    }
    
    tryToConnect(player) {
        return this.session.connect(player, this.grid, this.state)
    }
    
    addKeyListeners = () => {
        this.keyListener.listen({
            'd': () => this.engine.moveX(1),
            'a': () => this.engine.moveX(-1),
            'w': () => this.engine.rotate(),
            's': () => this.engine.softDrop(),
            'ArrowRight': () => this.engine.moveX(1),
            'ArrowLeft': () => this.engine.moveX(-1),
            'ArrowUp': () => this.engine.rotate(),
            'ArrowDown': () => this.engine.softDrop(),
            ' ': () => this.engine.hardDrop(),
            'Enter': () => (this.state.playing) ? this.engine.pauseResume() : this.requestStart(),
            'm': () => this.audio.toggleAudio()
        });
    }
    
    requestStart() {
        this.session.startBlockStream()
               .catch(this.toast)
               .then(this.toast);
    }
    
    startRound = (blockStream) => {
        this.grid.clear();
        this.nextView.clear();
        
        this.engine.start(blockStream);
    }
    
    addEngineHandlers = () => {
        this.engine.on('next', () => this.nextView.set(0, 0, this.engine.nextBlock()));
        this.engine.on('change', (changed) => {
            this.state = changed.state ?? this.state;
            this.session.update(changed);
        });
        this.engine.on('gameOver', () => this.session.update({state: this.state})
                                         .then(() => this.session.uploadScore(this.state.score))
                                         .then(this.queryHighScore));
    
        this.engine.on('start', () => this.audio.speed(1) && this.audio.play());
        this.engine.on('rotate', () => this.audio.play("rotate"));
        this.engine.on('lock', () => this.audio.play("lock"));
        this.engine.on('tetris', () => this.audio.play("clear") && this.audio.speed(1 + 0.5 * this.engine.levelFactor));
        this.engine.on('gameOver', () => this.audio.stop() && this.audio.play("gameOver"));
    }
    
    queryHighScore = () => {
        this.session.queryHighScore()
            .then((highScore) => this.highScore = highScore);
    }
    
    toggleMode({target}) {
        target.blur();
        this.load( (target.value === 's') ? SinglePlayerSession : MultiPlayerSession);
    }
    
    get running() {
        return this.state.playing && !this.state.paused;
    }
    
    toast = (errorOrMessage) => {
        errorOrMessage && this.template.querySelector('main-toast')
            .show(errorOrMessage.message ?? errorOrMessage);
    }
}