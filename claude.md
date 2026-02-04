# Chord-Music-App

## Project Overview

A HiChord-inspired chord progression web application built with React, TypeScript, and Web Audio API. This is a personal/learning project designed to be accessible to the general public, serving as a composition tool, live performance interface, and music theory learning aid.

### Purpose
- **Composition**: Create and edit chord progressions with adjustable durations, inversions, and keys
- **Performance**: Trigger chords live using an intuitive pad interface
- **Education**: Visual feedback and Roman numeral notation help users understand music theory

### Key Features
- Auto-play on page load (I-V-vi-IV progression in C major)
- Two-layer architecture: Composition Layer (editing) + Performance Layer (live triggering)
- Smart voice leading for smooth chord transitions
- Pure Web Audio API synthesis (no external audio libraries)
- Real-time transposition and live editing

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Audio**: Web Audio API (native browser synthesis)
- **State Management**: React Context API
- **Build**: Vite with TypeScript compiler

### Directory Structure
```
src/
├── audio/           # Audio engine and synthesis
│   ├── audioContext.ts    # Web Audio API setup
│   ├── synthesizer.ts     # Polyphonic synthesizer with ADSR
│   ├── voiceLeading.ts    # Smart voice leading algorithm
│   └── loopController.ts  # Chord progression playback
├── music/           # Music theory logic
│   ├── utils.ts          # Note-to-frequency, transposition
│   ├── chords.ts         # Chord definitions and operations
│   └── scales.ts         # Scale definitions, degree mappings
├── store/           # State management
│   ├── AppContext.tsx    # Global state provider
│   └── types.ts          # TypeScript interfaces
└── components/      # React UI components
    ├── App.tsx                  # Main app with auto-play
    ├── ChordDisplay.tsx         # Current chord display
    ├── TransportControls.tsx    # Play/pause, transpose
    ├── CompositionLayer.tsx     # Progression editor
    └── PerformanceLayer.tsx     # Live performance pads
```

## Core Concepts

### Audio Engine
- **Synthesizer**: Pure sine wave oscillators with ADSR envelope (Attack: 0.01s, Decay: 0.1s, Sustain: 70%, Release: 0.3s)
- **Voice Leading**: Algorithm minimizes semitone distance between chord changes by finding optimal octave positions
- **Loop Controller**: Manages playback timing and progression iteration

### State Management
Global state via React Context includes:
- `progression`: Array of chord definitions with duration, root, quality, inversion
- `scale`: Current key and scale type (major/minor)
- `isPlaying`: Transport play/pause state
- `currentChordIndex`: Currently playing chord in progression
- `transpose`: Global transpose offset in semitones

### Music Theory Implementation
- Notes represented as MIDI numbers (C4 = 60)
- Scales defined as semitone offset arrays from root
- Chords built using scale degrees, then mapped to specific qualities
- Roman numerals dynamically generated from scale position

## Working with this Codebase

### Common Tasks

**Adding New Chord Qualities**
1. Update `chordQualities` in `src/music/chords.ts` with interval pattern
2. Add TypeScript type to `ChordQuality` union in `src/store/types.ts`
3. UI will automatically reflect new option in dropdown

**Modifying Audio Synthesis**
- Edit ADSR envelope in `src/audio/synthesizer.ts` (`playNote` function)
- Change waveform by modifying `oscillator.type` (sine, square, sawtooth, triangle)
- Adjust master gain in `audioContext.ts`

**Updating Voice Leading Algorithm**
- Logic in `src/audio/voiceLeading.ts` (`calculateVoiceLeading` function)
- Currently tries 3 octave positions (-12, 0, +12 semitones)
- Minimize `totalDistance` to find smoothest voicing

**Adding Performance Pads**
- Pads generated from scale in `PerformanceLayer.tsx`
- Currently shows 7 scale degrees (I-VII)
- Extend by modifying scale degree range or adding custom chord mappings

### Development Workflow

```bash
# Install dependencies
npm install --include=dev

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment
- Dockerized with nginx (see `Dockerfile` and `nginx.conf`)
- Static build output in `dist/` after build
- Docker Compose config available for container deployment

## Important Notes

### Browser Autoplay
- Modern browsers block autoplay by default
- App shows "Click to Start" overlay if audio context suspended
- User interaction required to resume audio context

### Audio Context Management
- Single shared AudioContext instance (`src/audio/audioContext.ts`)
- Must be created on user interaction due to browser policies
- All audio operations use this shared context

### State Updates and Audio
- Progression changes immediately affect playback
- Voice leading recalculated on every chord change
- Performance layer bypasses progression, triggers chords directly

## Patterns and Conventions

### TypeScript
- Strict mode enabled
- All state types defined in `src/store/types.ts`
- No `any` types used in codebase

### React Patterns
- Functional components with hooks throughout
- Context API for global state (no external state library)
- Minimal prop drilling - state accessed via `useAppContext` hook

### Audio Timing
- All durations in seconds (not milliseconds)
- Timing handled by `setTimeout` in loop controller
- Future: Consider using Web Audio API scheduling for tighter timing

## Future Enhancement Ideas
- Additional chord types (9ths, 11ths, 13ths, altered dominants)
- Multiple instrument/synth presets (saw, square, filtered sounds)
- Persistence (localStorage or JSON import/export)
- Audio effects chain (reverb, delay, EQ)
- Swing and groove timing options
- Mobile-optimized touch interface
- MIDI input/output support
- Multi-track progression support

## Troubleshooting

**No sound on load**
- Check browser console for AudioContext errors
- Ensure user clicks "Click to Start" overlay
- Verify browser supports Web Audio API

**Chord changes sound abrupt**
- Increase ADSR release time in `synthesizer.ts`
- Verify voice leading algorithm running (`voiceLeading.ts`)
- Check overlap between note release and next chord attack

**Performance issues**
- Web Audio API is generally performant
- If issues arise, check for oscillator cleanup (`.stop()` and `.disconnect()`)
- Consider limiting polyphony or using AudioWorklet for more complex synthesis

## Questions to Ask User

When working on this project, useful questions to ask:
- "What is the intended chord progression style or genre?"
- "Should voice leading be strict (classical) or more flexible (jazz)?"
- "What's the target chord playback latency/timing precision?"
- "Should the app support saving progressions, or is it session-only?"
- "Are there specific chord voicings or inversions you prefer?"

## Related Documentation
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Music theory reference: https://www.musictheory.net/
- React Context API: https://react.dev/reference/react/useContext
