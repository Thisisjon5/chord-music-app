// Chord definitions and utilities

import { NoteName, NOTE_NAMES, transposeNote } from './utils';

export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented' | 'sus2' | 'sus4' | 'major7' | 'minor7' | 'dominant7';

export type Inversion = 0 | 1 | 2 | 3; // root position, 1st, 2nd, 3rd inversion

export interface Chord {
  root: NoteName;
  quality: ChordQuality;
  inversion: Inversion;
}

// Intervals in semitones from root for each chord quality
export const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
};

// Get the notes of a chord (without specific octave)
export function getChordNotes(chord: Chord): NoteName[] {
  const intervals = CHORD_INTERVALS[chord.quality];
  return intervals.map(interval => transposeNote(chord.root, interval));
}

// Get chord notes with specific octave and inversion applied
export function getChordNotesWithOctave(chord: Chord, baseOctave: number): { note: NoteName; octave: number }[] {
  const notes = getChordNotes(chord);
  const intervals = CHORD_INTERVALS[chord.quality];

  // Create array of notes with octaves
  let notesWithOctave = notes.map((note, i) => {
    const interval = intervals[i];
    const octave = baseOctave + Math.floor(interval / 12);
    return { note, octave };
  });

  // Apply inversion by moving notes up an octave
  for (let i = 0; i < chord.inversion; i++) {
    notesWithOctave[i].octave += 1;
  }

  // Sort by pitch
  notesWithOctave.sort((a, b) => {
    const pitchA = a.octave * 12 + NOTE_NAMES.indexOf(a.note);
    const pitchB = b.octave * 12 + NOTE_NAMES.indexOf(b.note);
    return pitchA - pitchB;
  });

  return notesWithOctave;
}

// Transpose a chord by semitones
export function transposeChord(chord: Chord, semitones: number): Chord {
  return {
    ...chord,
    root: transposeNote(chord.root, semitones),
  };
}

// Get chord symbol/name
export function getChordSymbol(chord: Chord): string {
  const qualitySymbols: Record<ChordQuality, string> = {
    major: '',
    minor: 'm',
    diminished: 'dim',
    augmented: 'aug',
    sus2: 'sus2',
    sus4: 'sus4',
    major7: 'maj7',
    minor7: 'm7',
    dominant7: '7',
  };

  const inversionSymbols = ['', '¹', '²', '³'];

  return `${chord.root}${qualitySymbols[chord.quality]}${inversionSymbols[chord.inversion]}`;
}
