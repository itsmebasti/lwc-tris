import { Publisher, GameClock, Shape, Pixel } from 'lwc-arcade';

const maxLevel = 15;
const maxSpeed = 400;
const minSpeed = 100;

export default class Engine extends Publisher {
    canvas;
    blockStream;
    current;
    state;
    clock;
    readyToLock = false;
    
    constructor(canvas) {
        super('start', 'next', 'change', 'rotate', 'lock', 'tetris', 'gameOver');
        this.canvas = canvas;
        this.clock = new GameClock(() => this.moveY(1));
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
        this.canvas.clear();
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
        const x = (this.canvas.width/2) - 2 | 0;
        const y = 0;
        
        if(this.canvas.valid(x, y, block)) {
            this.current = {x, y, block};
            this.show();
            this.publish('next');
            this.clock.start(this.speed);
        }
        else {
            this.gameOver(x, y, block);
        }
    }
    
    softDrop() {
        if(!this.running) return;
        this.clock.stop();
        this.moveY(1);
        this.clock.start(this.speed);
    }
    
    hardDrop() {
        if(!this.running) return;
        this.clock.stop();
        this.readyToLock = true;
        this.moveY(this.canvas.height);
    }
    
    rotate() {
        if(!this.running) return;
        const {x, y, block} = this.current;
        
        this.apply(() => {
            const rotated = block.rotated();
            if(this.canvas.valid(x, y, rotated)) {
                this.current.block = rotated;
                this.publish('rotate');
            }
        });
    }
    
    moveX(offset) {
        if(!this.running) return;
        const {x, y, block} = this.current;
        const target = x + offset;
        
        this.apply(() => this.current.x = this.lastPossible(x, target, (x) => this.canvas.valid(x, y, block)));
    }
    
    moveY(offset) {
        if(!this.running) return;
        const {x, y, block} = this.current;
        const target = y + offset;
        
        this.apply(() => this.current.y = this.lastPossible(y, target, (y) => this.canvas.valid(x, y, block)));
        
        const yCollision = (this.current.y !== target);
        if(yCollision) {
            if(this.readyToLock) {
                this.readyToLock = false;
                this.lockCurrent();
                
                this.clearTetris()
                    .then(() => this.insertBlock());
            }
            else {
                this.readyToLock = true;
            }
        }
        else if(offset > 0) {
            this.readyToLock = false;
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
            
            await this.canvas.animate(coords, this.speed, 5, [this.row(Pixel.CLEAR), this.row('grey')])
                      .then(() => this.floodEmptyRows());
        }
    }
    
    floodEmptyRows() {
        const scope = [...this.canvas].reverse();
        for(let row of [...scope]) {
            if(scope.shift().empty) {
                const nextBlocks = scope.find((row) => !row.empty);
                if(!nextBlocks) break;
    
                this.canvas.move(0, nextBlocks.y, new Shape([nextBlocks]), 0, row.y);
            }
        }
    }
    
    row(color) {
        return new Shape([new Array(this.canvas.width).fill({color})]);
    }
    
    gameOver(x, y, block) {
        this.state.playing = false;
        
        this.canvas.animate([{x, y}], 1000, 11, [block.clone('grey'), block.clone(Pixel.CLEAR)])
            .then(() => {
                this.publish('gameOver');
            });
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
    
    get running() {
        return (this.state.playing && !this.state.paused && this.current);
    }
}