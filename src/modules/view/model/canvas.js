import Shape from './shape';

export default class Canvas extends Shape {
    
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
    
    replace(x, y, shape) {
        shape.forEach((row) =>
            row.forEach(({color, x: xOffset, y: yOffset}) => {
                this.paint(x + xOffset, y + yOffset, color);
            })
        );
    }
    
    clear(x, y, shape) {
        shape.forPixel((xOffset, yOffset) => this.paint(x + xOffset, y + yOffset));
    }
    
    valid(x, y, shape) {
        return this.free(x, y, shape) && this.inside(x, y, shape);
    }
    
    free(x, y, shape) {
        return shape.everyPixel((xOffset, yOffset) => this.emptyAt(x + xOffset, y + yOffset));
    }
    
    inside(x, y, shape) {
        const {height, width} = this;
        return shape.everyPixel((xOffset, yOffset) => {
            return y + yOffset >= 0 && y + yOffset < height
                && x + xOffset >= 0 && x + xOffset < width;
        });
    }
    
    reset() {
        this.forPixel((x , y) => this.paint(x, y));
    }
    
    get center() {
        return Math.floor((this.width) / 2);
    }
    
    async wait(ms) {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }
}