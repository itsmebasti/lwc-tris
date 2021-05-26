import Randomizer from './sevenBagRandomizer';
import AudioPlayer from '../../../audioPlayer/audioPlayer';

const audio = new AudioPlayer("tetris");

export default class Engine {
    canvas;
    nextView;
    
    randomizer;
    current;
    next;
    
    maxLevel = 20;
    tick = 600;
    nextTick;
    
    changeHandlers = [];
    
    constructor(canvas, nextView, state) {
        this.canvas = canvas;
        this.nextView = nextView;
        this.randomizer = new Randomizer();
        this.state = state;
    }
    
    onchange(callback) {
        this.changeHandlers.push(callback);
    }
    
    playPause() {
        switch(this.state.current) {
            case 'new':
                audio.play();
                audio.speed(1);
                this.state.current = "running";
                this.insertNext(this.randomizer.next());
                break;
            case 'paused':
                audio.play();
                this.state.current = "running";
                this.nextTick = setTimeout(() => this.move(0, 1), this.speed);
                break;
            case 'running':
                audio.stop();
                clearTimeout(this.nextTick);
                this.state.current = "paused";
                break;
        }
    }
    
    stop() {
        audio.stop();
        clearTimeout(this.nextTick);
        this.state.current = "paused";
    }
    
    rotate() {
        if(this.state.current !== "running" || !this.current) return;
        
        audio.play("rotate");
        const {x, y, block: {shape}} = this.current;
        
        this.hide();
        if(this.canvas.valid(x, y, shape.rotated())) {
            shape.rotate();
        }
        this.draw();
        this.changeHandlers.forEach((handler) => handler(this.canvas));
    }
    
    softDrop() {
        if(this.state.current !== "running" || !this.current) return;
        
        clearTimeout(this.nextTick);
        this.move(0, 1);
    }
    
    hardDrop() {
        if(this.state.current !== "running" || !this.current) return;
        
        this.move(0, this.canvas.height + 1);
    }
    
    move(xOffset, yOffset = 0) {
        if(this.state.current !== "running" || !this.current) return;
        
        const {x, y, block: {shape}} = this.current;
        
        const newX = x+xOffset;
        const newY = y+yOffset;
        
        this.hide();
        this.current.x = this.lastPossible(x, newX, (x) => this.canvas.valid(x, y, shape));
        this.current.y = this.lastPossible(y, newY, (y) => this.canvas.valid(x, y, shape));
        this.draw();
        this.changeHandlers.forEach((handler) => handler(this.canvas));
        
        if(yOffset) {
            clearTimeout(this.nextTick);
            if(this.current.y !== newY) {
                delete this.current;
    
                this.state.score += 100;
                
                this.clearTetris()
                    .then(() => this.insertNext());
            }
            else {
                this.nextTick = setTimeout(() => this.move(0, 1), this.speed);
            }
        }
    }
    
    clearTetris() {
        return new Promise((resolve) => {
            const tetris = this.canvas.filter((row) => row.full);
            
            this.state.lines += tetris.length;
            this.state.level = (1 + (this.state.lines / 10)) | 0;
            this.state.score += tetris.length * tetris.length * 100;
            
            if(tetris.length > 0) {
                audio.play("touchDown");
                audio.speed(1 + Math.min(0.5, (this.state.level-1) * (0.5 / this.maxLevel)));
                
                this.animate(tetris)
                    .then(() => this.floodEmptyRows())
                    .then(() => resolve());
            }
            else {
                resolve();
            }
        })
    }
    
    floodEmptyRows() {
        const scope = [...this.canvas].reverse();
        for(let row of [...this.canvas].reverse()) {
            if(scope.shift().empty) {
                const nextBlocks = scope.find((pivot) => !pivot.empty);
                if(!nextBlocks) break;
            
                this.canvas.move(nextBlocks, row);
            }
        }
    }
    
    animate(tetris) {
        const blink = (color) => {
            tetris.forEach((row) => row.fill(color));
            return new Promise((resolve) => setTimeout(resolve, this.speed/5))
        }
        
        return blink()
            .then(() => blink('grey'))
            .then(() => blink())
            .then(() => blink('grey'))
            .then(() => blink());
    }
    
    insertNext(block = this.next, x = this.canvas.center-2, y = -1) {
        if(this.canvas.valid(x, y, block.shape)) {
            this.current = {x, y, block};
    
            this.next && this.nextView.draw(0, 0, this.next.shape);
            this.next = this.randomizer.next();
            this.nextView.draw(0, 0, this.next.shape, this.next.color);
            
            this.move(0, 1);
        }
        else {
            this.gameOver();
        }
    }
    
    gameOver() {
        delete this.current;
        clearTimeout(this.nextTick);
        this.state.current = "game over";
        
        audio.stop();
        audio.play("gameOver");
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
    
    hide({x, y, block: {shape}} = this.current) {
        this.canvas.draw(x, y, shape);
    }
    
    draw({x, y, block: {shape, color}} = this.current) {
        this.canvas.draw(x, y, shape, color);
    }
    
    get speed() {
        return Math.max(100, this.tick - (this.state.level * 500 / this.maxLevel));
    }
    
    toggleAudio() {
        audio.toggleAudio();
    }
}