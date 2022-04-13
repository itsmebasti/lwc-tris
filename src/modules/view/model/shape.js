export default class Shape extends Array {
    static get [Symbol.species]() { return Array; }
    
    constructor(rows, color = FILLED) {
        super(...rows.map((pixels, y) => new Row(y, pixels, color)));
    }
    
    get pixels() {
        return this.flatMap((row) => row);
    }
    
    get painted() {
        return this.pixels.filter(({color}) => color);
    }
    
    get binaries() {
        return this.map((row) => row.map(({color}) => color ? 1 : 0));
    }
    
    get minified() {
        let firstX = this.width-1;
        let lastX = 0;
        let firstY = this.height-1;
        let lastY = 0;
        
        this.painted.forEach(({ x, y }) => {
            firstX = Math.min(firstX, x);
            lastX = Math.max(lastX, x);
            firstY = Math.min(firstY, y);
            lastY = Math.max(lastY, y);
        });
        
        return this.intersection(firstX, firstY, lastX, lastY);
    }
    
    intersection(xStart, yStart, xEnd, yEnd) {
        const width = xEnd - xStart + 1;
        const height = yEnd - yStart + 1;
        
        const result = new Array(height).fill().map(() => new Array(width).fill(0));
        
        this.painted.forEach(({ x, y, color }) => result[y-yStart][x-xStart] = {color});
        
        return result;
    }
    
    pixel(x, y) {
        return this[y]?.[x];
    }
    
    emptyAt(x, y) {
        return !this.pixel(x, y)?.color;
    }
    
    get empty() {
        return this.painted.length === 0;
    }
    
    get height() {
        return this.length;
    }
    
    get width() {
        return this[0]?.length ?? 0;
    }
    
    clone(color) {
        return (color) ? new Shape(this.binaries, color) : new Shape(this);
    }
    
    rotated() {
        return new Shape(this[0].map((unused, col) => this.map((row) => row[col]).reverse()));
    }
}

class Row extends Array {
    static get [Symbol.species]() { return Array; }
    y;
    
    constructor(y, row, color) {
        super(...row.map((value, x) => ({
            x, y,
            key: y+'_'+x,
            color: (value === 1) ? color : value?.color
        })));
        this.y = y;
    }
    
    get full() {
        return this.every((({color}) => color));
    }
    
    get empty() {
        return this.every((({color}) => !color));
    }
}

export var FILLED = Symbol();
export var CLEAR = Symbol();
export var PIXEL = new Shape([[1]]);