import Randomizer from './sevenBagRandomizer';
import AudioPlayer from '../../../audioPlayer/audioPlayer';

const audioPlayer = new AudioPlayer("tetris");

export default class Engine {
    canvas;
    nextView;
    
    randomizer;
    current;
    next;
    
    audioPlayer;
    
    counters;
    tetris = 0;
    tick = 500;
    nextTick;
    state = 'new';
    
    constructor(canvas, nextView, counters) {
        this.canvas = canvas;
        this.nextView = nextView;
        this.randomizer = new Randomizer();
        this.audioPlayer = audioPlayer;
        this.counters = counters;
    }
    
    playPause() {
        switch(this.state) {
            case 'new':
                this.audioPlayer.playMusic();
                this.state = "running";
                this.insertNext(this.randomizer.next());
                break;
            case 'paused':
                this.audioPlayer.playMusic();
                this.state = "running";
                this.nextTick = setTimeout(() => this.move(0, 1), this.speed);
                break;
            case 'running':
                this.audioPlayer.pauseMusic();
                clearTimeout(this.nextTick);
                this.state = "paused";
                break;
        }
    }
    
    stop() {
        this.audioPlayer.stopMusic();
        clearTimeout(this.nextTick);
        this.state = "paused";
    }
    
    rotate() {
        this.audioPlayer.playSoundClip("rotate");
        if(this.state !== "running" || !this.current) return;
        const {x, y, block: {shape}} = this.current;
        
        this.hide();
        if(this.canvas.valid(x, y, shape.rotated())) {
            shape.rotate();
        }
        this.draw();
    }
    
    softDrop() {
        if(this.state !== "running" || !this.current) return;
        clearTimeout(this.nextTick);
        this.move(0, 1);
    }
    
    hardDrop() {
        if(this.state !== "running" || !this.current) return;
        this.move(0, this.canvas.height + 1);
    }
    
    move(xOffset, yOffset = 0) {
        if(this.state !== "running" || !this.current) return;
        
        const {x, y, block: {shape}} = this.current;
        
        const newX = x+xOffset;
        const newY = y+yOffset;
        
        this.hide();
        this.current.x = this.lastPossible(x, newX, (x) => this.canvas.valid(x, y, shape));
        this.current.y = this.lastPossible(y, newY, (y) => this.canvas.valid(x, y, shape));
        this.draw();
        
        if(yOffset) {
            clearTimeout(this.nextTick);
            if(this.current.y !== newY) {
                delete this.current;
    
                this.counters.score += 100;
                
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
            
            this.tetris += tetris.length;
            this.counters.level = (1 + (this.tetris / 10)) | 0;
            this.counters.score += tetris.length * tetris.length * 100;
            
            if(tetris.length > 0) {
                this.audioPlayer.playSoundClip("touchDown");
                this.audioPlayer.increaseMusicSpeed()
                
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
        this.state = "game over";
        
        this.audioPlayer.stopMusic();
        this.audioPlayer.playSoundClip("gameOver");
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
        return Math.max(200, this.tick - (this.counters.level * 50));
    }
    
    toggleAudio() {
        this.audioPlayer.toggleAudio();
    }
}