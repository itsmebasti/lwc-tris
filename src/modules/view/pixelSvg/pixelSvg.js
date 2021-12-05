import { LightningElement, api } from "lwc";

export default class PixelSvg extends LightningElement {
    @api grid = [];
    @api scale;
    @api background;
    
    get width() {
        return this.grid.width * this.scale;
    }

    get height() {
        return this.grid.height * this.scale;
    }
    
    get viewBox() {
        return '0 0 '+this.scale+' '+this.scale;
    }
}