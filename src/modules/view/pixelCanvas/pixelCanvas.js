import { LightningElement, api } from "lwc";

export default class PixelCanvas extends LightningElement {
    _grid = [];
    @api scale = 1;
    @api background;
    
    canvas;
    lastChange = 0;
    
    renderedCallback() {
        if(!this.canvas) {
            this.initCanvas();
        }
    }
    
    @api set grid(value) {
        this._grid = value;
        this.initCanvas();
    }
    
    get grid() {
        return this._grid;
    }
    
    get changeHandlerWorkaround() {
        if(this.canvas) {
            this.updateCanvas();
        }
    }
    
    initCanvas() {
        const element = this.template.querySelector('canvas');
        if(element) {
            element.width = this.grid.width;
            element.height = this.grid.height;
            
            element.style.display = 'block';
            element.style.backgroundColor = this.background;
            element.style.imageRendering = 'pixelated';
            element.style.width = this.grid.width * this.scale + 'px';
            element.style.height = this.grid.height * this.scale + 'px';
            
            this.canvas = element.getContext("2d");
            
            this.lastChange = 0;
            
            this.updateCanvas();
        }
    }
    
    updateCanvas() {
        this.grid.changesSince(this.lastChange).forEach(({ x, y, color }) => {
            (this.canvas.fillStyle = color)
                ? this.canvas.fillRect(x, y, 1, 1)
                : this.canvas.clearRect(x, y, 1, 1);
        });
        
        this.lastChange = this.grid.changeId;
    }
}