import { LightningElement, track } from 'lwc';
import Engine from './engine/engine';
import Grid from '../../view/model/grid';
import AudioPlayer from '../../../classes/audioPlayer';
import KeyListener from '../../../classes/keyListener';
import SinglePlayerSession from './sesssion/singlePlayerSession';
import MultiPlayerSession from './sesssion/multiPlayerSession';
import cookies from '../../../classes/cookie';
import url from '../../../classes/url';

const COOKIE = cookies('tetris');

export default class App extends LightningElement {
    @track grid = new Grid(10, 20);
    @track nextView = new Grid(4, 4);
    
    engine = new Engine(this.grid);
    state = this.engine.state;
    
    keyListener = new KeyListener(15, 250);
    audio = new AudioPlayer("tetris");
    
    player = COOKIE.player;
    session;
    
    highScore;
    
    constructor() {
        super();
        this.load(MultiPlayerSession);
        this.addEngineHandlers();
    }
    
    renderedCallback() {
        this.template.querySelector('.main').focus();
        if(!this.player) {
            this.template.querySelector('input').focus();
            this.keyListener.listen({'Enter': this.commitName});
        }
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
        const player = input.value.trim();
        
        if(player.length) {
            this.connect(player);
        }
        else {
            this.toast('please enter a name');
        }
    }
    
    connect(player) {
        player && this.tryToConnect(player)
            .catch(() => new Promise((resolve) => setTimeout(resolve, 2000))
                .then(() => this.tryToConnect(player)))
            .catch((error) => {
                this.player = undefined;
                return (error.code === 'PERMISSION_DENIED') ? player + ' is already playing' : error;
            })
            .then(this.toast);
    }
    
    tryToConnect(player) {
        return this.session.connect(player, this.grid, this.state)
            .then(() => {
                this.player = player;
                COOKIE.player = player;
        
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
    
    get running() {
        return this.state.playing && !this.state.paused;
    }
    
    toast = (errorOrMessage) => {
        errorOrMessage && this.template.querySelector('arcade-toast')
            .show(errorOrMessage.message ?? errorOrMessage);
    }
}