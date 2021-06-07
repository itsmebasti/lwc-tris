import database from './database';
import { shuffled7Bag } from '../engine/sevenBagRandomizer';

export default class Session {
    reference;
    player;
    blocks = [];
    
    disconnects = [];
    
    constructor(room, player) {
        this.reference = database.ref(`rooms/${room}`);
        this.player = player;
    }
    
    connect(canvas, state) {
        return this.cleanup()
            .then(() => this.update({ state, canvas, joined: Date.now(), connected: Date.now() }))
            .then(() => {
                const connect = () => this.ref(`competitors/${this.player}/connected`).set(Date.now());
                const loop = setInterval(connect, 1000);
                this.disconnects.push(() => clearInterval(loop));
            })
            .then(() => this.subscribeBlocks());
    }
    
    ref(child) {
        return this.reference.child(child);
    }
    
    subscribeBlocks() {
        const blockStream = this.ref('blocks').orderByKey().startAfter('6');
        this.bind(blockStream, 'child_added', (data) => this.blocks.push(data.val()));
    }
    
    disconnect() {
        this.disconnects.forEach((unregister) => unregister());
    }
    
    onStart(resolve) {
        this.bind(this.ref('blocks').limitToFirst(8), 'value', (data) => {
            if(data.numChildren() === 7) {
                this.blocks = data.val();
                resolve();
            }
        });
    }
    
    addScore(state) {
        this.update({state});
        
        return database.ref(`highScore/${this.player}`).set(state.score)
            .catch((ignored) => {})
            .then(() => database.ref('highScore').orderByChild('score').limitToLast(10).once('value'))
            .then((data) => {
                const result = [];
                data.forEach((entry) => (result.unshift({player: entry.key, score: entry.val()}), false));
                return result;
            });
    }
    
    requestStart() {
        return this.cleanup()
                   .then(() => this.queryHost())
                   .then((host) => this.assert(this.player === host, host + ' is your current Host'))
                   .then(() => this.queryPlaying())
                   .then((players) => this.assert(players.length === 0, this.stillPlaying(players)))
                   .then(() => this.ref('blocks').set(this.json(shuffled7Bag())))
                   .then(() => 'Good Luck!')
                   .catch((message) => message);
    }
    
    nextBlock() {
        if(this.blocks.length < 6) {
            // Note: run async to not slow down the game
            setTimeout(() =>
                    shuffled7Bag().forEach((block) => this.ref('blocks').push(this.json(block)))
                , 0);
        }
        
        return this.blocks.shift();
    }
    
    cleanup() {
        return this.ref('competitors')
                   .orderByChild('connected')
                   .endAt(Date.now() - 3000)
                   .once('value')
                   .then((deprecated) => {
                       const removals = [];
                       deprecated.forEach(({ref}) => (removals.push(ref.remove()), false));
                       return Promise.all(removals);
                   });
    }
    
    update(player) {
        return this.ref(`competitors/${this.player}`).update(this.json(player));
    }
    
    onCompetitorUpdate(callback) {
        this.bind(this.ref('competitors'), 'child_changed', (data) => {
            (data.key !== this.player) && callback(data.key, data.val());
        });
    }
    
    onCompetitorQuit(callback) {
        this.bind(this.ref('competitors'), 'child_removed', ({ key }) => callback(key));
    }
    
    queryHost() {
        return this.ref('competitors')
                   .orderByChild('joined')
                   .limitToFirst(1)
                   .once('child_added')
                   .then(({ key }) => key);
    }
    
    queryPlaying() {
        return this.ref('competitors')
                   .orderByChild('state/playing').equalTo(true)
                   .once('value')
                   .then((playing) => {
                       const names = [];
                       playing.forEach(({ key }) => (names.push(key), false));
                       return names;
                   });
    }
    
    stillPlaying(players) {
        let result = '';
        
        const multiple = (players.length > 1);
        
        if(multiple) {
            result += players.slice(0, -1).join(', ') + ' and ';
        }
        
        result += players.slice(-1);
        result += ` ${multiple ? 'are' : 'is'} still playing`;
        
        return result;
    }
    
    bind(reference, event, callback) {
        reference.on(event, callback);
        
        this.disconnects.push(() => reference.off(event, callback));
    }
    
    json(value) {
        return JSON.parse(JSON.stringify(value));
    }
    
    assert(condition, message) {
        if( !condition) {
            throw new Error(message);
        }
    }
}