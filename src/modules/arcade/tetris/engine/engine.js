import { O, I, L, J, E, S, Z, Brick } from '../model/bricks';
import { SOUNDS } from '../../../audioPlayer/audioPlayer';
const bricks = [O, I, L, J, E, S, Z];

export default class Engine {
    canvas;
    nextView;
    current;
    audioPlayer;
    
    tetris = 0;
    score = 0;
    tick = 500;
    nextTick;
    state = 'new';
    
    constructor(canvas, nextView, audioPlayer) {
        this.canvas = canvas;
        this.nextView = nextView;
        this.audioPlayer = audioPlayer;
    }
    
    get level() {
        return (1 + this.tetris / 10) | 0;
    }
    
    get speed() {
        return Math.max(200, this.tick - this.level * 5);
    }
    
    playPause() {
        switch(this.state) {
            case 'new':
                this.audioPlayer.playMusic();
                this.state = "running";
                this.insert(this.randomBrick());
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
        this.audioPlayer.pauseMusic();
        clearTimeout(this.nextTick);
        this.state = "paused";
    }
    
    rotate() {
        this.audioPlayer.playSoundClip(SOUNDS.ROTATE)
        if(this.state !== "running" || !this.current) return;
        const {x, y, brick: {shape}} = this.current;
        
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
        this.current && this.move(0, this.canvas.height + 1);
    }
    
    move(xOffset, yOffset = 0) {
        if(this.state !== "running" || !this.current) return;
        
        const {x, y, brick: {shape}} = this.current;
        
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
                
                this.clearTetris()
                    .then(() => this.insert());
            }
            else {
                this.nextTick = setTimeout(() => this.move(0, 1), this.speed);
            }
        }
    }
    
    
    clearTetris() {
        return new Promise((resolve) => {
            const tetris = this.canvas.filter((row) => row.full);
            
            this.tetris -= tetris.length;
            this.score = this.tetris * this.tetris * 100;
            
            if(tetris.length > 0) {
                this.audioPlayer.playSoundClip(SOUNDS.ROW_CLEAR)
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
                const nextBricks = scope.find((pivot) => !pivot.empty);
                if(!nextBricks) break;
            
                this.canvas.move(nextBricks, row);
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
    
    insert(brick = this.next, x = this.canvas.center-2, y = -1) {
        if(this.canvas.valid(x, y, brick.shape)) {
            this.current = {x, y, brick};
            this.createNext(brick);
            this.move(0, 1);
        }
        else {
            this.gameOver();
        }
    }
    
    gameOver() {
        delete this.current;
        clearTimeout(this.nextTick);
        this.audioPlayer.stopMusic();
        this.audioPlayer.playSoundClip(SOUNDS.GAME_OVER);
        alert('Game Over');
        this.state = "game over";
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
    
    hide({x, y, brick: {shape}} = this.current) {
        this.canvas.draw(x, y, shape);
    }
    
    draw({x, y, brick: {shape, color}} = this.current) {
        this.canvas.draw(x, y, shape, color);
    }
    
    randomBrick() {
        return new Brick(bricks[Math.floor(Math.random() * bricks.length)]);
    }
    
    createNext() {
        this.next && this.nextView.draw(0, 0, this.next.shape);
        this.next = this.randomBrick();
        this.nextView.draw(0, 0, this.next.shape, this.next.color);
    }
}