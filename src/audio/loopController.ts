// Loop controller - manages chord progression playback

import { playChord, stopChord, DEFAULT_ENVELOPE } from './synthesizer';
import { voiceChord, VoicedChord, clearVoicingCache } from './voiceLeading';
import { Chord } from '../music/chords';

export interface ChordWithDuration {
  chord: Chord;
  duration: number; // seconds
}

export type PlaybackCallback = (index: number, chord: ChordWithDuration) => void;

export class LoopController {
  private progression: ChordWithDuration[] = [];
  private isPlaying = false;
  private currentIndex = 0;
  private timeoutId: number | null = null;
  private currentVoicing: VoicedChord | null = null;
  private transpose = 0;
  private onPlaybackChange: PlaybackCallback | null = null;

  constructor() {}

  // Set the chord progression
  setProgression(progression: ChordWithDuration[]): void {
    this.progression = progression;
    clearVoicingCache(); // Clear cache when progression changes
  }

  // Set transpose amount
  setTranspose(semitones: number): void {
    this.transpose = semitones;
    clearVoicingCache(); // Clear cache when transpose changes
  }

  // Set playback callback
  setPlaybackCallback(callback: PlaybackCallback): void {
    this.onPlaybackChange = callback;
  }

  // Start the loop
  start(): void {
    if (this.isPlaying || this.progression.length === 0) return;

    this.isPlaying = true;
    this.currentIndex = 0;
    this.playCurrentChord();
  }

  // Stop the loop
  stop(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Stop current chord
    if (this.currentVoicing) {
      stopChord(this.currentVoicing.frequencies);
      this.currentVoicing = null;
    }
  }

  // Play the current chord in the progression
  private playCurrentChord(): void {
    if (!this.isPlaying || this.progression.length === 0) return;

    const chordWithDuration = this.progression[this.currentIndex];

    // Voice the chord with smooth voice leading
    const voicing = voiceChord(
      chordWithDuration.chord,
      this.currentVoicing,
      this.transpose
    );

    // Stop previous chord
    if (this.currentVoicing) {
      stopChord(this.currentVoicing.frequencies);
    }

    // Play new chord
    playChord(voicing.frequencies, DEFAULT_ENVELOPE);
    this.currentVoicing = voicing;

    // Notify callback
    if (this.onPlaybackChange) {
      this.onPlaybackChange(this.currentIndex, chordWithDuration);
    }

    // Schedule next chord
    const duration = chordWithDuration.duration * 1000; // Convert to ms
    this.timeoutId = window.setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.progression.length;
      this.playCurrentChord();
    }, duration);
  }

  // Get current playback state
  getState() {
    return {
      isPlaying: this.isPlaying,
      currentIndex: this.currentIndex,
      transpose: this.transpose,
    };
  }

  // Trigger a chord manually (for performance layer)
  triggerChord(chord: Chord, duration: number = 1): void {
    const voicing = voiceChord(chord, this.currentVoicing, this.transpose);

    // Stop previous chord if any
    if (this.currentVoicing) {
      stopChord(this.currentVoicing.frequencies);
    }

    // Play triggered chord
    playChord(voicing.frequencies, DEFAULT_ENVELOPE);
    this.currentVoicing = voicing;

    // Auto-release after duration
    setTimeout(() => {
      stopChord(voicing.frequencies);
    }, duration * 1000);
  }
}

// Global loop controller instance
let loopController: LoopController | null = null;

export function getLoopController(): LoopController {
  if (!loopController) {
    loopController = new LoopController();
  }
  return loopController;
}
