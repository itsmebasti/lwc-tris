export class AudioClip extends Audio {
    
    constructor(src, volume) {
        super(src);
        this.volume = volume;
    }
    
    play() {
        this.currentTime = 0;
        super.play().then(() => this.currentTime = 0);
    }
}