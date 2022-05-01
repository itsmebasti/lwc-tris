import { Shape } from 'lwc-arcade';
import Random from '../../../../lib/random';

const I = new Shape([[0,0,0,0], [1,1,1,1], [0,0,0,0]], 'blue');
const O = new Shape([[0,0,0,0],[0,1,1,0], [0,1,1,0],[0,0,0,0]], 'yellow');
const T = new Shape([[0,0,0], [1,1,1], [0,1,0]], 'green');
const L = new Shape([[0,0,0], [1,1,1], [1,0,0]], 'maroon');
const J = new Shape([[0,0,0], [1,1,1], [0,0,1]], 'red');
const Z = new Shape([[0,0,0], [1,1,0], [0,1,1], [0,0,0]], 'purple');
const S = new Shape([[0,0,0], [0,1,1], [1,1,0], [0,0,0]], 'orange');
const blocks = [I, O, T, L, J, Z, S];

export function shuffled7Bag() {
    const result = blocks.map((block) => block.clone());
    
    for(let i = result.length - 1; i > 0; i--) {
        const j = new Random().number(i);
        [result[i], result[j]] = [result[j], result[i]];
    }
    
    return result;
}