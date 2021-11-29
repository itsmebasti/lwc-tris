import { LightningElement, track, api } from 'lwc';
import Grid from '../model/grid';
import numbers from '../model/numbers';

export default class Score extends LightningElement {
    @api scale;
    @track board;
    
    @api set digits(value) {
        this.board = new Grid({ width: value * 4 - 1, height: 5 });
        this.score = 0;
    } get digits() { }
    
    @api set score(value) {
        if(isNaN(value) || !this.board) {
            return;
        }
        
        this.board.reset();
        
        value.toString().split('')
             .reverse()
             .forEach((digit, i) => {
                 this.board.draw(this.board.width - 3 - i*4, 0, numbers[digit]);
             });
    } get score() {}
}