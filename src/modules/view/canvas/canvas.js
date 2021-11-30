import { LightningElement, api } from "lwc";

export default class Canvas extends LightningElement {
    @api grid = [];
    @api scale;
    @api background;
    @api border;
    
    canvas;
    
    renderedCallback() {
        if(!this.canvas) {
            const element = this.template.querySelector('canvas');
            element.width = this.grid.width * this.scale;
            element.height = this.grid.height * this.scale;
            
            element.style.imageRendering = 'pixelated';
            element.style.display = 'block';
            element.style.backgroundColor = this.background;
            
            this.canvas = element.getContext("2d");
            this.canvas.strokeStyle = this.border;
            this.canvas.lineWidth = 2;
        }
    }
    
    get changeHandlerWorkaround() {
        this.canvas && this.grid.forChanged(({x, y, color}) => {
            const s = this.scale;
            const rect = [x * s, y * s, s, s];
            
            (this.canvas.fillStyle = color)
                ? this.canvas.fillRect(...rect)
                : this.canvas.clearRect(...rect);
            this.canvas.strokeRect(...rect);
        });
    }
}