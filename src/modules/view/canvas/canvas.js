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
            const ratio = window.devicePixelRatio || 1;
            this.canvas = element.getContext("2d");
            
            element.width = Math.floor(this.grid.width * this.scale * ratio);
            element.height = Math.floor(this.grid.height * this.scale * ratio);
            element.style.width = this.grid.width * this.scale + 'px';
            element.style.height = this.grid.height * this.scale + 'px';
            this.canvas.scale(ratio, ratio);
            
            element.style.display = 'block';
            element.style.backgroundColor = this.background;
            element.style.imageRendering = 'pixelated';
            
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