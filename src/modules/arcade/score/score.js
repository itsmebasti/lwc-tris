import { LightningElement, track, api } from 'lwc';
import Grid from '../../view/model/grid';
import numbers from '../../view/model/numbers';

export default class Score extends LightningElement {
    @api scale = 1;
    @track board;
    
    @api set digits(value) {
        this.board = new Grid(value * 4 - 1, 5);
        this.score = 0;
    } get digits() {}
    
    @api set score(value) {
        if(isNaN(value) || !this.board) {
            return;
        }
        
        this.board.clear();
        
        value.toString().split('')
             .reverse()
             .forEach((digit, i) => {
                 this.board.draw(this.board.width - 3 - i*4, 0, numbers[digit], 'white');
             });
    } get score() {}
}