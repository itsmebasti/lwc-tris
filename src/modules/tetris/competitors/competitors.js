import { LightningElement, api, track } from 'lwc';
import Shape from '../../view/model/shape';
import Grid from '../../view/model/grid';

export default class Competitors extends LightningElement {
    @track competitors = [];
    
    @api set session(session) {
        session.on('connect', () => {
            this.competitors = [];
            
            try {
                session.on('competitorUpdate', this.updateCompetitor);
                session.on('competitorQuit', this.removeCompetitor);
            }
            catch(singlePlayer) {}
        })
    } get session() {}
    
    updateCompetitor = (name, {state, canvas}) => {
        const competitor = this.competitors.find((player) => player.name === name);
        
        if(competitor) {
            competitor.state = state;
            competitor.grid.set(0, 0, new Shape(canvas), 'grey');
        }
        else {
            this.competitors.push({name, state, grid: new Grid({rows: canvas})});
        }
    }
    
    removeCompetitor = (removed) => {
        this.competitors = this.competitors.filter(({name}) => name !== removed);
    }
}