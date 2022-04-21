import { LightningElement, api, track } from 'lwc';
import Shape from '../../view/model/shape';
import Grid from '../../view/model/grid';
import MultiPlayerSession from '../app/sesssion/multiPlayerSession';

export default class Competitors extends LightningElement {
    @track competitors = [];
    
    @api set session(session) {
        if(session instanceof MultiPlayerSession) {
            session.on('connect', () => this.observePlayerConnections(session));
        }
    } get session() {}
    
    
    observePlayerConnections(session) {
        this.competitors = [];
        session.on('competitorUpdate', this.updateCompetitor);
        
        const connection = setInterval(() => this.cleanupConnections(session), 1000);
        session.toBeClosed(() => clearInterval(connection));
    }
    
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
    
    cleanupConnections = (session) => {
        session.queryConnectedNames()
               .then((connected) => {
                   this.competitors = this.competitors.filter(({name}) => connected.includes(name))
               });
    }
}