// Recorded loop controller - manages playback of recorded chord loops
// Separate from LoopController, uses detected BPM and ignores transpose

import { playChord, stopChord, DEFAULT_ENVELOPE } from './synthesizer';
import { voiceChord, VoicedChord, clearVoicingCache } from './voiceLeading';
import { RecordedChordEvent } from '../store/types';

export type RecordedPlaybackCallback = (index: number, chord: RecordedChordEvent) => void;

export class RecordedLoopController {
  private recordedChords: RecordedChordEvent[] = [];
  private detectedBpm: number = 120;
  private isPlaying = false;
  private currentIndex = 0;
  private timeoutId: number | null = null;
  private currentVoicing: VoicedChord | null = null;
  private onPlaybackChange: RecordedPlaybackCallback | null = null;

  constructor() {}

  /**
   * Set the recorded chords and detected BPM for playback.
   * BPM is fixed at initialization and cannot be overridden by app settings.
   */
  setRecording(chords: RecordedChordEvent[], bpm: number): void {
    this.recordedChords = chords;
    this.detectedBpm = bpm;
    clearVoicingCache();
  }

  /**
   * Set playback callback for UI updates
   */
  setPlaybackCallback(callback: RecordedPlaybackCallback): void {
    this.onPlaybackChange = callback;
  }

  /**
   * Start the recorded loop playback
   */
  start(): void {
    if (this.isPlaying || this.recordedChords.length === 0) return;

    this.isPlaying = true;
    this.currentIndex = 0;
    this.playCurrentChord();
  }

  /**
   * Stop the recorded loop playback
   */
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

  /**
   * Play the current chord in the recorded sequence.
   * Uses detected BPM and does NOT apply transpose.
   */
  private playCurrentChord(): void {
    if (!this.isPlaying || this.recordedChords.length === 0) return;

    const chordEvent = this.recordedChords[this.currentIndex];

    // Voice the chord WITHOUT transpose (passing 0 for transpose)
    const voicing = voiceChord(
      chordEvent.chord,
      this.currentVoicing,
      0 // No transpose for recorded loops
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
      this.onPlaybackChange(this.currentIndex, chordEvent);
    }

    // Calculate duration to next chord
    const durationInMs = this.calculateDurationToNextChord();

    // Schedule next chord
    this.timeoutId = window.setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.recordedChords.length;
      this.playCurrentChord();
    }, durationInMs);
  }

  /**
   * Calculate duration to the next chord based on recorded timestamps.
   * For the last chord, uses the detected BPM to estimate duration.
   */
  private calculateDurationToNextChord(): number {
    const currentEvent = this.recordedChords[this.currentIndex];
    const nextIndex = (this.currentIndex + 1) % this.recordedChords.length;
    const nextEvent = this.recordedChords[nextIndex];

    if (nextIndex > this.currentIndex) {
      // Normal case: next chord is after current
      return nextEvent.timestamp - currentEvent.timestamp;
    } else {
      // Wrap-around case: calculate duration based on detected BPM
      // Assume one beat per chord
      return 60000 / this.detectedBpm;
    }
  }

  /**
   * Get current playback state
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      currentIndex: this.currentIndex,
      bpm: this.detectedBpm,
      chordCount: this.recordedChords.length,
    };
  }

  /**
   * Check if the controller has a valid recording to play
   */
  hasRecording(): boolean {
    return this.recordedChords.length > 0;
  }

  /**
   * Get the detected BPM (read-only, cannot be overridden)
   */
  getBpm(): number {
    return this.detectedBpm;
  }
}
