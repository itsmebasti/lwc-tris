import Shape, { PIXEL, COLOR } from './shape';

export default class Grid extends Shape {
    changeId = 0;
    
    constructor({ height, width, rows = new Array(height).fill().map(() => new Array(width).fill())}) {
        super(rows);
        
        this.pixels.forEach((pixel) => pixel.changeId = ++this.changeId);
    }
    
    set(x, y, shape, color) {
        this.clear();
        this.draw(x, y, shape, color);
    }
    
    draw(x, y, shape, color) {
        this.paint(x, y, color, shape.colored);
    }
    
    clear(x = 0, y = 0, shape = this) {
        this.paint(x, y, null, shape.colored);
    }
    
    replace(x, y, shape, color) {
        this.paint(x, y, color, shape.pixels);
    }
    
    move(x, y, shape, toX, toY) {
        this.clear(x, y, shape);
        this.draw(toX, toY, shape);
    }
    
    paint(x, y, override, pixels = PIXEL.pixels) {
        pixels.forEach(({x: xOffset, y: yOffset, color}) => {
            const pixel = this.pixel(x+xOffset, y+yOffset);
            if(pixel) {
                pixel.color = (override === null) ? undefined :
                                (override) ? override :
                                (color === COLOR) ? undefined : color;
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
        return shape.colored.every(({x: xOffset, y: yOffset}) => this.emptyAt(x + xOffset, y + yOffset));
    }
    
    inside(x, y, shape = PIXEL) {
        return shape.colored.every(({x: xOffset, y: yOffset}) => {
            return y + yOffset >= 0 && y + yOffset < this.height
                && x + xOffset >= 0 && x + xOffset < this.width;
        });
    }
    
    async animate(coords, duration, loops, shapes) {
        for(let i = 0; i < loops; i++) {
            const shape = shapes[i % shapes.length];
            coords.forEach(({x,y}) => shape.empty ? this.replace(x, y, shape) : this.draw(x, y, shape));
            await this.wait(duration/loops);
        }
    }
    
    async wait(ms) {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }
}