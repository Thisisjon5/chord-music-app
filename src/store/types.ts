// Type definitions for app state

import { Chord } from '../music/chords';
import { Scale } from '../music/scales';
import { ChordWithDuration } from '../audio/loopController';

export interface AppState {
  // Composition layer
  progression: ChordWithDuration[];
  scale: Scale;
  selectedChordIndex: number | null;

  // Playback state
  isPlaying: boolean;
  currentChordIndex: number;
  bpm: number;

  // Performance layer
  transpose: number;
  performanceMode: boolean;

  // Theme
  darkMode: boolean;
}

export interface AppActions {
  // Composition actions
  setProgression: (progression: ChordWithDuration[]) => void;
  updateChord: (index: number, chord: Chord) => void;
  updateChordDuration: (index: number, duration: number) => void;
  addChord: (afterIndex: number) => void;
  removeChord: (index: number) => void;
  setScale: (scale: Scale) => void;
  setSelectedChordIndex: (index: number | null) => void;

  // Playback actions
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
  setBpm: (bpm: number) => void;

  // Performance actions
  setTranspose: (semitones: number) => void;
  transposeUp: () => void;
  transposeDown: () => void;
  triggerChord: (chord: Chord) => void;
  setPerformanceMode: (enabled: boolean) => void;

  // Theme actions
  toggleDarkMode: () => void;
}

export type AppContextType = AppState & AppActions;
