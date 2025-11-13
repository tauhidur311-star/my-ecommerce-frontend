import { Howl } from 'howler';

/**
 * Sound Manager for handling audio effects across the application
 * Provides centralized sound control with user preferences
 */
class SoundManager {
  constructor() {
    this.enabled = true;
    this.volume = 0.3;
    this.sounds = {};
    
    // Load sound preferences from localStorage
    this.loadSettings();
    
    // Initialize sound effects
    this.initializeSounds();
  }

  /**
   * Initialize all sound effects
   * Use public domain or royalty-free sounds in production
   */
  initializeSounds() {
    // Note: These are placeholder sound URLs
    // Replace with actual sound files in your public/sounds directory
    this.sounds = {
      click: new Howl({
        src: ['/sounds/click.mp3', '/sounds/click.wav'],
        volume: this.volume,
        preload: true,
        onloaderror: () => {
          console.warn('Failed to load click sound');
        }
      }),
      
      hover: new Howl({
        src: ['/sounds/hover.mp3', '/sounds/hover.wav'],
        volume: this.volume * 0.5, // Quieter for hover
        preload: true,
        onloaderror: () => {
          console.warn('Failed to load hover sound');
        }
      }),
      
      success: new Howl({
        src: ['/sounds/success.mp3', '/sounds/success.wav'],
        volume: this.volume,
        preload: true,
        onloaderror: () => {
          console.warn('Failed to load success sound');
        }
      }),
      
      notification: new Howl({
        src: ['/sounds/notification.mp3', '/sounds/notification.wav'],
        volume: this.volume,
        preload: true,
        onloaderror: () => {
          console.warn('Failed to load notification sound');
        }
      }),
      
      error: new Howl({
        src: ['/sounds/error.mp3', '/sounds/error.wav'],
        volume: this.volume,
        preload: true,
        onloaderror: () => {
          console.warn('Failed to load error sound');
        }
      }),
      
      swipe: new Howl({
        src: ['/sounds/swipe.mp3', '/sounds/swipe.wav'],
        volume: this.volume * 0.7,
        preload: true,
        onloaderror: () => {
          console.warn('Failed to load swipe sound');
        }
      })
    };
  }

  /**
   * Load sound settings from localStorage
   */
  loadSettings() {
    try {
      const settings = localStorage.getItem('soundSettings');
      if (settings) {
        const { enabled, volume } = JSON.parse(settings);
        this.enabled = enabled !== undefined ? enabled : true;
        this.volume = volume !== undefined ? volume : 0.3;
      }
    } catch (error) {
      console.error('Error loading sound settings:', error);
    }
  }

  /**
   * Save sound settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem('soundSettings', JSON.stringify({
        enabled: this.enabled,
        volume: this.volume
      }));
    } catch (error) {
      console.error('Error saving sound settings:', error);
    }
  }

  /**
   * Play a specific sound effect
   * @param {string} soundName - Name of the sound to play
   * @param {number} volumeOverride - Optional volume override (0-1)
   */
  play(soundName, volumeOverride = null) {
    if (!this.enabled) return;
    
    const sound = this.sounds[soundName];
    if (!sound) {
      console.warn(`Sound '${soundName}' not found`);
      return;
    }

    try {
      // Set volume if override provided
      if (volumeOverride !== null) {
        sound.volume(volumeOverride);
      }
      
      sound.play();
    } catch (error) {
      console.error(`Error playing sound '${soundName}':`, error);
    }
  }

  /**
   * Enable or disable all sounds
   * @param {boolean} enabled - Whether to enable sounds
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    this.saveSettings();
  }

  /**
   * Set global volume for all sounds
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Update volume for all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume(this.volume);
    });
    
    this.saveSettings();
  }

  /**
   * Get current settings
   */
  getSettings() {
    return {
      enabled: this.enabled,
      volume: this.volume
    };
  }

  /**
   * Stop all currently playing sounds
   */
  stopAll() {
    Object.values(this.sounds).forEach(sound => {
      sound.stop();
    });
  }

  /**
   * Preload all sounds (call this on app initialization)
   */
  preloadAll() {
    Object.values(this.sounds).forEach(sound => {
      sound.load();
    });
  }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;

// Convenience functions for common use cases
export const playClick = () => soundManager.play('click');
export const playHover = () => soundManager.play('hover');
export const playSuccess = () => soundManager.play('success');
export const playNotification = () => soundManager.play('notification');
export const playError = () => soundManager.play('error');
export const playSwipe = () => soundManager.play('swipe');