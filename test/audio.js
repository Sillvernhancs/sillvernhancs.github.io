// Audio Management System
class AudioManager {
    constructor() {
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.volume = 0.5;
        this.backgroundMusic = null;
        this.musicWasPlaying = false;
        this.initAudio();
        this.setupVisibilityHandling();
    }

    initAudio() {
        // Background music
        if (AUDIO_SETTINGS.backgroundMusic) {
            this.backgroundMusic = new Audio(AUDIO_SETTINGS.backgroundMusic);
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = this.volume * 0.3;
        }
        
        // Start background music on first user interaction
        document.addEventListener('click', () => {
            if (this.musicEnabled) {
                this.playBackgroundMusic();
            }
        }, { once: true });
    }

    setupVisibilityHandling() {
        // Handle page visibility changes (tab switching, app backgrounding)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden (user switched tabs or app went to background)
                if (this.backgroundMusic && !this.backgroundMusic.paused) {
                    this.musicWasPlaying = true;
                    this.backgroundMusic.pause();
                }
            } else {
                // Page is visible again
                if (this.musicWasPlaying && this.musicEnabled && this.backgroundMusic) {
                    this.backgroundMusic.play().catch(e => console.log('Could not resume background music'));
                }
            }
        });

        // Additional handling for window focus/blur (desktop browsers)
        window.addEventListener('blur', () => {
            if (this.backgroundMusic && !this.backgroundMusic.paused) {
                this.musicWasPlaying = true;
                this.backgroundMusic.pause();
            }
        });

        window.addEventListener('focus', () => {
            if (this.musicWasPlaying && this.musicEnabled && this.backgroundMusic) {
                this.backgroundMusic.play().catch(e => console.log('Could not resume background music'));
            }
        });
    }

    playAudio(filename, volume = 1.0) {
        if (!this.sfxEnabled || !filename) return;
        
        // Create new audio instance for stacking
        const audio = new Audio(filename);
        audio.volume = this.volume * volume;
        audio.play().catch(e => console.log('Could not play audio:', filename));
        
        return audio;
    }

    playBackgroundMusic() {
        if (!this.musicEnabled || !this.backgroundMusic) return;
        
        this.musicWasPlaying = true;
        this.backgroundMusic.currentTime = 0;
        this.backgroundMusic.play().catch(e => console.log('Could not play background music'));
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.musicWasPlaying = false;
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }

    play(soundName) {
        const filename = AUDIO_SETTINGS[soundName];
        if (filename) {
            this.playAudio(filename);
        }
    }

    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        if (!enabled && this.backgroundMusic) {
            this.stopBackgroundMusic();
        } else if (enabled) {
            this.playBackgroundMusic();
        }
    }

    setSFXEnabled(enabled) {
        this.sfxEnabled = enabled;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.volume * 0.3;
        }
    }
}

// Initialize audio manager
let audioManager;
document.addEventListener('DOMContentLoaded', () => {
    audioManager = new AudioManager();
});