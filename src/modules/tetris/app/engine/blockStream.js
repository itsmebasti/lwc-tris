import Stream from '../../../../classes/stream';
import { shuffled7Bag } from './sevenBagRandomizer';
import Shape from '../../../arcade/view/model/shape';

export default class BlockStream extends Stream {
    constructor() {
        super(7, shapes());
        
        super.queryDataHook = () => super.write(...shapes());
    }
}

function shapes() {
    return shuffled7Bag().map((block) => new Shape(block));
}