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
        const shape = new Shape(canvas);
        let competitor = this.competitors.find((player) => player.name === name);
        
        if(!competitor) {
            competitor = {name, grid: new Grid(shape.width, shape.height)};
            this.competitors.push(competitor);
        }
        
        competitor.state = state;
        competitor.grid.set(0, 0, shape, 'grey');
    }
    
    removeCompetitor = (removed) => {
        this.competitors = this.competitors.filter(({name}) => name !== removed);
    }
}