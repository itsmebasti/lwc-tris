export default class Shape extends Array {
    static get [Symbol.species]() { return Array; }
    
    constructor(rows, color) {
        super(...rows.map((pixels, y) => new Row(y, pixels, color)));
    }
    
    clone() {
        return new Shape(this);
    }
    
    print() {
        console.table(this.map((row) => row.map(({color}) => color)));
    }
    
    forPixel(callback) {
        this.forEach((row) =>
            row.forEach(({color, x, y}) => color && callback(x, y))
        );
    }
    
    everyPixel(fulfilled) {
        return this.every((row) =>
            row.every(({color, x, y}) => !color || fulfilled(x, y))
        );
    }
    
    rotated() {
        const result = this.clone();
        result.splice(0, Infinity,
            ...result[0].map((col, i) => result.map(row => row[i]).reverse())
        );
        return new Shape(result);
    }
    
    emptyAt(x, y) {
        const pixel = this.pixel(x, y);
        return !pixel || pixel.empty;
    }
    
    paint(x, y, color) {
        const pixel = this.pixel(x, y);
        pixel && pixel.paint(color);
    }
    
    pixel(x, y) {
        return (this[y]) ? this[y][x] : undefined;
    }
    
    get empty() {
        return this.every(({empty}) => empty);
    }
    
    get height() {
        return this.length;
    }
    
    get width() {
        return this.height ? this[0].length : 0;
    }
}

class Row extends Array {
    static get [Symbol.species]() { return Array; }
    y;
    
    constructor(y, row, color) {
        super(...row.map((value, x) => trackablePixel(x, y, value, color)));
        this.y = y;
    }
    
    get empty() {
        return this.every(((pixel) => pixel.empty));
    }
    
    get full() {
        return this.every(((pixel) => !pixel.empty));
    }
}

// Note: class instances would not be @tracked by lwc
function trackablePixel(x, y, value = {}, override) {
    return {
        x, y, key: y+'_'+x,
        
        paint(color) {
            this.color = color;
            this.style = color ? 'background-color: ' + color : undefined;
            return this;
        },
        get empty() { return !this.color; }
    }
    .paint((value === 1) ? override : value.color);
}