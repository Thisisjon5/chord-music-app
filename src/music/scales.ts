// Scale definitions and utilities

import { NoteName, transposeNote, NOTE_NAMES } from './utils';
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

// Get Nashville number for a chord relative to a scale
export function getNashvilleNumber(chord: Chord, scale: Scale): string {
  const { root, quality, inversion } = chord;

  // Calculate semitones from scale root to chord root
  const scaleRootIndex = NOTE_NAMES.indexOf(scale.root);
  const chordRootIndex = NOTE_NAMES.indexOf(root);
  const semitones = (chordRootIndex - scaleRootIndex + 12) % 12;

  // Map semitones to scale degree and accidental
  const scaleIntervals = SCALE_INTERVALS[scale.type];

  // Find the closest scale degree
  let degree = 0;
  let accidental = '';

  // Check if it's a natural scale degree
  const naturalDegreeIndex = scaleIntervals.indexOf(semitones);
  if (naturalDegreeIndex !== -1) {
    degree = naturalDegreeIndex + 1;
  } else {
    // Find the closest scale degree for chromatic notes
    // Check if it's a flat of a scale degree
    for (let i = 0; i < scaleIntervals.length; i++) {
      if (scaleIntervals[i] === semitones + 1) {
        degree = i + 1;
        accidental = 'b';
        break;
      }
      if (scaleIntervals[i] === semitones - 1) {
        degree = i + 1;
        accidental = '#';
        break;
      }
    }
    // Fallback: map by closest semitone position
    if (degree === 0) {
      // Use chromatic mapping
      const chromaticDegrees = [1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6, 7];
      const chromaticAccidentals = ['', '#', '', '#', '', '', '#', '', '#', '', '#', ''];
      degree = chromaticDegrees[semitones];
      accidental = chromaticAccidentals[semitones];
    }
  }

  // Get the Roman numeral
  let numeral = ROMAN_NUMERALS[degree - 1];

  // Determine case based on chord quality
  const isMinorish = quality === 'minor' || quality === 'minor7' || quality === 'diminished';
  if (isMinorish) {
    numeral = numeral.toLowerCase();
  }

  // Build quality suffix
  let qualitySuffix = '';
  switch (quality) {
    case 'major':
      qualitySuffix = '';
      break;
    case 'minor':
      qualitySuffix = '';  // Already lowercase
      break;
    case 'diminished':
      qualitySuffix = '°';
      break;
    case 'augmented':
      qualitySuffix = '+';
      break;
    case 'sus2':
      qualitySuffix = 'sus2';
      break;
    case 'sus4':
      qualitySuffix = 'sus4';
      break;
    case 'major7':
      qualitySuffix = 'maj7';
      break;
    case 'minor7':
      qualitySuffix = '7';  // lowercase numeral + 7
      break;
    case 'dominant7':
      qualitySuffix = '7';
      break;
  }

  // Inversion symbols
  const inversionSymbols = ['', '¹', '²', '³'];

  return `${accidental}${numeral}${qualitySuffix}${inversionSymbols[inversion]}`;
}
