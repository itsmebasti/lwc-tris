import { LightningElement, api } from "lwc";

export default class Div extends LightningElement {
    @api grid = [];
    @api scale;
    @api background;
    @api border;
    
    get style() {
        return `
        width: ${this.grid.width * this.scale}px;
        height: ${this.grid.height * this.scale}px;
        background: ${this.background}`;
    }
    
    get cellBorder() {
        return this.border ? 'border: 1px solid ' + this.border : '';
    }
    
    dispatchClick({target: {dataset: {x, y}}}) {
        x = Number(x);
        y = Number(y);
        this.dispatchEvent(new CustomEvent('pixelclick', {detail: {x, y}}))
    }
}