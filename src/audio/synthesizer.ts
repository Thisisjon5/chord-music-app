// Web Audio API synthesizer with ADSR envelope

import { getAudioContext, getMasterGain } from './audioContext';

export interface ADSREnvelope {
  attack: number;  // seconds
  decay: number;   // seconds
  sustain: number; // gain level (0-1)
  release: number; // seconds
}

// Default ADSR envelope for piano-like sound
export const DEFAULT_ENVELOPE: ADSREnvelope = {
  attack: 0.01,
  decay: 0.1,
  sustain: 0.7,
  release: 0.3,
};

export interface Voice {
  oscillator: OscillatorNode;
  gainNode: GainNode;
  frequency: number;
}

// Active voices for polyphonic playback
const activeVoices = new Map<string, Voice>();

// Create a voice key for tracking
function getVoiceKey(frequency: number): string {
  return frequency.toFixed(2);
}

// Play a note with ADSR envelope
export function playNote(frequency: number, envelope: ADSREnvelope = DEFAULT_ENVELOPE): void {
  const key = getVoiceKey(frequency);

  // Stop existing voice at this frequency if any
  stopNote(frequency);

  const context = getAudioContext();
  const masterGain = getMasterGain();
  const now = context.currentTime;

  // Create oscillator
  const oscillator = context.createOscillator();
  oscillator.type = 'sine'; // Simple sine wave for now
  oscillator.frequency.value = frequency;

  // Create gain node for ADSR envelope
  const gainNode = context.createGain();
  gainNode.gain.value = 0;

  // Connect: oscillator -> gain -> master -> destination
  oscillator.connect(gainNode);
  gainNode.connect(masterGain);

  // Apply ADSR envelope
  const { attack, decay, sustain } = envelope;
  const peakGain = 0.3; // Peak gain during attack

  // Attack
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(peakGain, now + attack);

  // Decay to sustain level
  gainNode.gain.linearRampToValueAtTime(peakGain * sustain, now + attack + decay);

  // Start oscillator
  oscillator.start(now);

  // Store voice
  activeVoices.set(key, { oscillator, gainNode, frequency });
}

// Stop a note with release envelope
export function stopNote(frequency: number, envelope: ADSREnvelope = DEFAULT_ENVELOPE): void {
  const key = getVoiceKey(frequency);
  const voice = activeVoices.get(key);

  if (!voice) return;

  const context = getAudioContext();
  const now = context.currentTime;
  const { release } = envelope;

  // Apply release envelope
  voice.gainNode.gain.cancelScheduledValues(now);
  voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now);
  voice.gainNode.gain.linearRampToValueAtTime(0, now + release);

  // Stop oscillator after release
  voice.oscillator.stop(now + release);

  // Clean up
  activeVoices.delete(key);
}

// Play multiple notes (chord)
export function playChord(frequencies: number[], envelope: ADSREnvelope = DEFAULT_ENVELOPE): void {
  frequencies.forEach(freq => playNote(freq, envelope));
}

// Stop multiple notes (chord)
export function stopChord(frequencies: number[], envelope: ADSREnvelope = DEFAULT_ENVELOPE): void {
  frequencies.forEach(freq => stopNote(freq, envelope));
}

// Stop all active notes
export function stopAllNotes(envelope: ADSREnvelope = DEFAULT_ENVELOPE): void {
  const frequencies = Array.from(activeVoices.values()).map(v => v.frequency);
  frequencies.forEach(freq => stopNote(freq, envelope));
}
