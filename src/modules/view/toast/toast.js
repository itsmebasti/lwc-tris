import { LightningElement, api } from 'lwc';

export default class Toast extends LightningElement {
    message;
    
    @api show(value) {
        this.message = value;
        
        const toast = this.template.querySelector('div');
        if(value && toast.className === '') {
            toast.className = 'show';
            
            setTimeout(() => toast.className = '', 3000);
        }
    }
}