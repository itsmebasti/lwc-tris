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
}