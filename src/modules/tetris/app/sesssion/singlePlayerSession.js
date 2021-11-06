import BlockStream from '../engine/blockStream';
import Session from './session';

export default class SinglePlayerSession extends Session {
    player;
    
    constructor() {
        super('connect', 'start', 'disconnect');
    }
    
    async connect(player) {
        this.player = player;
        this.publish('connect');
    }
    
    async startBlockStream() {
        this.publish('start', new BlockStream());
        return 'Good Luck!';
    }
    
    update(data) {
        const {playing, score} = data.state || {};
        return (!playing && score) ? this.uploadScore(score) : Promise.resolve();
    }
}