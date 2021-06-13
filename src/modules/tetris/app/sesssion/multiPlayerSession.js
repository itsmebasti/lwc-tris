import { shuffled7Bag } from '../engine/sevenBagRandomizer';
import FirebaseBlockStream from '../engine/firebaseBlockStream';
import Session from './session';

export default class MultiPlayerSession extends Session {
    room;
    
    constructor(room) {
        super('connect', 'start', 'competitorUpdate', 'competitorQuit');
        
        this.room = this.ref(`rooms/${room}`);
    }
    
    
    // OVERRIDES
    
    connect(player, canvas, state) {
        return this.cleanupCompetitors()
            .then(() => this.child(`competitors/${player}`).set(this.json({ state, canvas, joined: Date.now(), connected: Date.now() })))
            .then(() => {
                this.player = player;
    
                this.bind(this.child('blocks').limitToFirst(8), 'value', (data) =>
                    (data.numChildren() === 7) && this.publish('start', new FirebaseBlockStream(this, data.val())));
    
                this.bind(this.child('competitors'), 'child_changed', (data) =>
                    (data.key !== this.player) && this.publish('competitorUpdate', data.key, data.val()));
    
                this.bind(this.child('competitors'), 'child_removed', ({ key }) => this.publish('competitorQuit', key));
                
                const connect = setInterval(() => this.update({connected: Date.now() }), 1000);
                this.disconnects.push(() => clearInterval(connect));
    
                this.publish('connect');
            })
    }
    
    startBlockStream() {
        return this.cleanupCompetitors()
                   .then(() => this.queryHost())
                   .then((host) => this.assert(this.player === host, host + ' is your current Host'))
                   .then(() => this.queryPlaying())
                   .then((players) => this.assert(players.length === 0, this.stillPlayingString(players)))
                   .then(() => this.child('blocks').set(this.json(shuffled7Bag())))
                   .then(() => 'Good Luck!');
    }
    
    update(data) {
        return this.child(`competitors/${this.player}`).update(this.json(data))
            .then(() => {
                const {playing, score} = data.state || {};
                if(!playing && score) {
                    return this.uploadScore(score);
                }
            });
    }
    
    // PRIVATE
    
    cleanupCompetitors() {
        return this.child('competitors')
                   .orderByChild('connected')
                   .endAt(Date.now() - 2000)
                   .once('value')
                   .then((deprecated) => {
                       const removals = [];
                       deprecated.forEach(({ref}) => (removals.push(ref.remove()), false));
                       return Promise.all(removals);
                   });
    }
    
    queryHost() {
        return this.child('competitors')
                   .orderByChild('joined')
                   .limitToFirst(1)
                   .once('child_added')
                   .then(({ key }) => key);
    }
    
    queryPlaying() {
        return this.child('competitors')
                   .orderByChild('state/playing').equalTo(true)
                   .once('value')
                   .then((playing) => {
                       const names = [];
                       playing.forEach(({ key }) => (names.push(key), false));
                       return names;
                   });
    }
    
    stillPlayingString(players) {
        let result = '';
        
        const multiple = (players.length > 1);
        
        if(multiple) {
            result += players.slice(0, -1).join(', ') + ' and ';
        }
        
        result += players.slice(-1);
        result += ` ${multiple ? 'are' : 'is'} still playing`;
        
        return result;
    }
    
    child(path) {
        return this.room.child(path);
    }
}