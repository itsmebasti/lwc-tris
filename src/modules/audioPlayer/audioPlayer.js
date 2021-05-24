import { AudioClip } from '../arcade/tetris/model/audioClip';

const AUDIO_FILES_PATH = '/resources/audio/';
const FILE_SUFFIX = '.wav';

export default class AudioPlayer {
    
    audioFiles;
    muted;
    main;
    
    constructor(main) {
        this.audioFiles = {};
        this.muted = false;
        this.main = main;
        let music = this.obtainAudioClip(main);
        music.volume = 0.35;
        music.loop = true;
    }
    
    playMusic() {
        let music = this.obtainAudioClip(this.main);
        music.play();
    }
    
    pauseMusic() {
        let music = this.obtainAudioClip(this.main);
        music.pause();
    }
    
    stopMusic() {
        let music = this.obtainAudioClip(this.main);
        music.pause();
        music.currentTime = 0;
    }
    
    increaseMusicSpeed() {
        let music = this.obtainAudioClip(this.main);
        if(music.playbackRate < 1.5) {
            music.playbackRate += 0.005;
        }
    }
    
    playSoundClip(name) {
        let clip = this.obtainAudioClip(name);
        clip.currentTime = 0;
        clip.play();
    }
    
    obtainAudioClip(name) {
        if(this.audioFiles[name] === undefined) {
            const path = AUDIO_FILES_PATH + name + FILE_SUFFIX;
            console.log(path);
            this.audioFiles[name] = new AudioClip(path, 1.0);
            this.audioFiles[name].muted = this.muted;
        }
        return this.audioFiles[name];
    }
    
    toggleAudio() {
        this.muted = !this.muted;
        
        let music = this.obtainAudioClip(this.main);
        music.muted = this.muted;

        let keys = Object.keys(this.audioFiles);
        keys.forEach(key => this.audioFiles[key].muted = this.muted);
    }
}