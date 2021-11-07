import { LightningElement, track } from 'lwc';

export default class Lobby extends LightningElement {
    @track games = {
        tetris: false,
        snake: true,
    }
    
    selectGame({target}) {
        target.blur();
        
        for(const game in this.games) {
            this.games[game] = (game === target.value);
        }
    }
}