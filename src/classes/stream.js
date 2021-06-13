export default class Stream {
    buffer;
    bufferSize;
    queryDataHook;
    
    constructor(bufferSize = 0, values = []) {
        this.bufferSize = bufferSize;
        this.buffer = values;
    }
    
    write(...data) {
        this.buffer.push(...data);
    }
    
    view(position = 0) {
        return this.buffer[position];
    }
    
    read() {
        if(this.buffer.length === 0) {
            throw new Error('Buffer underflow');
        }
        
        if(this.buffer.length === this.bufferSize && this.queryDataHook) {
            // Note: run async to not slow down the application
            setTimeout(this.queryDataHook, 0);
        }
        
        return this.buffer.shift();
    }
}