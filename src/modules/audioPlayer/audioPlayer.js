export const SOUNDS = { ROW_CLEAR: 0, GAME_OVER: 1, ROTATE: 2 };

export default class AudioPlayer {
    
    touchDownSound = new Audio("resources/audio/touch-down.wav");
    gameOverSound = new Audio("resources/audio/game-over.wav");
    rotateSound = new Audio("resources/audio/rotate.wav");
    tetrisMusic = new Audio("resources/audio/tetris.wav");
    
    soundFxClips = [this.touchDownSound, this.gameOverSound, this.rotateSound ]
    musicClips = [this.tetrisMusic ]
    
    constructor() {
        this.tetrisMusic.loop = true;
        this.tetrisMusic.volume = 0.3;
        this.touchDownSound.volume = 0.7;
    }
    
    playMusic() {
        if (this.tetrisMusic.paused) {
            this.tetrisMusic.play();
        }
    }
    
    pauseMusic() {
        if (!this.tetrisMusic.paused) {
            this.tetrisMusic.pause();
        }
    }
    
    stopMusic() {
        if (!this.tetrisMusic.paused) {
            this.tetrisMusic.pause();
        }
        this.tetrisMusic.currentTime = 0;
    }
    
    playSoundClip(sound) {
        var audio = this.soundFxClips[sound];
        audio.currentTime = 0;
        audio.play();
    }
    
    toggleAudio() {
        this.soundFxClips.forEach(audio => audio.muted = !audio.muted);
        this.musicClips.forEach(audio => audio.muted = !audio.muted);
    }
    
    increaseMusicSpeed() {
        if (this.tetrisMusic.playbackRate < 1.5) {
            this.tetrisMusic.playbackRate += 0.005;
        }
    }
}