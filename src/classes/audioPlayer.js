export default class AudioPlayer {
    directory;
    clips;
    muted;
    
    constructor(bin) {
        this.clips = {};
        this.muted = true;
        this.directory = `/resources/audio/${bin}/`;
        
        let music = this.clip('main');
        music.volume = 0.1;
        music.loop = true;
    }
    
    toggleAudio() {
        this.muted = !this.muted;
        Object.values(this.clips).forEach((clip) => clip.muted = this.muted);
        
        if(!this.muted) {
            this.play();
        }
    }
    
    play(name = 'main') {
        this.clip(name).play();
    }
    
    stop(name = 'main') {
        this.clip(name).pause();
    }
    
    speed(speed, name = 'main') {
        this.clip(name).playbackRate = speed;
    }
    
    clip(name) {
        if(!this.clips[name]) {
            this.clips[name] = new AudioClip(this.directory + name + '.wav');
            this.clips[name].muted = this.muted;
        }
        
        return this.clips[name];
    }
}

class AudioClip extends Audio {
    constructor(src, volume = 0.5) {
        super(src);
        this.volume = volume;
    }
    
    play() {
        if(this.muted) return;
        this.currentTime = 0;
        return super.play();
    }
}