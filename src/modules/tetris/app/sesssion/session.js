import Publisher from '../../../../classes/publisher';
import { getDatabase, ref, set, orderByValue, limitToLast, get, query } from 'firebase/database';

export default class Session extends Publisher {
    static ABSTRACT_METHODS = ['connect', 'update', 'startBlockStream'];
    
    player;
    
    constructor(...events) {
        super(...events);
        
        Session.ABSTRACT_METHODS
               .forEach((method) => this.assert(typeof this[method] === 'function', 'please implement abstract method ' + method));
    }
    
    publish(evt, ...details) {
        if(this.player) super.publish(evt, ...details);
    }
    
    ref(name) {
        return ref(getDatabase(), name);
    }
    
    uploadScore(score) {
        return set(this.ref(`highScore/${this.player}`), score)
            .catch((ignored) => {});
    }
    
    queryHighScore() {
        return get(query(this.ref('highScore'), orderByValue(), limitToLast(10)))
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