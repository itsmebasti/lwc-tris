import { LightningElement, api } from "lwc";

export default class PixelCanvas extends LightningElement {
    @api grid = [];
    @api scale;
    @api background;
    
    canvas;
    lastChange = 0;
    
    renderedCallback() {
        if(!this.canvas) {
            const element = this.template.querySelector('canvas');
            element.width = this.grid.width;
            element.height = this.grid.height;
            
            element.style.display = 'block';
            element.style.backgroundColor = this.background;
            element.style.imageRendering = 'pixelated';
            element.style.width = this.grid.width * this.scale + 'px';
            element.style.height = this.grid.height * this.scale + 'px';
            
            this.canvas = element.getContext("2d");
        }
    }
    
    get changeHandlerWorkaround() {
        if(this.canvas) {
            this.grid.changesSince(this.lastChange).forEach(({ x, y, color }) => {
                (this.canvas.fillStyle = color)
                    ? this.canvas.fillRect(x, y, 1, 1)
                    : this.canvas.clearRect(x, y, 1, 1);
            });
    
            this.lastChange = this.grid.changeId;
        }
    }
}