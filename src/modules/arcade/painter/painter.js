import { LightningElement, track } from 'lwc';
import Grid from '../../view/model/grid';
import Shape from '../../view/model/shape';

export default class Painter extends LightningElement {
    width = 20;
    height = 20;
    scale = 20;
    color = 'red';
    background = 'black';
    @track grid = new Grid(this.width, this.height);
    @track minified = new Grid(5);
    
    mouseDown = 0;
    lastX;
    lastY;
    
    json;
    binaries;
    
    constructor() {
        super();
        this.reset();
    }
    
    
    stroke(evt) {
        this.mouseDown && this.paint(evt);
    }
    
    reset() {
        this.lastX = -1;
        this.lastY = -1;
        this.json = 'empty';
        this.binaries = 'empty';
        this.grid.clear();
    }
    
    paint({offsetX: x, offsetY: y}) {
        x = x/this.scale|0;
        y = y/this.scale|0;
        
        if(x !== this.lastX || y !== this.lastY) {
            this.grid.paint(x, y, this.color);
            this.lastX = x;
            this.lastY = y;
            
            const minified = this.grid.minified;
            const shape = new Shape(minified);
            
            this.minified = new Grid(shape.width, shape.height);
            this.minified.set(0, 0, shape);
            
            this.json = JSON.stringify(minified);
            this.binaries = JSON.stringify(shape.binaries);
        }
    }
    
    selectColor({ target: { selected } }) {
        this.color = selected;
    }
    
    selectBackground({ target: { selected } }) {
        this.background = selected;
    }
    
    down(evt) {
        this.paint(evt);
        this.mouseDown = 1;
    }
    
    up(evt) {
        this.paint(evt);
        this.mouseDown = 0;
    }
}