import database from './database';
import Publisher from '../../../../classes/publisher';

export default class Session extends Publisher {
    player;
    disconnects = [];
    
    constructor(...events) {
        super(...events);
    
        const abstract = ['connect', 'update', 'startBlockStream'];
        abstract.forEach((method) => this.assert(typeof this[method] === 'function', 'please implement abstract method ' + method));
    }
    
    publish(evt, ...details) {
        if(this.player) super.publish(evt, ...details);
    }
    
    bind(reference, event, callback) {
        reference.on(event, callback);
        
        this.disconnects.push(() => reference.off(event, callback));
    }
    
    ref(name) {
        return database.ref(name);
    }
    
    disconnect() {
        this.disconnects.forEach((unregister) => unregister());
    }
    
    uploadScore(score) {
        return this.ref(`highScore/${this.player}`).set(score)
            .catch((ignored) => {});
    }
    
    queryHighScore() {
        return this.ref('highScore').orderByValue().limitToLast(10).once('value')
           .then((data) => {
               const result = [];
               data.forEach((entry) => (result.unshift({player: entry.key, score: entry.val()}), false));
               return result;
           });
    }
    
    jsonProof(value) {
        return JSON.parse(JSON.stringify(value));
    }
    
    assert(condition, message) {
        if( !condition) {
            throw new Error(message);
        }
    }
}