# Sound Files Directory

This directory contains audio files for the enhanced UX sound effects.

## Required Sound Files:

Add these audio files to provide interactive sound feedback:

- **`click.mp3`** - Button click sound (100-200ms)
- **`hover.mp3`** - Hover effect sound (50-100ms)  
- **`success.mp3`** - Success notification sound (200-400ms)
- **`notification.mp3`** - General notification sound (150-300ms)
- **`error.mp3`** - Error alert sound (200-400ms)
- **`swipe.mp3`** - Swipe gesture sound (100-200ms)

## Sound File Guidelines:

### Format Requirements:
- **Primary format**: MP3 (widely supported)
- **Fallback format**: WAV (for better compatibility)
- **Sample rate**: 44.1kHz recommended
- **Bit rate**: 128kbps or higher for MP3

### File Size Optimization:
- Keep files under 50KB each for fast loading
- Use short duration clips (50-400ms)
- Optimize for web delivery

### Volume Levels:
- Normalize all files to similar volume levels
- Use subtle, non-intrusive sounds
- Test on different devices and headphones

### Accessibility:
- Sounds should enhance, not replace visual feedback
- All sounds can be disabled by user preference
- Respect system-level sound settings

## Free Sound Resources:

You can find royalty-free sounds at:
- **Freesound.org** - Creative Commons licensed sounds
- **Zapsplat** - Free with registration
- **Adobe Audition** - Built-in sound effects library
- **GarageBand** (Mac) - Built-in sound effects

## Custom Sound Creation:

For best results, consider creating custom sounds:
- Use audio editing software (Audacity, Adobe Audition)
- Keep sounds subtle and professional
- Match the brand personality
- Test across different devices

## Implementation:

The sound manager will automatically load these files on app initialization. Ensure all files are present for the best user experience, though the app will function without them (with console warnings for missing files).

Example file structure:
```
frontend/public/sounds/
├── click.mp3
├── click.wav (fallback)
├── hover.mp3
├── hover.wav (fallback)
├── success.mp3
├── success.wav (fallback)
├── notification.mp3
├── notification.wav (fallback)
├── error.mp3
├── error.wav (fallback)
├── swipe.mp3
├── swipe.wav (fallback)
└── README.md (this file)
```