import Shape from './shape';

let exposedFrame = -1;
export default class Grid extends Shape {
    frame = 0;
    
    constructor({ height, width, rows = new Array(height).fill().map(() => new Array(width).fill())}) {
        super(rows);
    }
    
    async animate(coords, duration, loops, shapes) {
        for(let i = 0; i < loops; i++) {
            const shape = shapes[i % shapes.length];
            coords.forEach(({x,y}) => shape.empty ? this.replace(x, y, shape) : this.draw(x, y, shape));
            await this.wait(duration/loops);
        }
    }
    
    draw(x, y, shape, color) {
        shape.forPixel((xOffset, yOffset) => {
            this.paint(x + xOffset, y + yOffset, color || shape.pixel(xOffset, yOffset).color);
        });
    }
    
    paint(x, y, color) {
        if(this.frame === exposedFrame) {
            this.frame++;
        }
        super.paint(x, y, color, this.frame);
    }
    
    set(x, y, shape, color) {
        this.reset();
        this.draw(x, y, shape, color);
    }
    
    replace(x, y, shape) {
        shape.forEach((row) =>
            row.forEach(({color, x: xOffset, y: yOffset}) => {
                this.paint(x + xOffset, y + yOffset, color);
            })
        );
    }
    
    reset() {
        this.frame = 0;
        exposedFrame = -1;
        this.forEach((row) => row.forEach(({x, y}) => this.paint(x, y, undefined)));
    }
    
    clear(x, y, shape) {
        shape.forPixel((xOffset, yOffset) => this.paint(x + xOffset, y + yOffset, undefined));
    }
    
    forChanged(callback) {
        this.forEach((row) =>
            row.filter(({frameId}) => frameId === this.frame)
               .forEach(callback)
        );
        
        exposedFrame = this.frame;
    }
    
    valid(x, y, shape) {
        return this.free(x, y, shape) && this.inside(x, y, shape);
    }
    
    free(x, y, shape = new Shape([[1]], 'white')) {
        return shape.everyPixel((xOffset, yOffset) => this.emptyAt(x + xOffset, y + yOffset));
    }
    
    inside(x, y, shape = new Shape([[1]], 'white')) {
        return shape.everyPixel((xOffset, yOffset) => {
            return y + yOffset >= 0 && y + yOffset < this.height
                && x + xOffset >= 0 && x + xOffset < this.width;
        });
    }
    
    get center() {
        return Math.floor((this.width) / 2);
    }
    
    async wait(ms) {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }
}