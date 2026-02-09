// Type definitions for app state

import { Chord, ChordQuality } from '../music/chords';
import { Scale } from '../music/scales';
import { ChordWithDuration } from '../audio/loopController';

// Recording types
export interface RecordedChordEvent {
  chord: Chord;
  timestamp: number; // milliseconds since recording started
}

/**
 * Detects BPM from an array of recorded chord events.
 * Analyzes inter-chord intervals and returns the detected BPM.
 * Handles variable timing gracefully by using median interval.
 * Returns null if insufficient data to detect BPM (needs at least 2 chords).
 */
export function detectBpm(events: RecordedChordEvent[]): number | null {
  if (events.length < 2) {
    return null;
  }

  // Calculate intervals between consecutive chords
  const intervals: number[] = [];
  for (let i = 1; i < events.length; i++) {
    const interval = events[i].timestamp - events[i - 1].timestamp;
    // Filter out unreasonably short intervals (< 100ms) or long pauses (> 4 seconds)
    if (interval >= 100 && interval <= 4000) {
      intervals.push(interval);
    }
  }

  if (intervals.length === 0) {
    return null;
  }

  // Use median interval to handle variable timing gracefully
  const sortedIntervals = [...intervals].sort((a, b) => a - b);
  const medianIndex = Math.floor(sortedIntervals.length / 2);
  const medianInterval = sortedIntervals.length % 2 === 0
    ? (sortedIntervals[medianIndex - 1] + sortedIntervals[medianIndex]) / 2
    : sortedIntervals[medianIndex];

  // Convert interval (ms per beat) to BPM
  // Assuming each chord represents one beat
  const bpm = Math.round(60000 / medianInterval);

  // Clamp to reasonable BPM range (30-300)
  return Math.max(30, Math.min(300, bpm));
}

export interface AppState {
  // Composition layer
  progression: ChordWithDuration[];
  scale: Scale;
  selectedChordIndex: number | null;

  // Playback state
  isPlaying: boolean;
  currentChordIndex: number;
  currentPlayingChordIndex: number; // Alias for currentChordIndex, used by VoicingWheel
  bpm: number;

  // Performance layer
  transpose: number;
  performanceMode: boolean;

  // Recording state
  isRecording: boolean;
  recordedChords: RecordedChordEvent[];
  recordedBpm: number | null;

  // Recorded loop playback state
  isPlayingRecordedLoop: boolean;
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

  // Voicing wheel actions
  previewChordQuality: (quality: ChordQuality) => void;
  clearPreviewQuality: () => void;

  // Recording actions
  startRecording: () => void;
  stopRecording: () => void;
  clearRecording: () => void;

  // Recorded loop playback actions
  startRecordedLoop: () => void;
  stopRecordedLoop: () => void;
}

export type AppContextType = AppState & AppActions;
