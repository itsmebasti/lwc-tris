export default new Proxy({}, {
    get({}, name) {
        name += '=';
        const ca = document.cookie.split(';');
        
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return JSON.parse(c.substring(name.length, c.length));
            }
        }
        
        return undefined;
    },
    
    set({}, name, value) {
        const json = JSON.stringify(value, (key, value) => (value instanceof Set) ? [...value] : value);
        
        const days = (typeof value === 'undefined') ? -1 :365;
        
        document.cookie = name + '=' + json + '; SameSite=Strict; path=/; secure; Max-Age=' + (days * 24 * 60 * 60);
        
        return true;
    }
});