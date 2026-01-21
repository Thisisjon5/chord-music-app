# 🎹 Chord Music App

A HiChord-inspired chord progression web application built with React, TypeScript, and Web Audio API.

## Features

- **Auto-play**: Default chord progression (I-V-vi-IV in C major) starts automatically on page load
- **Two-layer system**:
  - **Composition Layer**: Define and edit chord progressions, adjust durations, inversions, and scale/key settings
  - **Performance Layer**: Live chord triggering with pads, real-time transposition
- **Smart voice leading**: Smooth transitions between chords with minimal note movement
- **Web Audio API**: Native browser audio synthesis with ADSR envelope
- **Live editing**: Changes to the progression are reflected immediately in playback

## Getting Started

### Installation

```bash
# Install dependencies (use --include=dev flag)
npm install --include=dev
```

### Development

```bash
# Start development server
npm run dev
```

Open your browser to the URL shown (typically `http://localhost:5173`)

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### Composition Layer

1. **Edit Scale/Key**: Select the root note and scale type (major/minor)
2. **Edit Chords**: Click on any chord in the timeline to edit:
   - Root note
   - Quality (major, minor, diminished, augmented, sus2, sus4, dominant7, major7, minor7)
   - Inversion (root position, 1st, 2nd)
   - Duration (0.25s - 4s)
3. **Add/Remove Chords**: Use the "Add After" and "Remove" buttons
4. **Visual Feedback**: The currently playing chord is highlighted in yellow

### Performance Layer

1. **Trigger Chords**: Click on any pad to play chords from the current scale
2. **Roman Numerals**: Each pad shows the scale degree and chord symbol
3. **Real-time**: Triggered chords respect voice leading and current transpose setting

### Transport Controls

- **Play/Pause**: Start or stop the chord progression loop
- **Transpose**: Use +/- buttons to transpose the entire progression

## Architecture

### Audio Engine (`src/audio/`)
- `audioContext.ts` - Web Audio API initialization and management
- `synthesizer.ts` - Polyphonic synthesizer with ADSR envelope
- `voiceLeading.ts` - Smart voice leading algorithm
- `loopController.ts` - Chord progression playback loop

### Music Theory (`src/music/`)
- `utils.ts` - Note-to-frequency conversion, transposition utilities
- `chords.ts` - Chord definitions and operations
- `scales.ts` - Scale definitions and scale degree to chord mapping

### State Management (`src/store/`)
- `AppContext.tsx` - React Context provider for global state
- `types.ts` - TypeScript type definitions

### UI Components (`src/components/`)
- `App.tsx` - Main application component with auto-play
- `ChordDisplay.tsx` - Current chord display
- `TransportControls.tsx` - Play/pause and transpose controls
- `CompositionLayer.tsx` - Chord progression editor
- `PerformanceLayer.tsx` - Live performance interface

## Technical Details

### Voice Leading Algorithm

The app implements a voice leading algorithm that:
1. Finds the closest voicing for the next chord
2. Minimizes total semitone distance between chord changes
3. Tries multiple octave positions to find the smoothest transition
4. Supports manual inversion overrides

### Audio Synthesis

- Uses Web Audio API OscillatorNode with sine wave
- ADSR envelope for natural sound:
  - Attack: 0.01s
  - Decay: 0.1s
  - Sustain: 70%
  - Release: 0.3s
- Polyphonic playback support
- Master gain control for volume

### Browser Compatibility

The app works in all modern browsers that support:
- Web Audio API
- ES2020 JavaScript features
- React 18

Note: Browsers may block autoplay. If so, click the "Click to Start" overlay to resume audio.

## Default Progression

The app starts with the popular I-V-vi-IV progression in C major:
- I (C major)
- V (G major)
- vi (A minor)
- IV (F major)

Each chord plays for 1 second by default.

## Keyboard Shortcuts

- `Space` - Play/pause (can be enabled in App.tsx)

## Future Enhancements

- Additional chord types (9ths, 11ths, 13ths)
- More instrument/synth presets
- Save/load progressions (localStorage or JSON export)
- Audio effects (reverb, delay)
- Swing/groove timing options
- Mobile-responsive touch interface
- MIDI input/output support

## License

MIT
