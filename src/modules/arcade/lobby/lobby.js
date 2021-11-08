import { LightningElement, track } from 'lwc';

export default class Lobby extends LightningElement {
    @track games = {
        tetris: false,
        snake: true,
    }
    
    selectGame({target : {value}}) {
        for(const game in this.games) {
            this.games[game] = (game === value);
        }
    }
    
    get options() {
        return Object.keys(this.games).map((name) => ({name, selected: this.games[name]}));
    }
}