// Music theory utilities: note-to-frequency conversion and helper functions

export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export const NOTE_NAMES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Convert note name and octave to MIDI number
export function noteToMidi(note: NoteName, octave: number): number {
  const noteIndex = NOTE_NAMES.indexOf(note);
  return (octave + 1) * 12 + noteIndex;
}

// Convert MIDI number to frequency (A4 = 440Hz)
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Convert note name and octave to frequency
export function noteToFrequency(note: NoteName, octave: number): number {
  return midiToFrequency(noteToMidi(note, octave));
}

// Transpose a note by semitones
export function transposeNote(note: NoteName, semitones: number): NoteName {
  const index = NOTE_NAMES.indexOf(note);
  const newIndex = (index + semitones + 12) % 12;
  return NOTE_NAMES[newIndex];
}

// Get the note name from MIDI number
export function midiToNoteName(midi: number): NoteName {
  const noteIndex = midi % 12;
  return NOTE_NAMES[noteIndex];
}

// Get octave from MIDI number
export function midiToOctave(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

// Calculate interval in semitones between two notes
export function intervalBetween(note1: NoteName, note2: NoteName): number {
  const index1 = NOTE_NAMES.indexOf(note1);
  const index2 = NOTE_NAMES.indexOf(note2);
  return (index2 - index1 + 12) % 12;
}
