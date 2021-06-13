export default class Publisher {
    handlers;
    
    constructor(...events) {
        this.handlers = {};
    
        events.forEach((evt) => {
            this.handlers[evt] = {handlers: []}
        });
    }
    
    once(evt) {
        this.get(evt).promise = this.get(evt).promise || new Promise((resolve) =>
            this.get(evt).resolve = resolve
        );
        
        return this.get(evt).promise;
    }
    
    on(evt, handler) {
        return this.get(evt).handlers.push(handler);
    }
    
    publish(evt, ...details) {
        if(this.get(evt).promise) {
            delete this.get(evt).promise
            return this.get(evt).resolve(...details);
        }
        
        this.get(evt).handlers.forEach((handler) => handler(...details));
    }
    
    get(evt) {
        if(!this.handlers[evt]) {
            throw Error(this.constructor.name + ' does not support on-' + evt + ' events');
        }
        
        return this.handlers[evt];
    }
}