// Loop controller - manages chord progression playback

import { playChord, stopChord, DEFAULT_ENVELOPE } from './synthesizer';
import { voiceChord, VoicedChord, clearVoicingCache } from './voiceLeading';
import { Chord, ChordQuality } from '../music/chords';

export interface ChordWithDuration {
  chord: Chord;
  duration: number; // beats
}

export type PlaybackCallback = (index: number, chord: ChordWithDuration) => void;

export class LoopController {
  private progression: ChordWithDuration[] = [];
  private isPlaying = false;
  private currentIndex = 0;
  private timeoutId: number | null = null;
  private currentVoicing: VoicedChord | null = null;
  private transpose = 0;
  private bpm = 120;
  private onPlaybackChange: PlaybackCallback | null = null;
  private previewQuality: ChordQuality | null = null;

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

  // Set BPM
  setBpm(bpm: number): void {
    this.bpm = bpm;
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

    // Clear preview quality when a new chord starts
    this.previewQuality = null;

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
    // Convert beats to milliseconds: (beats * 60 / bpm) * 1000
    const durationInMs = (chordWithDuration.duration * 60 / this.bpm) * 1000;
    this.timeoutId = window.setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.progression.length;
      this.playCurrentChord();
    }, durationInMs);
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

  // Set preview quality for live morphing (non-destructive)
  setPreviewQuality(quality: ChordQuality | null): void {
    this.previewQuality = quality;
  }

  // Get current preview quality
  getPreviewQuality(): ChordQuality | null {
    return this.previewQuality;
  }

  // Clear preview quality
  clearPreviewQuality(): void {
    this.previewQuality = null;
  }

  // Preview the current chord with a different quality (for voicing wheel)
  // This plays the chord immediately with the preview quality without affecting timing
  previewCurrentChordWithQuality(quality: ChordQuality): void {
    if (!this.isPlaying || this.progression.length === 0) return;

    const chordWithDuration = this.progression[this.currentIndex];

    // Create a temporary chord with the preview quality
    const previewChord: Chord = {
      ...chordWithDuration.chord,
      quality: quality,
    };

    // Voice the preview chord
    const voicing = voiceChord(previewChord, this.currentVoicing, this.transpose);

    // Stop previous chord
    if (this.currentVoicing) {
      stopChord(this.currentVoicing.frequencies);
    }

    // Play preview chord
    playChord(voicing.frequencies, DEFAULT_ENVELOPE);
    this.currentVoicing = voicing;

    // Store preview quality
    this.previewQuality = quality;
  }

  // Get the current chord being played (with optional preview quality applied)
  getCurrentChord(): Chord | null {
    if (this.progression.length === 0) return null;

    const chord = this.progression[this.currentIndex]?.chord;
    if (!chord) return null;

    // If preview quality is set, return chord with preview quality
    if (this.previewQuality) {
      return {
        ...chord,
        quality: this.previewQuality,
      };
    }

    return chord;
  }

  // Get the original chord (without preview) at current index
  getOriginalCurrentChord(): Chord | null {
    if (this.progression.length === 0) return null;
    return this.progression[this.currentIndex]?.chord || null;
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
