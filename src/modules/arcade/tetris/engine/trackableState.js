const maxSpeed = 400;
const minSpeed = 100;
const maxLevel = 15;
export default function trackableState() {
    return {
        reset() {
            this.score = 0;
            this.level = 1;
            this.lines = 0;
            this.playing = false;
            
            return this;
        },
        
        start() {
            this.playing = true;
        },
        
        stop() {
            this.playing = false;
        },
    
        apply(tetris) {
            this.lines += tetris.length;
            this.level = (1 + (this.lines / 10)) | 0;
            this.score += tetris.length * tetris.length * 100;
        },
    
        lockedBlock() {
            this.score += 100;
        },
    
        get speed() {
            const variable = maxSpeed - minSpeed;
            return (maxSpeed - variable * this.levelFactor) | 0;
        },
        
        get levelFactor() {
            return Math.min(1, (this.level-1) / maxLevel);
        }
    }.reset();
}