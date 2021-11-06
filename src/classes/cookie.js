export default function(namespace = 'custom') {
    namespace += '__';
    
    return new Proxy({}, {
        get({}, name) {
            return document.cookie
                    .split(/ *; */)
                    .filter((cookie) => cookie.startsWith(namespace + name))
                    .map((cookie) => cookie.match(namespace + name + '=(.+)')[1])
                    .map((value) => JSON.parse(value))[0];
        },
        
        set({}, name, value) {
            const json = JSON.stringify(value, (key, value) => (value instanceof Set) ? [...value] : value);
            const days = (typeof value === 'undefined') ? -1 : 365;
            document.cookie = namespace + name + '=' + json + '; SameSite=Strict; path=/; secure; Max-Age=' + (days * 24 * 60 * 60);
            
            return true;
        }
    });
}