import Stream from '../../../../classes/stream';
import { shuffled7Bag } from './sevenBagRandomizer';
import Shape from '../../../view/model/shape';
import { push, child, onChildAdded, startAt, query, orderByKey } from 'firebase/database';

export default class FirebaseBlockStream extends Stream {
    constructor(room, initialBlocks) {
        super(7, initialBlocks.map((block) => new Shape(block)));
        
        onChildAdded(query(child(room, 'blocks'), orderByKey(), startAt('7')), (data) => this.write(new Shape(data.val())));
        
        super.queryDataHook = () => shuffled7Bag().forEach((block) => push( child(room, 'blocks'), this.jsonProof(block)));
    }
    
    jsonProof(value) {
        return JSON.parse(JSON.stringify(value));
    }
}