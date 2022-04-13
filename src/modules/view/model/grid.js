import Shape, { FILLED, CLEAR, PIXEL } from './shape';

export default class Grid extends Shape {
    changeId = 0;
    
    constructor(width, height = width) {
        super(new Array(height).fill().map(() => new Array(width).fill(0)));
        
        this.pixels.forEach((pixel) => pixel.changeId = ++this.changeId);
    }
    
    set(x, y, shape, color) {
        this.clear();
        this.draw(x, y, shape, color);
    }
    
    draw(x, y, shape, color) {
        this.paint(x, y, color, shape);
    }
    
    clear(x = 0, y = 0, shape = (arguments.length) ? PIXEL : this) {
        this.paint(x, y, CLEAR, shape);
    }
    
    move(x, y, shape, toX, toY) {
        this.clear(x, y, shape);
        this.draw(toX, toY, shape);
    }
    
    paint(x, y, override, shape = PIXEL) {
        shape.painted.forEach(({x: xOffset, y: yOffset, color}) => {
            const pixel = this.pixel(x+xOffset, y+yOffset);
            
            if(pixel) {
                switch(color = override ?? color) {
                    case FILLED: throw 'invalid color';
                    case CLEAR: color = undefined;
                }
                pixel.color = color;
                pixel.changeId = ++this.changeId;
            }
        });
    }
    
    changesSince(lastChange) {
        return this.pixels.filter(({changeId}) => changeId > lastChange)
    }
    
    valid(x, y, shape) {
        return this.free(x, y, shape) && this.inside(x, y, shape);
    }
    
    free(x, y, shape = PIXEL) {
        return shape.painted.every(({x: xOffset, y: yOffset}) => this.emptyAt(x + xOffset, y + yOffset));
    }
    
    inside(x, y, shape = PIXEL) {
        return shape.painted.every(({x: xOffset, y: yOffset}) => {
            return y + yOffset >= 0 && y + yOffset < this.height
                && x + xOffset >= 0 && x + xOffset < this.width;
        });
    }
    
    async animate(coords, duration, loops, shapes) {
        for(let i = 0; i < loops; i++) {
            const shape = shapes[i % shapes.length];
            coords.forEach(({x,y}) => this.draw(x, y, shape));
            await this.wait(duration/loops);
        }
    }
    
    async wait(ms) {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }
}