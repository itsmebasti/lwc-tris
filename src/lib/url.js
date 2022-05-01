export default new Proxy(new URL(window.location.href).searchParams, {
    get(url, name) {
        return url.get(name) || undefined;
    }
});