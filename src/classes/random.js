export default class Random {
    number(end, start = 0) {
        return Math.random() * (end - start + 1) + start | 0;
    }
}