const DOWN = {axis: 'y', value: 1};
const UP = {axis: 'y', value: -1};
const RIGHT = {axis: 'x', value: 1};
const LEFT = {axis: 'x', value: -1};

DOWN.opposite = UP;
UP.opposite = DOWN;
RIGHT.opposite = LEFT;
LEFT.opposite = RIGHT;

class DirectionQueue {
    last;
    queue = [];
    
    start(direction) {
        this.queue.length = 0;
        this.last = direction;
    }
    
    add(direction) {
        if(this.queue[0] && direction !== this.queue[0]) {
            this.queue[1] = direction;
        }
        else {
            this.queue[0] = direction;
        }
    }
    
    next() {
        let next = this.queue.shift();
        
        if(next?.opposite === this.last) {
            next = this.queue.shift();
        }
        
        next = next || this.last;
        
        this.last = next;
        return next;
    }
}

export { UP, DOWN, RIGHT, LEFT, DirectionQueue }