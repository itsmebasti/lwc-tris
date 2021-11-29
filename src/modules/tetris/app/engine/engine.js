import Shape from '../../../view/model/shape';
import Publisher from '../../../../classes/publisher';
import GameClock from '../../../../classes/gameClock';

const maxLevel = 15;
const maxSpeed = 400;
const minSpeed = 100;

export default class Engine extends Publisher {
    canvas;
    blockStream;
    current;
    state;
    clock;
    
    constructor(canvas) {
        super('start', 'next', 'change', 'rotate', 'lock', 'tetris', 'gameOver');
        this.canvas = canvas;
        this.clock = new GameClock(() => this.move(0, 1));
        this.initState();
    }
    
    initState() {
        this.state = new Proxy({
            score: 0,
            level: 1,
            lines: 0,
            playing: false,
            paused: false,
        }, {
            set: (state, property, value) => {
                state[property] = value;
                this.publish('change', {state: {...state}});
                return true;
            }
        });
        
        this.publish('change', {state: {...this.state}});
    }
    
    reset() {
        this.clock.stop();
        delete this.current;
        this.canvas.reset();
        this.initState();
    }
    
    start(blockStream) {
        this.reset();
        
        this.blockStream = blockStream;
        this.insertBlock();
        this.state.playing = true
    }
    
    pauseResume() {
        if(this.state.paused) {
            this.clock.start(this.speed);
            this.state.paused = false;
        }
        else {
            this.clock.stop();
            this.state.paused = true;
        }
    }
    
    nextBlock() {
        return this.blockStream.view();
    }
    
    insertBlock() {
        const block = this.blockStream.read();
        const x = this.canvas.center-2;
        const y = -1;
        
        if(this.canvas.valid(x, y, block)) {
            this.current = {x, y, block};
            this.softDrop();
            this.publish('next');
        }
        else {
            this.canvas.draw(x, y, block, 'grey');
            this.gameOver();
        }
    }
    
    softDrop() {
        if(!this.current || this.state.paused) return;
        this.clock.stop();
        this.move(0, 1);
        this.clock.start(this.speed);
    }
    
    hardDrop() {
        if(!this.current || this.state.paused) return;
        this.clock.stop();
        this.move(0, this.canvas.height);
        this.clock.start(this.speed);
    }
    
    rotate() {
        if(!this.current || this.state.paused) return;
        const {x, y, block} = this.current;
        
        this.apply(() => {
            const rotated = block.rotated();
            if(this.canvas.valid(x, y, rotated)) {
                this.current.block = rotated;
                this.publish('rotate');
            }
        });
    }
    
    move(xOffset, yOffset = 0) {
        if(!this.current || this.state.paused) return;
        const {x, y, block} = this.current;
        
        const newX = x+xOffset;
        const newY = y+yOffset;
        
        this.apply(() => {
            this.current.x = this.lastPossible(x, newX, (x) => this.canvas.valid(x, y, block));
            this.current.y = this.lastPossible(y, newY, (y) => this.canvas.valid(x, y, block));
        });
        
        if(this.current.y !== newY) {
            this.lockCurrent();

            this.clearTetris()
                .then(() => this.insertBlock());
        }
    }
    
    apply(change) {
        this.hide();
        change();
        this.show();
        
        this.publish('change', {canvas: this.canvas});
    }
    
    hide() {
        const {x, y, block} = this.current;
        this.canvas.clear(x, y, block);
    }
    
    show() {
        const {x, y, block} = this.current;
        this.canvas.draw(x, y, block);
    }
    
    lockCurrent() {
        delete this.current;
        this.clock.stop();
        this.state.score += 100
        this.publish('lock');
    }
    
    async clearTetris() {
        const tetris = this.canvas.filter((row) => row.full);
        
        if(tetris.length) {
            this.publish('tetris', tetris);
            this.state.lines += tetris.length;
            this.state.level = (1 + (this.state.lines / 10)) | 0;
            this.state.score += tetris.length * tetris.length * 100;
            
            const coords = tetris.map(({y}) => ({ x: 0, y }));
            
            await this.canvas.animate(coords, this.speed, 5, [this.row(), this.row('grey')])
                      .then(() => this.floodEmptyRows());
        }
    }
    
    floodEmptyRows() {
        const scope = [...this.canvas].reverse();
        for(let row of [...this.canvas].reverse()) {
            if(scope.shift().empty) {
                const nextBlocks = scope.find((pivot) => !pivot.empty);
                if(!nextBlocks) break;
    
                this.canvas.draw(0, row.y, new Shape([nextBlocks]));
                this.canvas.replace(0, nextBlocks.y, this.row());
            }
        }
    }
    
    row(color) {
        return new Shape([new Array(this.canvas.width).fill({color})]);
    }
    
    gameOver() {
        this.lockCurrent();
        this.state.playing = false;
        this.publish('gameOver');
    }
    
    lastPossible(start, destination, valid) {
        const modifier = (start < destination) ? +1 : -1;
        
        for(let possible = start; possible !== destination; possible += modifier) {
            const next = possible + modifier;
            if(!valid(next)) {
                return possible;
            }
        }
        
        return destination;
    }
    
    get speed() {
        return (maxSpeed - (maxSpeed - minSpeed) * this.levelFactor) | 0;
    }
    
    get levelFactor() {
        return Math.min(1, (this.state.level-1) / (maxLevel-1));
    }
}