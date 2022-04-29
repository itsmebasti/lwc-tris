import { LightningElement, api, track } from 'lwc';
import Canvas from '../../arcade/view/model/canvas';

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
        const index = this.competitors.findIndex((player) => player.name === name);
        const newValue = {name, state, canvas: new Canvas({rows: canvas})};
        
        if(index === -1) {
            this.competitors.push(newValue);
        }
        else {
            this.competitors[index] = newValue;
        }
    }
    
    removeCompetitor = (removed) => {
        this.competitors = this.competitors.filter(({name}) => name !== removed);
    }
}