export default class KeyListener {
    actions;
    repeat;
    after;
    
    interval;
    keys = new Set();
    repeatTimeouts = {};
    
    constructor(actions = {}, repeat = 30, after = 500) {
        this.actions = actions;
        this.repeat = repeat;
        this.after = after;
    }
    
    listen() {
        document.addEventListener('keydown', this.addKey);
        document.addEventListener('keyup', this.removeKey);
    }
    
    stopListening() {
        document.removeEventListener('keydown', this.addKey);
        document.removeEventListener('keyup', this.removeKey);
        clearInterval(this.interval);
    }
    
    addKey = (evt) => {
        const { key, repeat } = evt;
        if(!repeat && this.actions[key]) {
            evt.preventDefault();
            
            clearInterval(this.interval);
            this.apply([...this.keys, key]);
            this.interval = setInterval(() => this.apply([...this.keys]), this.repeat);
            
            this.repeatTimeouts[key] = setTimeout(() => this.keys.add(key), this.after);
        }
    }
    
    removeKey = ({ key }) => {
        this.keys.delete(key);
        clearTimeout(this.repeatTimeouts[key]);
    }
    
    apply(keys) {
        keys.forEach((key) => this.actions[key]());
    }
}