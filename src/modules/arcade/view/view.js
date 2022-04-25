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
    
    toggleOverlay(evt) {
        const divClasses = this.template.querySelector('.overlay').classList;
        if(evt.target.assignedNodes().length > 0) {
            divClasses.replace('slds-hidden', 'slds-show');
        }
        else {
            divClasses.replace('slds-show', 'slds-hidden');
        }
    }
}