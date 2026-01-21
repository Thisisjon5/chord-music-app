// Voice leading algorithm - smooth transitions between chords

import { noteToMidi, midiToFrequency } from '../music/utils';
import { Chord, getChordNotesWithOctave } from '../music/chords';

export interface VoicedChord {
  frequencies: number[];
  chord: Chord;
}

// Cache for voicings
const voicingCache = new Map<string, VoicedChord>();

// Get cache key for a chord
function getCacheKey(chord: Chord, transpose: number): string {
  return `${chord.root}-${chord.quality}-${chord.inversion}-${transpose}`;
}

// Calculate the total voice leading distance between two sets of MIDI notes
function calculateVoiceLeadingDistance(fromNotes: number[], toNotes: number[]): number {
  if (fromNotes.length !== toNotes.length) {
    return Infinity;
  }

  // Sort both arrays
  const sorted1 = [...fromNotes].sort((a, b) => a - b);
  const sorted2 = [...toNotes].sort((a, b) => a - b);

  // Calculate total semitone distance
  return sorted2.reduce((sum, note, i) => sum + Math.abs(note - sorted1[i]), 0);
}

// Find the best octave placement for smooth voice leading
function findBestVoicing(chord: Chord, previousMidiNotes: number[] | null): number[] {
  // Try different base octaves
  const octavesToTry = [3, 4, 5];
  let bestVoicing: number[] = [];
  let bestDistance = Infinity;

  for (const baseOctave of octavesToTry) {
    const notesWithOctave = getChordNotesWithOctave(chord, baseOctave);
    const midiNotes = notesWithOctave.map(({ note, octave }) => noteToMidi(note, octave));

    if (!previousMidiNotes) {
      // No previous chord, just use middle octave
      if (baseOctave === 4) {
        return midiNotes;
      }
      continue;
    }

    const distance = calculateVoiceLeadingDistance(previousMidiNotes, midiNotes);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestVoicing = midiNotes;
    }
  }

  return bestVoicing.length > 0 ? bestVoicing :
    getChordNotesWithOctave(chord, 4).map(({ note, octave }) => noteToMidi(note, octave));
}

// Voice a chord with smooth voice leading
export function voiceChord(
  chord: Chord,
  previousVoicing: VoicedChord | null,
  transpose: number = 0
): VoicedChord {
  // Check cache
  const cacheKey = getCacheKey(chord, transpose);
  const cached = voicingCache.get(cacheKey);

  // If we have a cached voicing and no previous chord to lead from, use it
  if (cached && !previousVoicing) {
    return cached;
  }

  // Find best voicing
  const previousMidiNotes = previousVoicing?.frequencies.map(f => {
    // Convert frequency back to MIDI
    return Math.round(12 * Math.log2(f / 440) + 69);
  }) || null;

  let midiNotes = findBestVoicing(chord, previousMidiNotes);

  // Apply transpose
  if (transpose !== 0) {
    midiNotes = midiNotes.map(midi => midi + transpose);
  }

  // Convert to frequencies
  const frequencies = midiNotes.map(midiToFrequency);

  const voicing: VoicedChord = { frequencies, chord };

  // Cache it
  voicingCache.set(cacheKey, voicing);

  return voicing;
}

// Clear the voicing cache
export function clearVoicingCache(): void {
  voicingCache.clear();
}
