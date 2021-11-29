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
            this.canvas = element.getContext("2d", {antialias: false});
    
            const width = this.grid.width * this.scale;
            const height = this.grid.height * this.scale;
            const ratio = window.devicePixelRatio ?? 1;
            element.style.width = width + 'px';
            element.style.height = height + 'px';
            element.width = width * ratio;
            element.height = height * ratio;
            this.canvas.scale(ratio, ratio);
    
            element.style.display = 'block';
            element.style.backgroundColor = this.background;
            this.canvas.strokeStyle = this.border;
            this.canvas.lineWidth = 2;
        }
    }
    
    get changeHandlerWorkaround() {
        this.canvas && this.grid.forChanged(({x, y, color}) => {
            const s = this.scale;
            const rect = [x * s, y * s, s, s];
            
            this.canvas.beginPath();
            (this.canvas.fillStyle = color)
                ? this.canvas.fillRect(...rect)
                : this.canvas.clearRect(...rect);
            this.canvas.strokeRect(...rect);
        });
    }
}