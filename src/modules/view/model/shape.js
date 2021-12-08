export default class Shape extends Array {
    static get [Symbol.species]() { return Array; }
    
    constructor(rows, color = COLOR) {
        super(...rows.map((pixels, y) => new Row(y, pixels, color)));
    }
    
    get pixels() {
        return this.flatMap((row) => row);
    }
    
    get colored() {
        return this.pixels.filter(({color}) => color);
    }
    
    get simpleShape() {
        return this.map((row) => row.map(({color}) => color ? 1 : 0));
    }
    
    get coloredShape() {
        return this.map((row) => row.map(({color}) => ({color})));
    }
    
    pixel(x, y) {
        return this[y]?.[x];
    }
    
    emptyAt(x, y) {
        return !this.pixel(x, y)?.color;
    }
    
    get empty() {
        return this.colored.length === 0;
    }
    
    get height() {
        return this.length;
    }
    
    get width() {
        return this[0]?.length ?? 0;
    }
    
    clone() {
        return new Shape(this);
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

export var COLOR = 'placeholder';
export var PIXEL = new Shape([[{ color: COLOR }]]);