import { LightningElement, api, track } from 'lwc';
import Grid from '../../view/model/grid';

export default class ColorPicker extends LightningElement {
    @track grid = new Grid(16);
    @api scale = 20;
    @api label = 'Color';
    @api selected = 'red';
    
    opened = false;
    
    connectedCallback() {
        this.grid.pixels.forEach(({x, y}) => this.grid.paint(x, y, this.color(x, y)));
    }
    
    get buttonStyle() {
        return `
            background-color: ${this.selected};
            width: ${this.scale}px;
            height: ${this.scale}px;
        `;
    }
    
    color(x, y) {
        return 'rgb(' + [x*y, x*(16-y), (16-x)*y].join(',') + ')';
    }
    
    open() {
        this.opened = true;
    }
    
    pick({offsetX: x, offsetY: y}) {
        this.selected = this.color(x/this.scale|0, y/this.scale|0);
        this.opened = false;
        this.dispatchEvent(new CustomEvent('select'));
    }
}