import Shape from '../../../view/divCanvas/model/shape';

export default class SevenBagRandomizer {
    currentBag = [];
    current;
    
    next() {
        if(this.currentBag.length === 0) {
            this.currentBag = this.shuffledBag();
        }
        
        this.current = this.currentBag.pop();
        return this.current;
    }
    
    shuffledBag() {
        const blocks = [
            {type: 'I', color: 'blue',   shape: new Shape([0,0,0,0], [1,1,1,1], [0,0,0,0])},
            {type: 'O', color: 'yellow', shape: new Shape([0,0,0,0],[0,1,1,0], [0,1,1,0],[0,0,0,0])},
            {type: 'T', color: 'green',  shape: new Shape([0,0,0], [1,1,1], [0,1,0])},
            {type: 'L', color: 'maroon', shape: new Shape([0,0,0], [1,1,1], [1,0,0])},
            {type: 'J', color: 'red',    shape: new Shape([0,0,0], [1,1,1], [0,0,1])},
            {type: 'Z', color: 'purple', shape: new Shape([0,0,0], [1,1,0], [0,1,1], [0,0,0])},
            {type: 'S', color: 'orange', shape: new Shape([0,0,0], [0,1,1], [1,1,0], [0,0,0])}
        ];
    
        for(let i = blocks.length - 1; i > 0; i--) {
            const j = Math.random() * (i + 1) | 0;
            [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
        }
        
        return blocks;
    }
}