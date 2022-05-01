import { Shape } from 'lwc-arcade';
import { shuffled7Bag } from './sevenBagRandomizer';
import Stream from './stream';

export default class BlockStream extends Stream {
    constructor() {
        super(7, shapes());
        
        super.queryDataHook = () => super.write(...shapes());
    }
}

function shapes() {
    return shuffled7Bag().map((block) => new Shape(block));
}