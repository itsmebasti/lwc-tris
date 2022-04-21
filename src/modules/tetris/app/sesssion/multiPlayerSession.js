import { shuffled7Bag } from '../engine/sevenBagRandomizer';
import FirebaseBlockStream from '../engine/firebaseBlockStream';
import Session from './session';
import { get, set, update, query, onValue, onChildChanged, child, orderByChild, limitToFirst, startAt } from 'firebase/database';

export default class MultiPlayerSession extends Session {
    room;
    openConnections = [];
    static TIMEOUT = 2 * 1000;
    
    constructor(room = 'Default') {
        super('connect', 'start', 'competitorUpdate');
        
        this.room = this.ref(`rooms/${room}`);
    }
    
    
    // OVERRIDES
    
    connect(player, canvas, state) {
        return this.queryPlayerNames()
            .then((players) => {
                if(players.includes(player)) {
                    throw player + ' is already playing!';
                }
            })
            .then(() => set(this.child(`competitors/${player}`),{ state, canvas: canvas.binaries, joined: Date.now(), connected: Date.now() }))
            .then(() => {
                this.player = player;
    
                onValue(query(this.child('blocks'), limitToFirst(8)), (data) =>
                    (data.size === 7) && this.publish('start', new FirebaseBlockStream(this.room, data.val())));
    
                onChildChanged(this.child('competitors'), (data) =>
                    (data.key !== this.player) && this.publish('competitorUpdate', data.key, data.val()));
    
                const connection = setInterval(() => this.update({ connected: Date.now() }), 1000);
                this.toBeClosed(() => clearInterval(connection));
    
                this.publish('connect', player);
            })
    }
    
    startBlockStream() {
        return this.queryHost()
                   .then((host) => this.assert(this.player === host, host + ' is your current Host'))
                   .then(() => this.queryPlayerNames())
                   .then((players) => this.assert(players.length === 0, this.stillPlayingString(players)))
                   .then(() => set(this.child('blocks'), this.jsonProof(shuffled7Bag())))
                   .then(() => 'Good Luck!')
    }
    
    update({ state, canvas, connected, joined }) {
        return update(this.child(`competitors/${this.player}`),
                        this.jsonProof({ state, canvas: canvas?.binaries, connected, joined }));
    }
    
    toBeClosed(connection) {
        this.openConnections.push(connection);
    }
    
    // PRIVATE
    
    disconnect() {
        this.openConnections.forEach((closer) => closer());
    }
    
    queryHost() {
        return get(this.connectedPlayersQuery())
            .then((competitors) => {
                let result;
    
                competitors.forEach((competitor) => {
                    if(!result || competitor.val().joined < result?.val().joined) {
                        result = competitor;
                    }
                });
    
                return result.key;
            });
    }
    
    queryPlayerNames() {
        return get(this.connectedPlayersQuery())
            .then((competitors) => {
                const result = [];
            
                competitors.forEach((competitor) => {
                    if(competitor.val().state.playing) {
                        result.push(competitor.key);
                    }
                });
            
                return result;
            });
    }
    
    queryConnectedNames() {
        return get(this.connectedPlayersQuery())
            .then((competitors) => Object.keys(competitors.val()));
    }
    
    connectedPlayersQuery() {
        return query(this.child('competitors'), orderByChild('connected'), startAt(Date.now() - MultiPlayerSession.TIMEOUT));
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
        return child(this.room, path);
    }
}