import { LightningElement, api, track } from 'lwc';

export default class View extends LightningElement {
    @api grid = [];
    @api scale = 1;
    @api background;
    @api border;
    
    @track view = {
        div: false,
        canvas: true,
        checkbox: false,
        pixelCanvas: false,
        pixelSvg: false,
    }
    
    @api types() {
        return Object.keys(this.view);
    }
    
    @api set type(value) {
        for(const view in this.view) {
            this.view[view] = (view === value);
        }
    }
    
    get type() {
        for(const view in this.view) {
            if(this.view[view]) {
                return view;
            }
        }
    }
}