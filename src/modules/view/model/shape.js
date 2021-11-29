export default class Shape extends Array {
    static get [Symbol.species]() { return Array; }
    
    constructor(rows, color) {
        super(...rows.map((pixels, y) => new Row(y, pixels, color)));
    }
    
    clone() {
        return new Shape(this);
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
        return this.pixel(x, y)?.empty;
    }
    
    paint(x, y, color, frameId) {
        const pixel = this.pixel(x, y);
        pixel && pixel.paint(color, frameId);
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
        return this[0]?.length ?? 0;
    }
    
    print() {
        console.table(this.map((row) => row.map(({color}) => color)));
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
        
        paint(color, frameId = 0) {
            this.color = color;
            this.frameId = frameId;
            this.style = color ? 'background-color: ' + color : undefined;
            return this;
        },
        get empty() { return !this.color; }
    }
    .paint((value === 1) ? override : value.color);
}