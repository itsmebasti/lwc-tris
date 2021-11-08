import { LightningElement, track, api } from 'lwc';
import Canvas from '../view/model/canvas';
import numbers from './numbers';

export default class Scoreboard extends LightningElement {
    @api scale;
    @track board;
    
    @api set digits(value) {
        this.board = new Canvas({ width: value * 4 - 1, height: 5 });
        this.score = 0;
    } get digits() { }
    
    @api set score(value) {
        if(isNaN(value) || !this.board) {
            return;
        }
        
        this.board.clear();
        
        value.toString().split('')
             .reverse()
             .forEach((digit, i) => {
                 this.board.draw(this.board.width - 3 - i*4, 0, numbers[digit]);
             });
    } get score() {}
}