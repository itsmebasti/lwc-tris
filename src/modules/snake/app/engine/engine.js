import { GameClock, Publisher } from 'lwc-arcade';
import Random from '../../../../lib/random';
import { Direction } from 'lwc-arcade';
export default class Engine extends Publisher  {
    canvas;
    directions;
    snake;
    snack;
    
    constructor(canvas) {
        super('gameOver', 'snack', 'start');
        this.canvas = canvas;
        this.clock = new GameClock(() => this.move());
        this.directions = new Direction.Queue();
    }
    
    reset() {
        this.clock.stop();
        this.canvas.clear();
        delete this.snake;
        delete this.snack;
    }
    
    start(speed) {
        this.reset();
        
        const x = this.canvas.width / 2 | 0;
        this.snake = [{x, y:0}, {x, y:1}, {x, y:2}, {x, y:3}];
        this.canvas.paint(x, 0, 'white');
        this.canvas.paint(x, 1, 'white');
        this.canvas.paint(x, 2, 'white');
        this.canvas.paint(x, 3, 'orange');
    
        this.drawNextSnack();
        this.directions.start(Direction.DOWN);
        this.clock.start(speed);
        this.publish('start')
    }
    
    next(direction) {
        this.directions.add(direction);
    }
    
    move() {
        const direction = this.directions.next();
        const head = this.snake[this.snake.length-1];
        const newHead = {...head};
        newHead[direction.axis] += direction.value;
        
        if(newHead.x === this.snack.x && newHead.y === this.snack.y) {
            this.canvas.clear(this.snack.x, this.snack.y);
            delete this.snack;
            this.publish('snack', {length: this.snake.length+1});
        }
        else {
            const tail = this.snake.shift();
            this.canvas.clear(tail.x, tail.y);
        }
        
        if( !this.canvas.valid(newHead.x, newHead.y)) {
            this.clock.stop();
            this.publish('gameOver');
        }
        else {
            this.snake.push(newHead);
            this.canvas.paint(head.x, head.y, 'white');
            this.canvas.paint(newHead.x, newHead.y, 'orange');
    
            !this.snack && this.drawNextSnack();
        }
    }
    
    drawNextSnack() {
        this.snack = this.randomPixel();
    
        while( !this.canvas.free(this.snack.x, this.snack.y)) {
            this.snack = this.randomPixel();
        }
    
        this.canvas.paint(this.snack.x, this.snack.y, 'green');
    }
    
    randomPixel() {
        return { x: new Random().number(this.canvas.width-1),
                 y: new Random().number(this.canvas.height-1)};
    }
}