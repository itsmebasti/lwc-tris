import { LightningElement, api } from "lwc";

export default class Grid extends LightningElement {
    @api grid = [];
    @api scale;
    @api background;
    @api border;
    
    canvas;
    
    renderedCallback() {
        if(!this.canvas) {
            this.canvas = this.template.querySelector('canvas').getContext("2d");
            this.canvas.strokeStyle = this.border;
            this.canvas.lineWidth = 2;
        }
    }
    
    get drawChanges() {
        this.grid.forChanged(({x, y, color}) => {
            const s = this.scale;
            const rect = [x * s, y * s, s, s];
            
            this.canvas.beginPath();
            (this.canvas.fillStyle = color)
                ? this.canvas.fillRect(...rect)
                : this.canvas.clearRect(...rect);
            this.canvas.strokeRect(...rect);
        });
    }
    
    get width() {
        return this.grid?.width * this.scale
    }
    
    get height() {
        return this.grid?.height * this.scale;
    }
    
    get style() {
        return 'background-color: ' + this.background;
    }
}