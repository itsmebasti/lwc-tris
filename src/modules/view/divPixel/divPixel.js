import { LightningElement, api } from "lwc";

export default class DivPixel extends LightningElement {
    @api scale = 1;
    @api border;
    @api color;
    
    get style() {
        return `
            box-sizing: border-box;
            width: ${this.scale}px;
            height: ${this.scale}px;
            ${this.border ? 'border: 1px solid ' + this.border + ';' : ''}
            ${this.color ? 'background: ' + this.color + ';' : ''}
        `;
    }
}