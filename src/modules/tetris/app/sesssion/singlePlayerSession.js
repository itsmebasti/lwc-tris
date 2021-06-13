import BlockStream from '../engine/blockStream';
import Session from './session';

export default class SinglePlayerSession extends Session {
    player;
    
    constructor() {
        super('connect', 'start', 'disconnect');
    }
    
    connect(player) {
        this.player = player;
        this.publish('connect');
        return Promise.resolve();
    }
    
    startBlockStream() {
        this.publish('start', new BlockStream());
        return Promise.resolve('Good Luck!');
    }
    
    update(data) {
        const {playing, score} = data.state || {};
        return (!playing && score) ? this.uploadScore(score) : Promise.resolve();
    }
}