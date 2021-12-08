import Stream from '../../../../classes/stream';
import { shuffled7Bag } from './sevenBagRandomizer';
import Shape from '../../../view/model/shape';

export default class FirebaseBlockStream extends Stream {
    constructor(session, initialBlocks) {
        super(7, initialBlocks.map((block) => new Shape(block)));
        
        const blockStream = session.child('blocks').orderByKey().startAfter('6');
        session.bind(blockStream, 'child_added', (data) => this.write(new Shape(data.val())));
        
        super.queryDataHook = () => shuffled7Bag().forEach((block) => session.child('blocks').push(session.jsonProof(block)));
    }
}