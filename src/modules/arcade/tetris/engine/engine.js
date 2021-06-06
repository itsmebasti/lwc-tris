import Shape from '../../../view/model/shape';

export default class Engine {
    canvas;
    current;
    
    nextTick;
    getSpeed;
    
    on = {
        change: [],
        insertBlock: [],
        rotate: [],
        lock: [],
        tetris: [],
        gameOver: []
    };
    
    constructor(canvas, getSpeed) {
        this.canvas = canvas;
        this.getSpeed = getSpeed;
    }
    
    handle(event, callback) {
        this.on[event].push(callback);
    }
    
    publish(event, detail) {
        return this.on[event].forEach((handler) => handler(detail));
    }
    
    start() {
        this.publish('insertBlock');
    }
    
    pause() {
        this.stopLoop();
    }
    
    resume() {
        this.startLoop();
    }
    
    reset() {
        this.pause();
        delete this.current;
    }
    
    get state() {
        return (this.nextTick && this.current) ? 'running' :
            (this.current) ? 'paused' : 'stopped'
    }
    
    insertNext(block) {
        const x = this.canvas.center-2;
        const y = -1;
        
        if(this.canvas.valid(x, y, block)) {
            this.current = {x, y, block};
            this.softDrop();
        }
        else {
            this.canvas.draw(x, y, block, 'grey');
            this.gameOver();
        }
    }
    
    softDrop() {
        this.stopLoop();
        this.move(0, 1);
        this.startLoop();
    }
    
    hardDrop() {
        this.move(0, this.canvas.height);
    }
    
    rotate() {
        if(!this.current) return;
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
        if(!this.current) return;
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
                .then(() => this.publish('insertBlock'));
        }
    }
    
    apply(change) {
        this.hide();
        change();
        this.show();
        
        this.publish('change', this.canvas);
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
        this.stopLoop();
        this.publish('lock', this.canvas);
    }
    
    async clearTetris() {
        const tetris = this.canvas.filter((row) => row.full);
        
        if(tetris.length) {
            this.publish('tetris', tetris);
            
            const coords = tetris.map(({y}) => ({ x: 0, y }));
            
            await this.canvas.animate(coords, this.getSpeed(), 5, [this.row(), this.row('grey')])
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
    
    startLoop() {
        if(this.nextTick) throw "already running";
        this.nextTick = setInterval(() => this.move(0, 1), this.getSpeed());
    }
    
    stopLoop() {
        clearInterval(this.nextTick);
        this.nextTick = undefined;
    }
}