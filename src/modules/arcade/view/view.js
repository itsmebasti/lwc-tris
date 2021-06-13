import { LightningElement, api } from "lwc";

export default class View extends LightningElement {
    @api canvas = [];
    @api scale;
    @api background;
    @api border;
    
    get cellBorder() {
        return 'border: ' + this.border;
    }
    
    get canvasStyle() {
        return `
        width: ${this.canvas.width * this.scale}px;
        height: ${this.canvas.height * this.scale}px;
        background: ${this.background}`;
    }
    
    dispatchClick({target: {dataset: {x, y}}}) {
        x = Number(x);
        y = Number(y);
        this.dispatchEvent(new CustomEvent('pixelclick', {detail: {x, y}}))
    }
}