// Scale definitions and utilities

import { NoteName, transposeNote } from './utils';
import { Chord, ChordQuality } from './chords';

export type ScaleType = 'major' | 'minor';

export interface Scale {
  root: NoteName;
  type: ScaleType;
}

// Scale intervals in semitones from root
export const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11], // W-W-H-W-W-W-H
  minor: [0, 2, 3, 5, 7, 8, 10], // W-H-W-W-H-W-W (natural minor)
};

// Get scale notes
export function getScaleNotes(scale: Scale): NoteName[] {
  const intervals = SCALE_INTERVALS[scale.type];
  return intervals.map(interval => transposeNote(scale.root, interval));
}

// Scale degree (1-7) to chord quality mapping
export const SCALE_DEGREE_CHORDS: Record<ScaleType, ChordQuality[]> = {
  major: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
  minor: ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
};

// Roman numeral notation for scale degrees
export const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

// Get chord from scale degree (1-7)
export function getChordFromDegree(scale: Scale, degree: number): Chord {
  if (degree < 1 || degree > 7) {
    throw new Error('Scale degree must be between 1 and 7');
  }

  const notes = getScaleNotes(scale);
  const root = notes[degree - 1];
  const quality = SCALE_DEGREE_CHORDS[scale.type][degree - 1];

  return {
    root,
    quality,
    inversion: 0,
  };
}

// Get Roman numeral for scale degree
export function getRomanNumeral(scale: Scale, degree: number): string {
  if (degree < 1 || degree > 7) {
    throw new Error('Scale degree must be between 1 and 7');
  }

  const quality = SCALE_DEGREE_CHORDS[scale.type][degree - 1];
  const numeral = ROMAN_NUMERALS[degree - 1];

  // Lowercase for minor and diminished
  if (quality === 'minor') {
    return numeral.toLowerCase();
  } else if (quality === 'diminished') {
    return numeral.toLowerCase() + '°';
  }

  return numeral;
}

// Transpose a scale
export function transposeScale(scale: Scale, semitones: number): Scale {
  return {
    ...scale,
    root: transposeNote(scale.root, semitones),
  };
}
