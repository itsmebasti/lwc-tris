export default class GameClock {
    nextTick;
    action;
    
    constructor(action) {
        this.action = action;
    }
    
    start(speed) {
        if(this.nextTick) throw "already running";
        this.nextTick = setInterval(this.action, speed);
    }
    
    stop() {
        clearInterval(this.nextTick);
        delete this.nextTick;
    }
}